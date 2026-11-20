// Punto único de auditoría (RNF08). Cuando exista el módulo 6, solo cambia el cuerpo de esta función.
import { prisma } from "@/lib/prisma";
import type { Contexto } from "./tipos";

export async function registrarActividad(
  ctx: Contexto, accion: string, entidad: string, entidadId: number | null, detalle?: Record<string, unknown>,
) {
  try {
    await prisma.registroActividad.create({
      data: {
        usuarioId: ctx.usuario.id, accion, entidad, entidadId,
        detalle: (detalle ?? undefined) as never, ip: ctx.ip ?? null,
      },
    });
  } catch (e) {
    console.error("[auditoria] no se pudo registrar", e); // la auditoría nunca debe romper la operación
  }
}
