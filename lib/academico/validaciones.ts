
import type { DatosMateria, Semestre } from "@/lib/academico/tipos";

/* ==========================================
   VALIDACIÓN DE LOS DATOS DE LOS FORMULARIOS
   Se ejecuta en el servidor: nunca se confía
   en lo que envía el navegador.
========================================== */

type Resultado<T> =
  | { valido: true; datos: T }
  | { valido: false; errores: Record<string, string> };

function texto(formulario: FormData, campo: string): string {
  const valor = formulario.get(campo);
  return typeof valor === "string" ? valor.trim() : "";
}

export function leerId(formulario: FormData, campo = "id"): number | null {
  const numero = Number.parseInt(texto(formulario, campo), 10);
  return Number.isSafeInteger(numero) && numero > 0 ? numero : null;
}

/* ==========================================
   PERIODO ACADÉMICO
========================================== */

export const GESTION_MINIMA = 2020;
export const GESTION_MAXIMA = 2040;

export function validarPeriodo(
  formulario: FormData
): Resultado<{ gestion: number; semestre: Semestre }> {
  const errores: Record<string, string> = {};

  const gestion = Number.parseInt(texto(formulario, "gestion"), 10);
  const semestre = texto(formulario, "semestre");

  if (
    !Number.isSafeInteger(gestion) ||
    gestion < GESTION_MINIMA ||
    gestion > GESTION_MAXIMA
  ) {
    errores.gestion = `Ingresa una gestión entre ${GESTION_MINIMA} y ${GESTION_MAXIMA}.`;
  }

  if (semestre !== "I" && semestre !== "II") {
    errores.semestre = "Selecciona el semestre I o II.";
  }

  if (Object.keys(errores).length > 0) {
    return { valido: false, errores };
  }

  return {
    valido: true,
    datos: { gestion, semestre: semestre as Semestre },
  };
}

/* ==========================================
   MATERIA
========================================== */

export const NIVEL_MINIMO = 1;
export const NIVEL_MAXIMO = 10;

const PATRON_CODIGO = /^[A-Z]{2,4}-\d{3}$/;

export const LARGO_MAXIMO_NOMBRE = 120; // VARCHAR(120) en el diccionario
export const LARGO_MAXIMO_DESCRIPCION = 300;

export function validarMateria(formulario: FormData): Resultado<DatosMateria> {
  const errores: Record<string, string> = {};

  const codigo = texto(formulario, "codigo").toUpperCase();
  const nombre = texto(formulario, "nombre").replace(/\s+/g, " ");
  const nivel = Number.parseInt(texto(formulario, "nivel"), 10);
  const descripcion = texto(formulario, "descripcion").replace(/\s+/g, " ");

  // El código es opcional, pero si se escribe debe tener formato válido
  if (codigo && !PATRON_CODIGO.test(codigo)) {
    errores.codigo = "Usa el formato SIGLA-NÚMERO, por ejemplo SIS-332, o déjalo vacío.";
  }

  if (nombre.length < 3 || nombre.length > LARGO_MAXIMO_NOMBRE) {
    errores.nombre = `El nombre debe tener entre 3 y ${LARGO_MAXIMO_NOMBRE} caracteres.`;
  }

  if (descripcion.length > LARGO_MAXIMO_DESCRIPCION) {
    errores.descripcion = `La descripción admite hasta ${LARGO_MAXIMO_DESCRIPCION} caracteres.`;
  }

  if (
    !Number.isSafeInteger(nivel) ||
    nivel < NIVEL_MINIMO ||
    nivel > NIVEL_MAXIMO
  ) {
    errores.nivel = `Selecciona un semestre entre ${NIVEL_MINIMO} y ${NIVEL_MAXIMO}.`;
  }

  if (Object.keys(errores).length > 0) {
    return { valido: false, errores };
  }

  return {
    valido: true,
    datos: { codigo: codigo || null, nombre, nivel, descripcion },
  };
}

/* ==========================================
   ASIGNACIÓN DOCENTE - MATERIA - PERIODO
========================================== */

export function validarAsignacion(formulario: FormData): Resultado<{
  idDocente: number;
  idMateria: number;
  idPeriodo: number;
}> {
  const errores: Record<string, string> = {};

  const idDocente = leerId(formulario, "idDocente");
  const idMateria = leerId(formulario, "idMateria");
  const idPeriodo = leerId(formulario, "idPeriodo");

  if (!idDocente) errores.idDocente = "Selecciona un docente.";
  if (!idMateria) errores.idMateria = "Selecciona una materia.";
  if (!idPeriodo) errores.idPeriodo = "Selecciona un periodo académico.";

  if (!idDocente || !idMateria || !idPeriodo) {
    return { valido: false, errores };
  }

  return { valido: true, datos: { idDocente, idMateria, idPeriodo } };
}
