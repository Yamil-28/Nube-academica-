import { id, idOpcional, json, manejar } from "@/lib/nube/http";
import { listarContenido } from "@/lib/nube/servicio";

// GET /api/nube/proyectos/:proyectoId/contenido?carpetaId=
export const GET = manejar<{ proyectoId: string }>(async (req, ctx, p) =>
  json(await listarContenido(ctx, id(p.proyectoId, "proyectoId"), idOpcional(new URL(req.url).searchParams.get("carpetaId")))),
);
