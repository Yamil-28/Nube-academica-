import "server-only";

import { prisma } from "@/lib/prisma";

// Solo lectura: devuelve el nombre de cada usuario por su id
export async function obtenerNombresUsuarios(
  ids: number[]
): Promise<Map<number, string>> {
  const unicos = [...new Set(ids)];

  if (unicos.length === 0) return new Map();

  const usuarios = await prisma.usuario.findMany({
    where: { id: { in: unicos } },
    select: { id: true, nombre: true },
  });

  return new Map(usuarios.map((u) => [u.id, u.nombre]));
}