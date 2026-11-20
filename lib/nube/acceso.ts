// Resuelve la relación usuario↔proyecto. Si tu compañero de "Equipos de Trabajo" usa equipo/integrante_equipo,
// cambia SOLO estas dos funciones; el resto del módulo no se entera.
import { prisma } from "@/lib/prisma";
import type { Relacion, UsuarioActual } from "./tipos";

export async function resolverRelacion(u: UsuarioActual, proyectoId: number): Promise<Relacion | null> {
  const p = await prisma.proyecto.findUnique({
    where: { id: proyectoId },
    select: { docenteId: true, miembros: { where: { usuarioId: u.id }, select: { usuarioId: true } } },
  });
  if (!p) return null;
  if (u.rol === "ADMINISTRADOR") return "ADMINISTRACION";
  if (p.miembros.length > 0) return "MIEMBRO";
  if (u.rol === "DOCENTE" && p.docenteId === u.id) return "DOCENTE_RESPONSABLE";
  return null;
}

export async function proyectosAccesibles(u: UsuarioActual) {
  const where =
    u.rol === "ADMINISTRADOR" ? {}
    : u.rol === "DOCENTE" ? { OR: [{ docenteId: u.id }, { miembros: { some: { usuarioId: u.id } } }] }
    : { miembros: { some: { usuarioId: u.id } } };
  return prisma.proyecto.findMany({ where, select: { id: true, titulo: true }, orderBy: { titulo: "asc" } });
}
