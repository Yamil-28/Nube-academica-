// Puente entre tu autenticación (lib/sesion.ts) y el módulo Nube Académica.
// Ya está adaptado a tu sesión: obtenerSesion() devuelve { id, usuario, rol }.
import { obtenerSesion } from "@/lib/sesion";
import { ErrorNube, type Contexto } from "./tipos";

export async function obtenerContexto(req?: Request): Promise<Contexto> {
  const sesion = await obtenerSesion();
  if (!sesion) throw new ErrorNube(401, "NO_AUTENTICADO", "Debes iniciar sesión");
  return {
    usuario: { id: sesion.id, rol: sesion.rol },
    ip: req?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
  };
}

/** Texto legible de un usuario (tu modelo tiene `nombre` y `usuario`). */
export function etiquetaUsuario(u: Record<string, unknown> | null | undefined): string {
  if (!u) return "Desconocido";
  return String(u.nombre ?? u.usuario ?? `Usuario #${u.id}`);
}
