// LÓGICA DE NEGOCIO de la Nube Académica. No depende de Next ni de HTTP: se puede llamar
// desde una route, una Server Action, un script o un test.
import { randomUUID } from "node:crypto";
import type { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { almacenamiento } from "./almacenamiento";
import { resolverRelacion } from "./acceso";
import { registrarActividad } from "./auditoria";
import { clasificar, CUOTA_DEFECTO, extensionDe, limpiarNombre, validarArchivo } from "./archivos";
import { etiquetaUsuario } from "./contexto";
import { permisosDe, puede } from "./politica";
import {
  ErrorNube, type Accion, type ArchivoDTO, type Contexto, type ContenidoDTO, type CuotaDTO,
  type CompartidoDTO, type MigaDTO, type NivelPermiso, type PermisoDTO, type Relacion, type ResumenCuotaDTO, type ResumenCuotaMateriaDTO, type UsuarioListaDTO, type VersionDTO,
} from "./tipos";

/* ===================== Autorización ===================== */

async function exigirProyecto(ctx: Contexto, proyectoId: number, accion: Accion): Promise<Relacion> {
  const rel = await resolverRelacion(ctx.usuario, proyectoId);
  if (!rel) throw new ErrorNube(404, "NO_ENCONTRADO", "Proyecto no encontrado");
  if (!puede(rel, accion)) throw new ErrorNube(403, "SIN_PERMISO", "No tienes permiso para esta acción");
  return rel;
}

/** Carga un archivo verificando permiso por proyecto o por archivo compartido (RF08). */
async function cargarArchivo(ctx: Contexto, archivoId: number, accion: Accion) {
  const archivo = await prisma.archivo.findFirst({
    where: { id: archivoId, eliminadoEn: null },
    include: { permisos: { where: { usuarioId: ctx.usuario.id } }, tipoRecurso: true },
  });
  if (!archivo) throw new ErrorNube(404, "NO_ENCONTRADO", "Archivo no encontrado");
  const rel = await resolverRelacion(ctx.usuario, archivo.proyectoId);
  if (puede(rel, accion)) return archivo;
  const comp = archivo.permisos[0];
  if (comp) {
    const lectura = accion === "ver" || accion === "descargar" || accion === "verVersiones";
    if (lectura || (accion === "subir" && comp.nivel === "EDICION")) return archivo;
  }
  throw rel ? new ErrorNube(403, "SIN_PERMISO", "No tienes permiso para esta acción")
            : new ErrorNube(404, "NO_ENCONTRADO", "Archivo no encontrado");
}

/* ===================== Cuota ===================== */

export async function cuotaDeProyecto(proyectoId: number, db: Prisma.TransactionClient = prisma): Promise<CuotaDTO> {
  const [uso, cuota] = await Promise.all([
    db.versionArchivo.aggregate({
      _sum: { tamanoBytes: true }, where: { archivo: { proyectoId, eliminadoEn: null } },
    }),
    db.cuotaAlmacenamiento.findUnique({ where: { proyectoId } }),
  ]);
  return {
    usoBytes: Number(uso._sum.tamanoBytes ?? 0),
    limiteBytes: cuota ? Number(cuota.limiteBytes) : CUOTA_DEFECTO,
  };
}

async function bloquearMateria(db: Prisma.TransactionClient, materiaId: number) {
  const [materia] = await db.$queryRaw<{ limiteNubeBytes: bigint | null }[]>
    `SELECT "limiteNubeBytes" FROM "materias" WHERE id = ${materiaId} FOR UPDATE`;
  if (!materia) throw new ErrorNube(404, "MATERIA_NO_ENCONTRADA", "Materia no encontrada");
  return materia.limiteNubeBytes;
}

async function usoMateria(db: Prisma.TransactionClient, materiaId: number) {
  const { _sum } = await db.versionArchivo.aggregate({
    _sum: { tamanoBytes: true },
    where: { archivo: { eliminadoEn: null, proyecto: { materiaId } } },
  });
  return _sum.tamanoBytes ?? BigInt(0);
}

async function exigirEspacio(db: Prisma.TransactionClient, proyectoId: number, bytes: number) {
  const proyecto = await db.proyecto.findUnique({ where: { id: proyectoId }, select: { materiaId: true } });
  if (!proyecto) throw new ErrorNube(404, "NO_ENCONTRADO", "Proyecto no encontrado");
  const limiteMateria = await bloquearMateria(db, proyecto.materiaId);
  if (limiteMateria !== null && (await usoMateria(db, proyecto.materiaId)) + BigInt(bytes) > limiteMateria) {
    throw new ErrorNube(413, "CUOTA_MATERIA_EXCEDIDA", "La materia no tiene espacio suficiente. Pide al administrador ampliar la cuota.");
  }
  const c = await cuotaDeProyecto(proyectoId, db);
  if (c.usoBytes + bytes > c.limiteBytes)
    throw new ErrorNube(413, "CUOTA_EXCEDIDA", "El proyecto no tiene espacio suficiente. Pide al administrador ampliar la cuota.");
}

export async function fijarCuota(ctx: Contexto, proyectoId: number, limiteBytes: number) {
  await exigirProyecto(ctx, proyectoId, "administrarCuota");
  if (!Number.isSafeInteger(limiteBytes) || limiteBytes <= 0) throw new ErrorNube(400, "CUOTA_INVALIDA", "Límite inválido");
  await prisma.$transaction(async (tx) => {
    const proyecto = await tx.proyecto.findUniqueOrThrow({ where: { id: proyectoId }, select: { materiaId: true } });
    await bloquearMateria(tx, proyecto.materiaId);
    const { usoBytes } = await cuotaDeProyecto(proyectoId, tx);
    if (limiteBytes < usoBytes) throw new ErrorNube(400, "CUOTA_MENOR_AL_USO", "El límite no puede ser menor al espacio ya usado");
    await tx.cuotaAlmacenamiento.upsert({
      where: { proyectoId },
      update: { limiteBytes: BigInt(limiteBytes), administradorId: ctx.usuario.id, fechaAsignacion: new Date() },
      create: { proyectoId, limiteBytes: BigInt(limiteBytes), administradorId: ctx.usuario.id },
    });
  });
  await registrarActividad(ctx, "FIJAR_CUOTA", "proyecto", proyectoId, { limiteBytes });
}

export async function resumenCuotas(ctx: Contexto): Promise<ResumenCuotaDTO[]> {
  if (ctx.usuario.rol !== "ADMINISTRADOR") throw new ErrorNube(403, "SIN_PERMISO", "Solo el administrador");
  const proyectos = await prisma.proyecto.findMany({
    orderBy: { titulo: "asc" },
    select: { id: true, titulo: true, materia: { select: { nombre: true, limiteNubeBytes: true } } },
  });
  return Promise.all(proyectos.map(async ({ id, titulo, materia }) => ({
    proyectoId: id,
    titulo,
    materia: materia.nombre,
    limiteMateriaBytes: materia.limiteNubeBytes === null ? null : Number(materia.limiteNubeBytes),
    ...(await cuotaDeProyecto(id)),
  })));
}

export async function resumenCuotasMaterias(ctx: Contexto): Promise<ResumenCuotaMateriaDTO[]> {
  if (ctx.usuario.rol !== "ADMINISTRADOR") throw new ErrorNube(403, "SIN_PERMISO", "Solo el administrador");
  const materias = await prisma.materia.findMany({
    orderBy: [{ nivel: "asc" }, { nombre: "asc" }],
    select: { id: true, nombre: true, codigo: true, nivel: true, activa: true, limiteNubeBytes: true, _count: { select: { proyectos: true } } },
  });
  return Promise.all(materias.map(async ({ id, limiteNubeBytes, _count, ...materia }) => ({
    ...materia,
    materiaId: id,
    proyectos: _count.proyectos,
    usoBytes: Number(await usoMateria(prisma, id)),
    limiteBytes: limiteNubeBytes === null ? null : Number(limiteNubeBytes),
  })));
}

export async function fijarCuotaMateria(ctx: Contexto, materiaId: number, limiteBytes: number | null) {
  if (ctx.usuario.rol !== "ADMINISTRADOR") throw new ErrorNube(403, "SIN_PERMISO", "Solo el administrador");
  if (limiteBytes !== null && (!Number.isSafeInteger(limiteBytes) || limiteBytes <= 0)) {
    throw new ErrorNube(400, "CUOTA_INVALIDA", "El límite debe ser un número de bytes mayor que cero");
  }
  const limite = limiteBytes === null ? null : BigInt(limiteBytes);
  await prisma.$transaction(async (tx) => {
    await bloquearMateria(tx, materiaId);
    if (limite !== null && limite < await usoMateria(tx, materiaId)) {
      throw new ErrorNube(400, "CUOTA_MENOR_AL_USO", "El límite no puede ser menor al espacio ya usado por la materia");
    }
    await tx.materia.update({ where: { id: materiaId }, data: { limiteNubeBytes: limite } });
  });
  await registrarActividad(ctx, "FIJAR_CUOTA_MATERIA", "materia", materiaId, { limiteBytes });
}

/* ===================== Explorador ===================== */

export async function listarContenido(ctx: Contexto, proyectoId: number, carpetaId: number | null): Promise<ContenidoDTO> {
  const rel = await exigirProyecto(ctx, proyectoId, "ver");
  const ruta: MigaDTO[] = [{ id: null, nombre: "Raíz" }];
  if (carpetaId) {
    const cadena: MigaDTO[] = [];
    let actual: number | null = carpetaId;
    for (let i = 0; actual && i < 50; i++) {
      const c: { id: number; nombre: string; carpetaPadreId: number | null } | null =
        await prisma.carpeta.findFirst({ where: { id: actual, proyectoId, eliminadaEn: null } });
      if (!c) throw new ErrorNube(404, "NO_ENCONTRADO", "Carpeta no encontrada");
      cadena.unshift({ id: c.id, nombre: c.nombre });
      actual = c.carpetaPadreId;
    }
    ruta.push(...cadena);
  }
  const [carpetas, archivos, cuota] = await Promise.all([
    prisma.carpeta.findMany({ where: { proyectoId, carpetaPadreId: carpetaId, eliminadaEn: null }, orderBy: { nombre: "asc" } }),
    prisma.archivo.findMany({
      where: { proyectoId, carpetaId, eliminadoEn: null }, include: { tipoRecurso: true }, orderBy: { nombre: "asc" },
    }),
    cuotaDeProyecto(proyectoId),
  ]);
  return {
    proyectoId, carpetaId, ruta, cuota, permisos: permisosDe(rel),
    carpetas: carpetas.map((c) => ({ id: c.id, nombre: c.nombre, creadaEn: c.creadaEn.toISOString() })),
    archivos: archivos.map((a): ArchivoDTO => ({
      id: a.id, nombre: a.nombre, extension: a.extension, tipo: a.tipoRecurso?.nombre ?? null,
      tamanoBytes: Number(a.tamanoBytes), versionActual: a.versionActual,
      propietarioId: a.propietarioId, actualizadoEn: a.actualizadoEn.toISOString(),
    })),
  };
}

/* ===================== Carpetas ===================== */

async function exigirCarpeta(proyectoId: number, carpetaId: number | null) {
  if (carpetaId === null) return;
  const c = await prisma.carpeta.findFirst({ where: { id: carpetaId, proyectoId, eliminadaEn: null } });
  if (!c) throw new ErrorNube(404, "NO_ENCONTRADO", "Carpeta no encontrada");
}

export async function crearCarpeta(ctx: Contexto, d: { proyectoId: number; carpetaPadreId: number | null; nombre: unknown }) {
  await exigirProyecto(ctx, d.proyectoId, "crearCarpeta");
  const nombre = limpiarNombre(d.nombre);
  await exigirCarpeta(d.proyectoId, d.carpetaPadreId);
  const repetida = await prisma.carpeta.findFirst({
    where: { proyectoId: d.proyectoId, carpetaPadreId: d.carpetaPadreId, nombre, eliminadaEn: null },
  });
  if (repetida) throw new ErrorNube(409, "DUPLICADO", "Ya existe una carpeta con ese nombre aquí");
  const c = await prisma.carpeta.create({
    data: { proyectoId: d.proyectoId, carpetaPadreId: d.carpetaPadreId, nombre, creadaPorId: ctx.usuario.id },
  });
  await registrarActividad(ctx, "CREAR_CARPETA", "carpeta", c.id, { nombre });
  return { id: c.id, nombre: c.nombre, creadaEn: c.creadaEn.toISOString() };
}

async function cargarCarpeta(ctx: Contexto, id: number, accion: Accion) {
  const c = await prisma.carpeta.findFirst({ where: { id, eliminadaEn: null } });
  if (!c) throw new ErrorNube(404, "NO_ENCONTRADO", "Carpeta no encontrada");
  await exigirProyecto(ctx, c.proyectoId, accion);
  return c;
}

export async function renombrarCarpeta(ctx: Contexto, id: number, nombreNuevo: unknown) {
  const c = await cargarCarpeta(ctx, id, "renombrar");
  const nombre = limpiarNombre(nombreNuevo);
  const repetida = await prisma.carpeta.findFirst({
    where: { proyectoId: c.proyectoId, carpetaPadreId: c.carpetaPadreId, nombre, eliminadaEn: null, NOT: { id } },
  });
  if (repetida) throw new ErrorNube(409, "DUPLICADO", "Ya existe una carpeta con ese nombre aquí");
  await prisma.carpeta.update({ where: { id }, data: { nombre } });
  await registrarActividad(ctx, "RENOMBRAR_CARPETA", "carpeta", id, { anterior: c.nombre, nuevo: nombre });
}

/** Eliminación lógica de la carpeta y todo su contenido (recuperable por el administrador de BD). */
export async function eliminarCarpeta(ctx: Contexto, id: number) {
  const c = await cargarCarpeta(ctx, id, "eliminar");
  const ids = [id];
  let frente = [id];
  while (frente.length) {
    const hijas = await prisma.carpeta.findMany({
      where: { proyectoId: c.proyectoId, carpetaPadreId: { in: frente }, eliminadaEn: null }, select: { id: true },
    });
    frente = hijas.map((h) => h.id);
    ids.push(...frente);
  }
  const ahora = new Date();
  await prisma.$transaction([
    prisma.carpeta.updateMany({ where: { id: { in: ids } }, data: { eliminadaEn: ahora } }),
    prisma.archivo.updateMany({ where: { carpetaId: { in: ids }, eliminadoEn: null }, data: { eliminadoEn: ahora } }),
  ]);
  await registrarActividad(ctx, "ELIMINAR_CARPETA", "carpeta", id, { nombre: c.nombre, carpetasAfectadas: ids.length });
}

/* ===================== Archivos ===================== */

type ArchivoParaSubir = Pick<File, "name" | "size" | "type"> & {
  stream(): ReadableStream<Uint8Array> | Promise<ReadableStream<Uint8Array>>;
};

async function guardarBlob(proyectoId: number, archivo: ArchivoParaSubir): Promise<string> {
  const clave = `proyectos/${proyectoId}/${randomUUID()}`;
  await almacenamiento.guardar(clave, await archivo.stream());
  return clave;
}

export async function autorizarCargaDirecta(ctx: Contexto, destino: { proyectoId: number; carpetaId: number | null } | { archivoId: number }, nombre: string, bytes: number) {
  if ("archivoId" in destino) {
    const archivo = await cargarArchivo(ctx, destino.archivoId, "subir");
    validarArchivo(archivo.nombre, bytes);
    await exigirEspacio(prisma, archivo.proyectoId, bytes);
  } else {
    await exigirProyecto(ctx, destino.proyectoId, "subir");
    validarArchivo(limpiarNombre(nombre), bytes);
    await exigirCarpeta(destino.proyectoId, destino.carpetaId);
    await exigirEspacio(prisma, destino.proyectoId, bytes);
  }
}

export async function subirArchivo(ctx: Contexto, d: { proyectoId: number; carpetaId: number | null; archivo: ArchivoParaSubir; comentario?: string | null }) {
  await exigirProyecto(ctx, d.proyectoId, "subir");
  const nombre = limpiarNombre(d.archivo.name);
  validarArchivo(nombre, d.archivo.size);
  await exigirCarpeta(d.proyectoId, d.carpetaId);
  const repetido = await prisma.archivo.findFirst({
    where: { proyectoId: d.proyectoId, carpetaId: d.carpetaId, nombre, eliminadoEn: null },
  });
  if (repetido) throw new ErrorNube(409, "DUPLICADO", "Ya existe un archivo con ese nombre. Súbelo como nueva versión.");

  const ext = extensionDe(nombre);
  const tipo = await prisma.tipoRecurso.upsert({ where: { nombre: clasificar(ext) }, update: {}, create: { nombre: clasificar(ext) } });
  const clave = await guardarBlob(d.proyectoId, d.archivo);
  try {
    const bytes = BigInt(d.archivo.size);
    const a = await prisma.$transaction(async (tx) => {
      await exigirEspacio(tx, d.proyectoId, d.archivo.size);
      return tx.archivo.create({
        data: {
          proyectoId: d.proyectoId, carpetaId: d.carpetaId, tipoRecursoId: tipo.id, propietarioId: ctx.usuario.id,
          nombre, extension: ext, mime: d.archivo.type || null, tamanoBytes: bytes,
          versiones: { create: { usuarioId: ctx.usuario.id, numeroVersion: 1, claveAlmacenamiento: clave, tamanoBytes: bytes, mime: d.archivo.type || null, comentario: d.comentario?.trim() || null } },
        },
      });
    });
    await registrarActividad(ctx, "SUBIR_ARCHIVO", "archivo", a.id, { nombre, bytes: d.archivo.size });
    return { id: a.id, nombre };
  } catch (e) {
    await almacenamiento.eliminar(clave); // no dejar blobs huérfanos
    throw e;
  }
}

export async function subirVersion(ctx: Contexto, archivoId: number, archivo: ArchivoParaSubir, comentario?: string | null) {
  const a = await cargarArchivo(ctx, archivoId, "subir");
  validarArchivo(a.nombre, archivo.size);
  const clave = await guardarBlob(a.proyectoId, archivo);
  let numero: number;
  try {
    const bytes = BigInt(archivo.size);
    numero = await prisma.$transaction(async (tx) => {
      await exigirEspacio(tx, a.proyectoId, archivo.size);
      const actual = await tx.archivo.findFirst({ where: { id: archivoId, eliminadoEn: null } });
      if (!actual) throw new ErrorNube(404, "NO_ENCONTRADO", "Archivo no encontrado");
      const numero = actual.versionActual + 1;
      await tx.versionArchivo.create({
        data: { archivoId, usuarioId: ctx.usuario.id, numeroVersion: numero, claveAlmacenamiento: clave, tamanoBytes: bytes, mime: archivo.type || null, comentario: comentario?.trim() || null },
      });
      await tx.archivo.update({ where: { id: archivoId }, data: { versionActual: numero, tamanoBytes: bytes, mime: archivo.type || actual.mime } });
      return numero;
    });
  } catch (e) {
    await almacenamiento.eliminar(clave);
    throw e;
  }
  await registrarActividad(ctx, "NUEVA_VERSION", "archivo", archivoId, { numero });
  return { numero };
}

export async function descargar(ctx: Contexto, archivoId: number, numeroVersion?: number | null) {
  const a = await cargarArchivo(ctx, archivoId, "descargar");
  const v = await prisma.versionArchivo.findUnique({
    where: { archivoId_numeroVersion: { archivoId, numeroVersion: numeroVersion ?? a.versionActual } },
  });
  if (!v) throw new ErrorNube(404, "NO_ENCONTRADO", "Versión no encontrada");
  const stream = await almacenamiento.leer(v.claveAlmacenamiento).catch(() => {
    throw new ErrorNube(404, "BLOB_NO_ENCONTRADO", "El contenido del archivo no está disponible");
  });
  await registrarActividad(ctx, "DESCARGAR_ARCHIVO", "archivo", archivoId, { version: v.numeroVersion });
  return { stream, nombre: a.nombre, mime: v.mime ?? a.mime ?? "application/octet-stream", bytes: Number(v.tamanoBytes) };
}

export async function actualizarArchivo(ctx: Contexto, archivoId: number, cambios: { nombre?: unknown; carpetaId?: number | null }) {
  const a = await cargarArchivo(ctx, archivoId, "renombrar");
  const nombre = cambios.nombre !== undefined ? limpiarNombre(cambios.nombre) : a.nombre;
  const carpetaId = cambios.carpetaId !== undefined ? cambios.carpetaId : a.carpetaId;
  await exigirCarpeta(a.proyectoId, carpetaId);
  const repetido = await prisma.archivo.findFirst({
    where: { proyectoId: a.proyectoId, carpetaId, nombre, eliminadoEn: null, NOT: { id: archivoId } },
  });
  if (repetido) throw new ErrorNube(409, "DUPLICADO", "Ya existe un archivo con ese nombre en el destino");
  await prisma.archivo.update({ where: { id: archivoId }, data: { nombre, carpetaId, extension: extensionDe(nombre) } });
  await registrarActividad(ctx, "ACTUALIZAR_ARCHIVO", "archivo", archivoId, { nombre, carpetaId });
}

export async function eliminarArchivo(ctx: Contexto, archivoId: number) {
  const a = await cargarArchivo(ctx, archivoId, "eliminar");
  await prisma.archivo.update({ where: { id: archivoId }, data: { eliminadoEn: new Date() } });
  await registrarActividad(ctx, "ELIMINAR_ARCHIVO", "archivo", archivoId, { nombre: a.nombre });
}

/* ===================== Versiones (RF09) ===================== */

export async function listarVersiones(ctx: Contexto, archivoId: number): Promise<VersionDTO[]> {
  const a = await cargarArchivo(ctx, archivoId, "verVersiones");
  const versiones = await prisma.versionArchivo.findMany({ where: { archivoId }, orderBy: { numeroVersion: "desc" } });
  const usuarios = await prisma.usuario.findMany({ where: { id: { in: [...new Set(versiones.map((v) => v.usuarioId))] } } });
  const nombres = new Map<number, string>(usuarios.map((u): [number, string] => [u.id as number, etiquetaUsuario(u as unknown as Record<string, unknown>)]));
  return versiones.map((v) => ({
    id: v.id, numero: v.numeroVersion, tamanoBytes: Number(v.tamanoBytes), comentario: v.comentario,
    creadaEn: v.creadaEn.toISOString(), autor: nombres.get(v.usuarioId) ?? "Desconocido", esActual: v.numeroVersion === a.versionActual,
  }));
}

/* ===================== Compartir (RF08) ===================== */

export async function listarPermisos(ctx: Contexto, archivoId: number): Promise<PermisoDTO[]> {
  await cargarArchivo(ctx, archivoId, "compartir");
  const permisos = await prisma.permisoArchivo.findMany({ where: { archivoId }, include: { usuario: true } });
  return permisos.map((p) => ({
    usuarioId: p.usuarioId, nivel: p.nivel as NivelPermiso,
    etiqueta: etiquetaUsuario(p.usuario as unknown as Record<string, unknown>),
  }));
}

export async function compartirArchivo(ctx: Contexto, archivoId: number, usuarioId: number, nivel: NivelPermiso) {
  await cargarArchivo(ctx, archivoId, "compartir");
  if (nivel !== "LECTURA" && nivel !== "EDICION") throw new ErrorNube(400, "NIVEL_INVALIDO", "Nivel de permiso inválido");
  if (usuarioId === ctx.usuario.id) throw new ErrorNube(400, "AUTO_PERMISO", "No puedes compartir contigo mismo");
  const destino = await prisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!destino) throw new ErrorNube(404, "USUARIO_NO_ENCONTRADO", "El usuario no existe");
  await prisma.permisoArchivo.upsert({
    where: { archivoId_usuarioId: { archivoId, usuarioId } },
    update: { nivel, otorgadoPorId: ctx.usuario.id },
    create: { archivoId, usuarioId, nivel, otorgadoPorId: ctx.usuario.id },
  });
  await registrarActividad(ctx, "COMPARTIR_ARCHIVO", "archivo", archivoId, { usuarioId, nivel });
}

