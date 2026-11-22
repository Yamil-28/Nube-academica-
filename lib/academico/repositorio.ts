
import "server-only";

import { prisma } from "@/lib/prisma";
import {
  etiquetaMateria,
  nombrePeriodo,
  type AsignacionDetallada,
  type DatosMateria,
  type Docente,
  type Semestre,
} from "@/lib/academico/tipos";

/* ==========================================
   GESTIÓN ACADÉMICA - REPOSITORIO DE DATOS
   ------------------------------------------
   ÚNICO archivo que accede a los datos del módulo.
   Tablas en PostgreSQL (Prisma):
     periodos_academicos, materias, asignaciones_docentes
   Las pantallas y acciones solo usan estas funciones.
========================================== */

export const USANDO_DATOS_DE_PRUEBA = false;

// Error de regla de negocio: su mensaje se muestra al usuario
export class ErrorNegocio extends Error {}

const ORDEN_PERIODOS = [{ gestion: "desc" as const }, { semestre: "desc" as const }];

/* ==========================================
   DOCENTES (TABLA `usuarios`)
========================================== */

export async function listarDocentes(soloActivos = false): Promise<Docente[]> {
  return prisma.usuario.findMany({
    where: { rol: "DOCENTE", ...(soloActivos ? { activo: true } : {}) },
    orderBy: { nombre: "asc" },
    select: { id: true, nombre: true, usuario: true, activo: true },
  });
}

/* ==========================================
   PERIODOS ACADÉMICOS
========================================== */

export async function listarPeriodos(soloActivos = false) {
  return prisma.periodoAcademico.findMany({
    where: soloActivos ? { activo: true } : {},
    orderBy: ORDEN_PERIODOS,
  });
}

export async function obtenerPeriodoVigente() {
  return prisma.periodoAcademico.findFirst({ where: { vigente: true } });
}

export async function crearPeriodo(datos: { gestion: number; semestre: Semestre }) {
  const repetido = await prisma.periodoAcademico.findUnique({
    where: { gestion_semestre: datos },
  });

  if (repetido) {
    throw new ErrorNegocio(`El periodo ${nombrePeriodo(datos)} ya está registrado.`);
  }

  // Si no hay periodo vigente, el nuevo pasa a serlo
  const hayVigente = await prisma.periodoAcademico.count({ where: { vigente: true } });

  return prisma.periodoAcademico.create({
    data: { ...datos, vigente: hayVigente === 0 },
  });
}

export async function establecerPeriodoVigente(id: number) {
  const periodo = await prisma.periodoAcademico.findUnique({ where: { id } });

  if (!periodo) throw new ErrorNegocio("El periodo no existe.");
  if (!periodo.activo) {
    throw new ErrorNegocio("Activa el periodo antes de marcarlo como vigente.");
  }

  // Solo un periodo vigente a la vez (operación atómica)
  await prisma.$transaction([
    prisma.periodoAcademico.updateMany({ data: { vigente: false } }),
    prisma.periodoAcademico.update({ where: { id }, data: { vigente: true } }),
  ]);
}

export async function cambiarEstadoPeriodo(id: number) {
  const periodo = await prisma.periodoAcademico.findUnique({ where: { id } });

  if (!periodo) throw new ErrorNegocio("El periodo no existe.");
  if (periodo.vigente && periodo.activo) {
    throw new ErrorNegocio(
      "No puedes desactivar el periodo vigente. Marca otro como vigente primero."
    );
  }

  await prisma.periodoAcademico.update({
    where: { id },
    data: { activo: !periodo.activo },
  });
}

/* ==========================================
   MATERIAS
========================================== */

