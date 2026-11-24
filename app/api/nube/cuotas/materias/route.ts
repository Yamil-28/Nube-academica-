import { id, json, leerJson, manejar } from "@/lib/nube/http";
import { fijarCuotaMateria, resumenCuotasMaterias } from "@/lib/nube/servicio";
import { ErrorNube } from "@/lib/nube/tipos";

export const GET = manejar(async (_req, ctx) => json(await resumenCuotasMaterias(ctx)));

export const PUT = manejar(async (req, ctx) => {
  const cuerpo = await leerJson<{ materiaId?: number; limiteBytes?: number | null } | null>(req);
  if (!cuerpo || (cuerpo.limiteBytes !== null && typeof cuerpo.limiteBytes !== "number")) {
    throw new ErrorNube(400, "CUOTA_INVALIDA", "Indica el límite de la materia");
  }
  await fijarCuotaMateria(ctx, id(cuerpo.materiaId, "materiaId"), cuerpo.limiteBytes);
  return json({ ok: true });
});
