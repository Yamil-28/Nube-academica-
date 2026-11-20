import { id, json, leerJson, manejar } from "@/lib/nube/http";
import { fijarCuota, resumenCuotas } from "@/lib/nube/servicio";

// Solo Administrador (HU-14)
export const GET = manejar(async (_req, ctx) => json(await resumenCuotas(ctx)));

// PUT { proyectoId, limiteBytes }
export const PUT = manejar(async (req, ctx) => {
  const b = await leerJson<{ proyectoId?: number; limiteBytes?: number }>(req);
  await fijarCuota(ctx, id(b.proyectoId, "proyectoId"), Number(b.limiteBytes));
  return json({ ok: true });
});