export async function quitarPermiso(ctx: Contexto, archivoId: number, usuarioId: number) {
  await cargarArchivo(ctx, archivoId, "compartir");
  await prisma.permisoArchivo.deleteMany({ where: { archivoId, usuarioId } });
  await registrarActividad(ctx, "QUITAR_PERMISO", "archivo", archivoId, { usuarioId });
}

/** Archivos que otras personas compartieron con el usuario actual ("Compartidos conmigo"). */
export async function listarCompartidosConmigo(ctx: Contexto): Promise<CompartidoDTO[]> {
  const permisos = await prisma.permisoArchivo.findMany({
    where: { usuarioId: ctx.usuario.id, archivo: { eliminadoEn: null } },
    include: { archivo: { include: { proyecto: true, tipoRecurso: true } } },
    orderBy: { creadoEn: "desc" },
  });
  const otorgantes = await prisma.usuario.findMany({ where: { id: { in: [...new Set(permisos.map((p) => p.otorgadoPorId))] } } });
  const nombres = new Map<number, string>(otorgantes.map((u): [number, string] => [u.id as number, etiquetaUsuario(u as unknown as Record<string, unknown>)]));
  return permisos.map((p): CompartidoDTO => ({
    archivoId: p.archivoId, nombre: p.archivo.nombre, extension: p.archivo.extension,
    tipo: p.archivo.tipoRecurso?.nombre ?? null, tamanoBytes: Number(p.archivo.tamanoBytes),
    versionActual: p.archivo.versionActual, proyecto: p.archivo.proyecto.titulo,
    compartidoPor: nombres.get(p.otorgadoPorId) ?? "Desconocido", nivel: p.nivel as NivelPermiso,
    fecha: p.creadoEn.toISOString(),
  }));
}

/** Personas con quienes se puede compartir (lista del diálogo "Compartir"). */
export async function listarUsuariosCompartibles(ctx: Contexto): Promise<UsuarioListaDTO[]> {
  if (ctx.usuario.rol === "ADMINISTRADOR") throw new ErrorNube(403, "SIN_PERMISO", "No disponible para el administrador");
  const us = await prisma.usuario.findMany({ where: { activo: true, NOT: { id: ctx.usuario.id } }, orderBy: { nombre: "asc" } });
  return us.map((u) => ({ id: u.id as number, nombre: String(u.nombre), usuario: String(u.usuario), rol: u.rol as UsuarioListaDTO["rol"] }));
}
