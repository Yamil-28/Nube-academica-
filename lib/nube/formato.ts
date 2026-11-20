// Utilidades de presentación (sin dependencias de navegador ni de servidor).
import type { Rol } from "./tipos";

export function formatoBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const u = ["KB", "MB", "GB"];
  let v = n / 1024, i = 0;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v < 10 ? 1 : 0)} ${u[i]}`;
}
export const fechaCorta = (iso: string) =>
  new Date(iso).toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "numeric" });
export const fechaHora = (iso: string) =>
  new Date(iso).toLocaleString("es-BO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** Nombre de clase CSS (de nube.module.css) para el color del tipo de recurso. */
export function claseTipo(tipo: string | null): string {
  switch (tipo) {
    case "Documento": return "tDoc";
    case "Imagen": return "tImg";
    case "Código fuente": return "tCod";
    case "Hoja de cálculo": return "tHoja";
    case "Presentación": return "tPres";
    case "Comprimido": return "tZip";
    default: return "tOtro";
  }
}
export const ETIQUETA_ROL: Record<Rol, string> = { ADMINISTRADOR: "Administrador", DOCENTE: "Docente", ESTUDIANTE: "Estudiante" };
