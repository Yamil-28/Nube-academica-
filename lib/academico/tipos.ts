
/* ==========================================
   GESTIÓN ACADÉMICA - TIPOS
   Basado en el modelo relacional del documento:
   periodo_academico, materia y docente_materia.
========================================== */

export type Semestre = "I" | "II";

export type PeriodoAcademico = {
  id: number;
  gestion: number; // 2026
  semestre: Semestre;
  vigente: boolean; // periodo en curso (solo uno a la vez)
  activo: boolean;
  creadoEn: Date;
};

// Campos según el modelo relacional (codigo, nombre, nivel, es_activa)
// y el diccionario físico (descripcion). El código es opcional porque
// el diccionario y los registros iniciales (Figura 6) no lo incluyen.
export type Materia = {
  id: number;
  codigo: string | null; // SIS-332
  nombre: string;
  nivel: number; // semestre de la carrera, 1 a 10
  descripcion: string;
  activa: boolean;
  creadoEn: Date;
};

export type DatosMateria = Pick<Materia, "codigo" | "nombre" | "nivel" | "descripcion">;

export type AsignacionDocente = {
  id: number;
  idDocente: number;
  idMateria: number;
  idPeriodo: number;
  creadoEn: Date;
};

export type Docente = {
  id: number;
  nombre: string;
  usuario: string;
  activo: boolean;
};

// Asignación con los datos relacionados, lista para mostrar
export type AsignacionDetallada = {
  id: number;
  periodo: PeriodoAcademico;
  materia: Materia;
  docente: Docente;
};

/* ==========================================
   RESULTADO DE LOS FORMULARIOS
========================================== */

export type EstadoFormulario = {
  estado: "inicial" | "exito" | "error";
  mensaje: string;
  errores?: Record<string, string>;
  // Cambia en cada guardado exitoso para limpiar el formulario
  marca?: number;
};

export const ESTADO_INICIAL: EstadoFormulario = {
  estado: "inicial",
  mensaje: "",
};

// "SIS-332 · Sistemas de Información II" o solo el nombre si no hay código
export function etiquetaMateria(materia: Pick<Materia, "codigo" | "nombre">) {
  return materia.codigo ? `${materia.codigo} · ${materia.nombre}` : materia.nombre;
}

export function nombrePeriodo(periodo: Pick<PeriodoAcademico, "gestion" | "semestre">) {
  return `${periodo.semestre}/${periodo.gestion}`;
}
