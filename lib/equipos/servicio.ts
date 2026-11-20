import "server-only";

import { prisma } from "@/lib/prisma";

import type { Equipo, ErrorEquipo, Resultado, RolEquipo } from "./tipos";

// ---- Ayudas internas ----

const conMiembros = {
  miembros: { orderBy: { fechaIngreso: "asc" as const } },
};

function fallo(error: ErrorEquipo): { ok: false; error: ErrorEquipo } {
  return { ok: false, error };
}

function exito<T>(datos: T): { ok: true; datos: T } {
  return { ok: true, datos };
}

function idValido(id: number) {
  return Number.isInteger(id) && id > 0;
}

// Error de la base por un valor repetido (restricción única)
function esDuplicado(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2002"
  );
}

// El líder aparece primero
function ordenar(equipo: Equipo): Equipo {
  return {
    ...equipo,
    miembros: [...equipo.miembros].sort((a, b) =>
      a.rolEquipo === b.rolEquipo ? 0 : a.rolEquipo === "LIDER" ? -1 : 1
    ),
  };
}

async function consultarEquipoCompleto(equipoId: number) {
  return prisma.equipo.findUnique({
    where: { id: equipoId },
    include: {
      miembros: true,
      proyecto: { select: { estado: true } },
    },
  });
}

type EquipoCompleto = NonNullable<
  Awaited<ReturnType<typeof consultarEquipoCompleto>>
>;

// Comprueba que el equipo exista, que quien pide sea líder
// y que el proyecto no esté finalizado
async function cargarParaLider(
  equipoId: number,
  solicitanteId: number
): Promise<
  { ok: true; equipo: EquipoCompleto } | { ok: false; error: ErrorEquipo }
> {
  if (!idValido(equipoId)) return fallo("no_encontrado");

  const equipo = await consultarEquipoCompleto(equipoId);
  if (!equipo) return fallo("no_encontrado");

  const esLider = equipo.miembros.some(
    (m) => m.usuarioId === solicitanteId && m.rolEquipo === "LIDER"
  );
  if (!esLider) return fallo("sin_permiso");

  if (equipo.proyecto.estado === "FINALIZADO") {
    return fallo("proyecto_finalizado");
  }

  return { ok: true, equipo };
}

// ---- Consultas ----

export async function listarEquipos(): Promise<Equipo[]> {
  const filas = await prisma.equipo.findMany({
    include: conMiembros,
    orderBy: { creadoEn: "desc" },
  });

  return filas.map(ordenar);
}

export async function listarEquiposDeUsuario(
  usuarioId: number
): Promise<Equipo[]> {
  const filas = await prisma.equipo.findMany({
    where: { miembros: { some: { usuarioId } } },
    include: conMiembros,
    orderBy: { creadoEn: "desc" },
  });

  return filas.map(ordenar);
}

export async function listarEquiposDeDocente(
  docenteId: number
): Promise<Equipo[]> {
  const filas = await prisma.equipo.findMany({
    where: { proyecto: { docenteId } },
    include: conMiembros,
    orderBy: { creadoEn: "desc" },
  });

  return filas.map(ordenar);
}

export async function obtenerEquipo(id: number): Promise<Equipo | null> {
  if (!idValido(id)) return null;

  const fila = await prisma.equipo.findUnique({
    where: { id },
    include: conMiembros,
  });

  return fila ? ordenar(fila) : null;
}

// Proyectos del estudiante que aún pueden tener un equipo
export async function listarProyectosSinEquipo(
  usuarioId: number
): Promise<{ id: number; titulo: string }[]> {
  return prisma.proyecto.findMany({
    where: {
      creadoPorId: usuarioId,
      equipo: null,
      estado: { not: "FINALIZADO" },
    },
    select: { id: true, titulo: true },
    orderBy: { fechaInicio: "desc" },
  });
}

// Estudiantes activos que todavía no están en el equipo
export async function listarEstudiantesDisponibles(
  equipoId: number
): Promise<{ id: number; nombre: string; usuario: string }[]> {
  const miembros = await prisma.miembroEquipo.findMany({
    where: { equipoId },
    select: { usuarioId: true },
  });

  return prisma.usuario.findMany({
    where: {
      rol: "ESTUDIANTE",
      activo: true,
      id: { notIn: miembros.map((m) => m.usuarioId) },
    },
    select: { id: true, nombre: true, usuario: true },
    orderBy: { nombre: "asc" },
  });
}

export async function titulosDeProyectos(
  ids: number[]
): Promise<Map<number, string>> {
  if (ids.length === 0) return new Map();

  const filas = await prisma.proyecto.findMany({
    where: { id: { in: [...new Set(ids)] } },
    select: { id: true, titulo: true },
  });

  return new Map(filas.map((f) => [f.id, f.titulo]));
}

