import { prisma } from "@/lib/prisma";
import type { Relacion, UsuarioActual } from "./tipos";

export async function resolverRelacion(u: UsuarioActual, proyectoId: number): Promise<Relacion | null> {
  const p = await prisma.proyecto.findUnique({
    where: { id: proyectoId },
    select: { docenteId: true, creadoPorId: true, equipo: { select: { miembros: { where: { usuarioId: u.id }, select: { usuarioId: true } } } } },
  });
  if (!p) return null;
  if (u.rol === "ADMINISTRADOR") return "ADMINISTRACION";
  if (u.rol === "DOCENTE") return p.docenteId === u.id ? "DOCENTE_RESPONSABLE" : null;
  if (p.creadoPorId === u.id || (p.equipo?.miembros.length ?? 0) > 0) return "MIEMBRO";
  return null;
}

export async function proyectosAccesibles(u: UsuarioActual) {
  const where = u.rol === "ADMINISTRADOR" ? {}
    : u.rol === "DOCENTE" ? { docenteId: u.id }
    : { OR: [{ creadoPorId: u.id }, { equipo: { miembros: { some: { usuarioId: u.id } } } }] };
  return prisma.proyecto.findMany({ where, select: { id: true, titulo: true }, orderBy: { titulo: "asc" } });
}
