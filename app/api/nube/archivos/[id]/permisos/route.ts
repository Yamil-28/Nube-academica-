import { id, json, leerJson, manejar } from "@/lib/nube/http";
import type { NivelPermiso } from "@/lib/nube/tipos";
import { compartirArchivo, listarPermisos, quitarPermiso } from "@/lib/nube/servicio";

export const GET = manejar<{ id: string }>(async (_req, ctx, p) => json(await listarPermisos(ctx, id(p.id))));

export const POST = manejar<{ id: string }>(async (req, ctx, p) => {
  const b = await leerJson<{ usuarioId?: number; nivel?: NivelPermiso }>(req);
  await compartirArchivo(ctx, id(p.id), id(b.usuarioId, "usuarioId"), b.nivel ?? "LECTURA");
  return json({ ok: true }, 201);
});

export const DELETE = manejar<{ id: string }>(async (req, ctx, p) => {
  const b = await leerJson<{ usuarioId?: number }>(req);
  await quitarPermiso(ctx, id(p.id), id(b.usuarioId, "usuarioId"));
  return json({ ok: true });
});