// ---- Operaciones con reglas de negocio ----

// Crea el equipo y deja a quien lo crea como líder.
// Solo el dueño del proyecto, y solo una vez por proyecto.
export async function crearEquipo(datos: {
  nombre: string;
  proyectoId: number;
  solicitanteId: number;
}): Promise<Resultado<{ equipoId: number }>> {
  if (!idValido(datos.proyectoId)) return fallo("proyecto_invalido");

  const proyecto = await prisma.proyecto.findUnique({
    where: { id: datos.proyectoId },
    select: {
      creadoPorId: true,
      estado: true,
      equipo: { select: { id: true } },
    },
  });

  if (!proyecto || proyecto.creadoPorId !== datos.solicitanteId) {
    return fallo("proyecto_invalido");
  }
  if (proyecto.estado === "FINALIZADO") return fallo("proyecto_finalizado");
  if (proyecto.equipo) return fallo("ya_tiene_equipo");

  try {
    const equipo = await prisma.equipo.create({
      data: {
        nombre: datos.nombre,
        proyectoId: datos.proyectoId,
        creadoPorId: datos.solicitanteId,
        miembros: {
          create: { usuarioId: datos.solicitanteId, rolEquipo: "LIDER" },
        },
      },
      select: { id: true },
    });

    return exito({ equipoId: equipo.id });
  } catch (error) {
    if (esDuplicado(error)) return fallo("ya_tiene_equipo");
    throw error;
  }
}

// Solo el líder. Solo estudiantes activos. Sin repetidos.
export async function agregarMiembro(datos: {
  equipoId: number;
  usuarioId: number;
  solicitanteId: number;
}): Promise<Resultado> {
  if (!idValido(datos.usuarioId)) return fallo("estudiante_invalido");

  const carga = await cargarParaLider(datos.equipoId, datos.solicitanteId);
  if (!carga.ok) return fallo(carga.error);

  const estudiante = await prisma.usuario.findFirst({
    where: { id: datos.usuarioId, rol: "ESTUDIANTE", activo: true },
    select: { id: true },
  });
  if (!estudiante) return fallo("estudiante_invalido");

  if (carga.equipo.miembros.some((m) => m.usuarioId === datos.usuarioId)) {
    return fallo("ya_es_miembro");
  }

  try {
    await prisma.miembroEquipo.create({
      data: {
        equipoId: datos.equipoId,
        usuarioId: datos.usuarioId,
        rolEquipo: "INTEGRANTE",
      },
    });

    return exito(null);
  } catch (error) {
    if (esDuplicado(error)) return fallo("ya_es_miembro");
    throw error;
  }
}

// Solo el líder. No se puede quitar al último líder.
export async function quitarMiembro(datos: {
  equipoId: number;
  usuarioId: number;
  solicitanteId: number;
}): Promise<Resultado> {
  const carga = await cargarParaLider(datos.equipoId, datos.solicitanteId);
  if (!carga.ok) return fallo(carga.error);

  const miembro = carga.equipo.miembros.find(
    (m) => m.usuarioId === datos.usuarioId
  );
  if (!miembro) return fallo("no_encontrado");

  const lideres = carga.equipo.miembros.filter(
    (m) => m.rolEquipo === "LIDER"
  ).length;

  if (miembro.rolEquipo === "LIDER" && lideres <= 1) {
    return fallo("ultimo_lider");
  }

  await prisma.miembroEquipo.delete({ where: { id: miembro.id } });

  return exito(null);
}

// Solo el líder. Sirve también para transferir el liderazgo:
// primero se asciende a otro integrante y luego se baja el rol propio.
export async function cambiarRolMiembro(datos: {
  equipoId: number;
  usuarioId: number;
  rol: RolEquipo;
  solicitanteId: number;
}): Promise<Resultado> {
  const carga = await cargarParaLider(datos.equipoId, datos.solicitanteId);
  if (!carga.ok) return fallo(carga.error);

  const miembro = carga.equipo.miembros.find(
    (m) => m.usuarioId === datos.usuarioId
  );
  if (!miembro) return fallo("no_encontrado");

  const lideres = carga.equipo.miembros.filter(
    (m) => m.rolEquipo === "LIDER"
  ).length;

  if (
    miembro.rolEquipo === "LIDER" &&
    datos.rol === "INTEGRANTE" &&
    lideres <= 1
  ) {
    return fallo("ultimo_lider");
  }

  await prisma.miembroEquipo.update({
    where: { id: miembro.id },
    data: { rolEquipo: datos.rol },
  });

  return exito(null);
}