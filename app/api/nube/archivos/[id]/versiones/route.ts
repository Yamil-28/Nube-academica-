import { id, json, manejar } from "@/lib/nube/http";
import { ErrorNube } from "@/lib/nube/tipos";
import { listarVersiones, subirVersion } from "@/lib/nube/servicio";

export const GET = manejar<{ id: string }>(async (_req, ctx, p) => json(await listarVersiones(ctx, id(p.id))));

// POST multipart: file, comentario?
export const POST = manejar<{ id: string }>(async (req, ctx, p) => {
  const form = await req.formData();
  const archivo = form.get("file");
  if (!(archivo instanceof File)) throw new ErrorNube(400, "SIN_ARCHIVO", "Falta el archivo (campo 'file')");
  return json(await subirVersion(ctx, id(p.id), archivo, (form.get("comentario") as string | null) ?? null), 201);
});
