import { id, idOpcional, json, leerJson, manejar } from "@/lib/nube/http";
import { crearCarpeta } from "@/lib/nube/servicio";

// POST /api/nube/proyectos/:proyectoId/carpetas  { nombre, carpetaPadreId? }
export const POST = manejar<{ proyectoId: string }>(async (req, ctx, p) => {
  const b = await leerJson<{ nombre?: string; carpetaPadreId?: number | null }>(req);
  return json(await crearCarpeta(ctx, { proyectoId: id(p.proyectoId, "proyectoId"), carpetaPadreId: idOpcional(b.carpetaPadreId), nombre: b.nombre }), 201);
});
