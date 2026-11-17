
import "server-only";

import { prisma } from "@/lib/prisma";

/* ==========================================
   HISTORIAL DE REPORTES GENERADOS
   Tabla `reportes` (modelo relacional, Módulo 7):
   se registra quién generó qué reporte, en qué
   formato y cuándo. El contenido no se guarda.
========================================== */

export async function registrarReporte(datos: {
  idUsuario: number;
  tipoReporte: string;
  formato: string;
  idProyecto?: number;
}) {
  try {
    await prisma.reporte.create({ data: datos });
  } catch (error) {
    // El historial no debe impedir la descarga del reporte
    console.error("No se pudo registrar el reporte en el historial:", error);
  }
}

export async function listarHistorial(limite = 100) {
  return prisma.reporte.findMany({
    include: { usuario: { select: { nombre: true, usuario: true, rol: true } } },
    orderBy: { fechaGeneracion: "desc" },
    take: limite,
  });
}