export async function listarMaterias(
  filtros: { busqueda?: string; nivel?: number; soloActivas?: boolean } = {}
) {
  return prisma.materia.findMany({
    where: {
      ...(filtros.soloActivas ? { activa: true } : {}),
      ...(filtros.nivel ? { nivel: filtros.nivel } : {}),
      ...(filtros.busqueda
        ? {
            OR: [
              { nombre: { contains: filtros.busqueda, mode: "insensitive" as const } },
              { codigo: { contains: filtros.busqueda, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: [{ nivel: "asc" }, { nombre: "asc" }],
  });
}

export async function obtenerMateria(id: number) {
  return prisma.materia.findUnique({ where: { id } });
}

// Código y nombre no se repiten (el código solo si se indicó)
async function verificarMateriaUnica(materia: DatosMateria, idActual?: number) {
  const otra = await prisma.materia.findFirst({
    where: {
      id: idActual ? { not: idActual } : undefined,
      OR: [
        { nombre: { equals: materia.nombre, mode: "insensitive" } },
        ...(materia.codigo ? [{ codigo: materia.codigo }] : []),
      ],
    },
  });

  if (!otra) return;

  if (materia.codigo && otra.codigo === materia.codigo) {
    throw new ErrorNegocio(`El código ${materia.codigo} ya pertenece a "${otra.nombre}".`);
  }

  throw new ErrorNegocio(`La materia "${otra.nombre}" ya está registrada.`);
}

export async function crearMateria(materia: DatosMateria) {
  await verificarMateriaUnica(materia);
  return prisma.materia.create({ data: materia });
}

export async function actualizarMateria(id: number, materia: DatosMateria) {
  const actual = await prisma.materia.findUnique({ where: { id } });
  if (!actual) throw new ErrorNegocio("La materia no existe.");

  await verificarMateriaUnica(materia, id);
  await prisma.materia.update({ where: { id }, data: materia });
}

export async function cambiarEstadoMateria(id: number) {
  const materia = await prisma.materia.findUnique({ where: { id } });
  if (!materia) throw new ErrorNegocio("La materia no existe.");

  await prisma.materia.update({ where: { id }, data: { activa: !materia.activa } });
}

/* ==========================================
   ASIGNACIONES DOCENTE - MATERIA - PERIODO
========================================== */

export async function listarAsignaciones(
  filtros: { idPeriodo?: number; idDocente?: number } = {}
): Promise<AsignacionDetallada[]> {
  const asignaciones = await prisma.asignacionDocente.findMany({
    where: {
      ...(filtros.idPeriodo ? { idPeriodo: filtros.idPeriodo } : {}),
      ...(filtros.idDocente ? { idDocente: filtros.idDocente } : {}),
    },
    include: {
      periodo: true,
      materia: true,
      docente: { select: { id: true, nombre: true, usuario: true, activo: true } },
    },
    orderBy: [
      { periodo: { gestion: "desc" } },
      { periodo: { semestre: "desc" } },
      { materia: { nivel: "asc" } },
      { materia: { nombre: "asc" } },
    ],
  });

  return asignaciones.map(({ id, periodo, materia, docente }) => ({
    id,
    periodo,
    materia,
    docente,
  }));
}

export async function asignarDocente(datos: {
  idDocente: number;
  idMateria: number;
  idPeriodo: number;
}) {
  const [docente, materia, periodo] = await Promise.all([
    prisma.usuario.findFirst({
      where: { id: datos.idDocente, rol: "DOCENTE" },
      select: { activo: true },
    }),
    prisma.materia.findUnique({ where: { id: datos.idMateria } }),
    prisma.periodoAcademico.findUnique({ where: { id: datos.idPeriodo } }),
  ]);

  if (!docente) throw new ErrorNegocio("El docente seleccionado no existe.");
  if (!docente.activo) throw new ErrorNegocio("El docente seleccionado está inactivo.");
  if (!materia) throw new ErrorNegocio("La materia seleccionada no existe.");
  if (!materia.activa) throw new ErrorNegocio("La materia seleccionada está inactiva.");
  if (!periodo) throw new ErrorNegocio("El periodo seleccionado no existe.");
  if (!periodo.activo) throw new ErrorNegocio("El periodo seleccionado está inactivo.");

  const repetida = await prisma.asignacionDocente.findUnique({
    where: { idDocente_idMateria_idPeriodo: datos },
  });

  if (repetida) {
    throw new ErrorNegocio(
      `Ese docente ya tiene asignada "${etiquetaMateria(materia)}" en ${nombrePeriodo(periodo)}.`
    );
  }

  await prisma.asignacionDocente.create({ data: datos });
}

export async function quitarAsignacion(id: number) {
  const asignacion = await prisma.asignacionDocente.findUnique({ where: { id } });
  if (!asignacion) throw new ErrorNegocio("La asignación no existe.");

  await prisma.asignacionDocente.delete({ where: { id } });
}
