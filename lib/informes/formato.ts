
/* ==========================================
   FORMATO DE FECHAS Y TEXTOS DE LOS INFORMES
========================================== */

// Bolivia no usa horario de verano: siempre UTC-4.
export const ZONA_HORARIA = "America/La_Paz";
export const DESPLAZAMIENTO_HORARIO = "-04:00";

export function formatearFecha(fecha: Date): string {
  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: ZONA_HORARIA,
  }).format(fecha);
}

export function formatearFechaHora(fecha: Date): string {
  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: ZONA_HORARIA,
  }).format(fecha);
}

// "2026-11-16" en la hora de Bolivia, para nombres de archivo.
export function fechaParaArchivo(fecha: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: ZONA_HORARIA,
  }).format(fecha);
}

// "1 activo" / "2 activos"
export function pluralizar(
  cantidad: number,
  singular: string,
  plural: string
): string {
  return `${cantidad.toLocaleString("es-BO")} ${
    cantidad === 1 ? singular : plural
  }`;
}
