import path from "node:path";
import { AlmacenamientoLocal } from "./local";
import type { Almacenamiento } from "./tipos";
import { AlmacenamientoVercel } from "./vercel";

const g = globalThis as unknown as { __nubeAlm?: Almacenamiento };
export const almacenamiento: Almacenamiento = (g.__nubeAlm ??=
  process.env.NUBE_ALMACENAMIENTO === "vercel"
    ? new AlmacenamientoVercel()
    : new AlmacenamientoLocal(
        process.env.NUBE_RUTA_ALMACENAMIENTO ?? path.join(process.cwd(), "storage"),
      ));
