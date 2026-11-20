import { id, idOpcional, json, manejar } from "@/lib/nube/http";
import { ErrorNube } from "@/lib/nube/tipos";
import { subirArchivo } from "@/lib/nube/servicio";

// POST /api/nube/proyectos/:proyectoId/archivos  (multipart: file, carpetaId?, comentario?)
export const POST = manejar<{ proyectoId: string }>(async (req, ctx, p) => {
  const form = await req.formData();
  const archivo = form.get("file");
  if (!(archivo instanceof File)) throw new ErrorNube(400, "SIN_ARCHIVO", "Falta el archivo (campo 'file')");
  const r = await subirArchivo(ctx, {
    proyectoId: id(p.proyectoId, "proyectoId"), carpetaId: idOpcional(form.get("carpetaId")),
    archivo, comentario: (form.get("comentario") as string | null) ?? null,
  });
  return json(r, 201);
});
