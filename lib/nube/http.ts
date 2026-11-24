// Envoltorio reutilizable para route handlers: autentica, convierte errores a JSON y valida ids.
import { connection, NextResponse, type NextRequest } from "next/server";
import { obtenerContexto } from "./contexto";
import { ErrorNube, type Contexto } from "./tipos";

export const json = (datos: unknown, estado = 200) => NextResponse.json(datos, { status: estado });

export function manejar<P = Record<string, string>>(
  fn: (req: NextRequest, ctx: Contexto, params: P) => Promise<Response>,
) {
  return async (req: NextRequest, { params }: { params: Promise<P> }) => {
    await connection();
    try {
      return await fn(req, await obtenerContexto(req), await params);
    } catch (e) {
      if (e instanceof ErrorNube) {
        return json({ error: { codigo: e.codigo, mensaje: e.message } }, e.estado);
      }
      console.error("[nube]", e);
      return json({ error: { codigo: "INTERNO", mensaje: "Error interno del servidor" } }, 500);
    }
  };
}

export function id(valor: unknown, campo = "id"): number {
  const n = Number(valor);
  if (!Number.isInteger(n) || n <= 0) throw new ErrorNube(400, "ID_INVALIDO", `${campo} inválido`);
  return n;
}
export const idOpcional = (v: unknown, campo = "id") =>
  v === null || v === undefined || v === "" || v === "null" ? null : id(v, campo);

export async function leerJson<T = Record<string, unknown>>(req: Request): Promise<T> {
  try { return (await req.json()) as T; }
  catch { throw new ErrorNube(400, "JSON_INVALIDO", "El cuerpo de la petición no es JSON válido"); }
}
