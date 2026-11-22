import "server-only";

import { prisma } from "@/lib/prisma";
import { etiquetaMateria, nombrePeriodo } from "@/lib/academico/tipos";

/* ==========================================
   ESTADÍSTICAS DE GESTIÓN ACADÉMICA Y PROYECTOS
   Los conteos se resuelven en PostgreSQL (groupBy)
   y las consultas independientes van en paralelo.
========================================== */

const ESTADOS_PROYECTO = [
  { valor: "REGISTRADO", texto: "Registrados" },
  { valor: "EN_DESARROLLO", texto: "En desarrollo" },
  { valor: "EN_REVISION", texto: "En revisión" },
  { valor: "FINALIZADO", texto: "Finalizados" },
] as const;

export async function obtenerEstadisticasAcademicas() {
  const vigente = await prisma.periodoAcademico.findFirst({ where: { vigente: true } });

  const [
    materiasActivas,
    asignacionesVigentes,
    totalProyectos,
    proyectosPorEstado,
    avancesPendientes,
    proyectosPorMateria,
    materias,
  ] = await Promise.all([
    prisma.materia.count({ where: { activa: true } }),
    vigente ? prisma.asignacionDocente.count({ where: { idPeriodo: vigente.id } }) : 0,
    prisma.proyecto.count(),
    prisma.proyecto.groupBy({ by: ["estado"], _count: { _all: true } }),
    prisma.avanceProyecto.count({ where: { revisionEstado: "PENDIENTE" } }),
    prisma.proyecto.groupBy({
      by: ["materiaId"],
      where: vigente ? { idPeriodo: vigente.id } : {},
      _count: { _all: true },
    }),
    prisma.materia.findMany({ where: { activa: true }, orderBy: { nombre: "asc" } }),
  ]);

  return {
    periodoVigente: vigente ? nombrePeriodo(vigente) : null,
    materiasActivas,
    asignacionesVigentes,
    totalProyectos,
    avancesPendientes,
    porEstado: ESTADOS_PROYECTO.map((estado) => ({
      etiqueta: estado.texto,
      valor:
        proyectosPorEstado.find((fila) => fila.estado === estado.valor)?._count._all ?? 0,
    })),
    porMateria: materias.map((materia) => ({
      etiqueta: etiquetaMateria(materia),
      valor:
        proyectosPorMateria.find((fila) => fila.materiaId === materia.id)?._count._all ?? 0,
    })),
  };
}
