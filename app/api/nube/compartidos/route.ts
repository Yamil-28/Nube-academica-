import { json, manejar } from "@/lib/nube/http";
import { listarCompartidosConmigo } from "@/lib/nube/servicio";

// GET /api/nube/compartidos → archivos que otros compartieron conmigo
export const GET = manejar(async (_req, ctx) => json(await listarCompartidosConmigo(ctx)));
