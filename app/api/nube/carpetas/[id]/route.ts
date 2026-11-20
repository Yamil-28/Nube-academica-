import { id, json, leerJson, manejar } from "@/lib/nube/http";
import { eliminarCarpeta, renombrarCarpeta } from "@/lib/nube/servicio";

export const PATCH = manejar<{ id: string }>(async (req, ctx, p) => {
  await renombrarCarpeta(ctx, id(p.id), (await leerJson<{ nombre?: string }>(req)).nombre);
  return json({ ok: true });
});
export const DELETE = manejar<{ id: string }>(async (_req, ctx, p) => {
  await eliminarCarpeta(ctx, id(p.id));
  return json({ ok: true });
});
