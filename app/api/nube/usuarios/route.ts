import { json, manejar } from "@/lib/nube/http";
import { listarUsuariosCompartibles } from "@/lib/nube/servicio";

// GET /api/nube/usuarios → personas con quienes puedo compartir
export const GET = manejar(async (_req, ctx) => json(await listarUsuariosCompartibles(ctx)));
