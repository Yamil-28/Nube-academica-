import type { Materia } from "./tipos";

// DATOS TEMPORALES: se reemplazarán por la tabla real de materias
// cuando Gestión académica esté lista. Solo cambia el interior de
// esta función; el resto del módulo no se toca.
const MATERIAS: Materia[] = [
  { id: 1, codigo: "SIS-301", nombre: "Sistemas de Información II" },
  { id: 2, codigo: "SIS-302", nombre: "Base de Datos II" },
  { id: 3, codigo: "SIS-303", nombre: "Ingeniería de Software" },
];

export async function obtenerMaterias(): Promise<Materia[]> {
  return MATERIAS;
}