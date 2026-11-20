// Validaciones y utilidades puras sobre nombres, tamaños y tipos de archivo (fáciles de testear).
import { ErrorNube } from "./tipos";

export const MAX_BYTES = Number(process.env.NUBE_MAX_BYTES ?? 50 * 1024 * 1024);          // 50 MB por archivo
export const CUOTA_DEFECTO = Number(process.env.NUBE_CUOTA_DEFECTO_BYTES ?? 200 * 1024 * 1024); // 200 MB por proyecto

const BLOQUEADAS = new Set(["exe", "msi", "bat", "cmd", "com", "scr", "vbs", "ps1", "dll", "jar"]);

export function limpiarNombre(entrada: unknown): string {
  if (typeof entrada !== "string") throw new ErrorNube(400, "NOMBRE_INVALIDO", "El nombre es obligatorio");
  // eslint-disable-next-line no-control-regex
  const n = entrada.normalize("NFC").replace(/[\\/\u0000-\u001f<>:"|?*]/g, "").trim().slice(0, 255);
  if (!n || /^\.+$/.test(n)) throw new ErrorNube(400, "NOMBRE_INVALIDO", "Nombre no válido");
  return n;
}

export function extensionDe(nombre: string): string | null {
  const i = nombre.lastIndexOf(".");
  return i > 0 && i < nombre.length - 1 ? nombre.slice(i + 1).toLowerCase().slice(0, 20) : null;
}

export function validarArchivo(nombre: string, bytes: number) {
  const ext = extensionDe(nombre);
  if (ext && BLOQUEADAS.has(ext))
    throw new ErrorNube(400, "TIPO_BLOQUEADO", `No se permiten archivos .${ext}`);
  if (bytes <= 0) throw new ErrorNube(400, "ARCHIVO_VACIO", "El archivo está vacío");
  if (bytes > MAX_BYTES)
    throw new ErrorNube(413, "ARCHIVO_GRANDE", `Supera el máximo de ${Math.round(MAX_BYTES / 1048576)} MB`);
}

const CLASES: Record<string, string[]> = {
  "Documento": ["pdf", "doc", "docx", "odt", "txt", "md", "rtf"],
  "Presentación": ["ppt", "pptx", "odp"],
  "Hoja de cálculo": ["xls", "xlsx", "ods", "csv"],
  "Código fuente": ["js", "ts", "tsx", "jsx", "py", "java", "c", "cpp", "cs", "php", "sql", "html", "css", "json", "xml", "sh", "go", "rs", "kt"],
  "Imagen": ["png", "jpg", "jpeg", "gif", "svg", "webp"],
  "Comprimido": ["zip", "rar", "7z", "tar", "gz"],
};
/** Nombre del catálogo tipo_recurso al que pertenece la extensión. */
export function clasificar(ext: string | null): string {
  if (!ext) return "Otro";
  return Object.entries(CLASES).find(([, l]) => l.includes(ext))?.[0] ?? "Otro";
}
