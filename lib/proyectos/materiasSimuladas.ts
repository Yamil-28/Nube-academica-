
import "server-only";

import { prisma } from "@/lib/prisma";
import type { Materia } from "./tipos";

export async function obtenerMaterias(): Promise<Materia[]> {
  const materias = await prisma.materia.findMany({
    where: {
      activa: true,
    },
    select: {
      id: true,
      codigo: true,
      nombre: true,
    },
    orderBy: {
      nombre: "asc",
    },
  });

  return materias.map((materia) => ({
    id: materia.id,
    codigo: materia.codigo ?? "",
    nombre: materia.nombre,
  }));
}
