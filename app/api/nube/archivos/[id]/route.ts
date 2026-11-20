import { id, idOpcional, json, leerJson, manejar } from "@/lib/nube/http";
import { actualizarArchivo, descargar, eliminarArchivo } from "@/lib/nube/servicio";

// GET /api/nube/archivos/:id?version=N  → descarga
export const GET = manejar<{ id: string }>(async (req, ctx, p) => {
  const v = new URL(req.url).searchParams.get("version");
  const f = await descargar(ctx, id(p.id), v ? id(v, "version") : null);
  return new Response(f.stream, {
    headers: {
      "Content-Type": f.mime,
      "Content-Length": String(f.bytes),
      // Siempre "attachment" + nosniff: un HTML subido por un estudiante jamás se ejecuta en nuestro dominio
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(f.nombre)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
});

// PATCH { nombre?, carpetaId? }  → renombrar / mover
export const PATCH = manejar<{ id: string }>(async (req, ctx, p) => {
  const b = await leerJson<{ nombre?: string; carpetaId?: number | null }>(req);
  await actualizarArchivo(ctx, id(p.id), {
    nombre: b.nombre, carpetaId: b.carpetaId === undefined ? undefined : idOpcional(b.carpetaId),
  });
  return json({ ok: true });
});
export const DELETE = manejar<{ id: string }>(async (_req, ctx, p) => {
  await eliminarArchivo(ctx, id(p.id));
  return json({ ok: true });
});
