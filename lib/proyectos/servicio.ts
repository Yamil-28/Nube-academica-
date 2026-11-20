import "server-only";

import { prisma } from "@/lib/prisma";

import type {
  Avance,
  EstadoProyecto,
  Observacion,
  Proyecto,
} from "./tipos";

// Datos que se piden al crear un proyecto
export type DatosNuevoProyecto = Omit<
  Proyecto,
  "id" | "estado" | "fechaInicio" | "fechaCierre"
>;

// En la base el semestre es un entero; en el módulo solo vale 1 o 2
type FilaProyecto = Omit<Proyecto, "semestre"> & { semestre: number };

function aProyecto(fila: FilaProyecto): Proyecto {
  return { ...fila, semestre: fila.semestre === 2 ? 2 : 1 };
}

function idValido(id: number) {
  return Number.isInteger(id) && id > 0;
}

// ---- PROYECTOS ----

export async function listarProyectos(): Promise<Proyecto[]> {
  const filas = await prisma.proyecto.findMany({
    orderBy: { fechaInicio: "desc" },
  });

  return filas.map(aProyecto);
}

// Proyectos que el usuario creó o donde es integrante del equipo
export async function listarProyectosDeUsuario(
  usuarioId: number
): Promise<Proyecto[]> {
  const filas = await prisma.proyecto.findMany({
    where: {
      OR: [
        { creadoPorId: usuarioId },
        { equipo: { miembros: { some: { usuarioId } } } },
      ],
    },
    orderBy: { fechaInicio: "desc" },
  });

  return filas.map(aProyecto);
}

export async function listarProyectosDeDocente(
  docenteId: number
): Promise<Proyecto[]> {
  const filas = await prisma.proyecto.findMany({
    where: { docenteId },
    orderBy: { fechaInicio: "desc" },
  });

  return filas.map(aProyecto);
}

export async function obtenerProyecto(id: number): Promise<Proyecto | null> {
  if (!idValido(id)) return null;

  const fila = await prisma.proyecto.findUnique({ where: { id } });

  return fila ? aProyecto(fila) : null;
}

export async function crearProyecto(
  datos: DatosNuevoProyecto
): Promise<Proyecto> {
  const fila = await prisma.proyecto.create({ data: datos });

  return aProyecto(fila);
}

export async function cambiarEstado(
  id: number,
  estado: EstadoProyecto
): Promise<Proyecto | null> {
  if (!idValido(id)) return null;

  const existe = await prisma.proyecto.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existe) return null;

  const fila = await prisma.proyecto.update({
    where: { id },
    data: {
      estado,
      fechaCierre: estado === "FINALIZADO" ? new Date() : null,
    },
  });

  return aProyecto(fila);
}

// ---- AVANCES ----

export async function listarAvancesDeProyectos(
  proyectoIds: number[]
): Promise<Avance[]> {
  if (proyectoIds.length === 0) return [];

  return prisma.avanceProyecto.findMany({
    where: { proyectoId: { in: proyectoIds } },
    orderBy: { fecha: "desc" },
  });
}

export async function crearAvance(datos: {
  proyectoId: number;
  autorId: number;
  descripcion: string;
}): Promise<Avance> {
  return prisma.avanceProyecto.create({ data: datos });
}

// ---- OBSERVACIONES ----

export async function listarObservacionesDeProyectos(
  proyectoIds: number[]
): Promise<Observacion[]> {
  if (proyectoIds.length === 0) return [];

  return prisma.observacionProyecto.findMany({
    where: { proyectoId: { in: proyectoIds } },
    orderBy: { fecha: "desc" },
  });
}

export async function crearObservacion(datos: {
  proyectoId: number;
  docenteId: number;
  texto: string;
}): Promise<Observacion> {
  return prisma.observacionProyecto.create({ data: datos });
}
// Indica si el usuario creó el proyecto o es integrante de su equipo
export async function esParticipanteDeProyecto(
  proyectoId: number,
  usuarioId: number
): Promise<boolean> {
  if (!idValido(proyectoId)) return false;

  const total = await prisma.proyecto.count({
    where: {
      id: proyectoId,
      OR: [
        { creadoPorId: usuarioId },
        { equipo: { miembros: { some: { usuarioId } } } },
      ],
    },
  });

  return total > 0;
}