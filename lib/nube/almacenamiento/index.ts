import path from "node:path";
import { AlmacenamientoLocal } from "./local";
import type { Almacenamiento } from "./tipos";

const g = globalThis as unknown as { __nubeAlm?: Almacenamiento };
// Para cambiar de proveedor, reemplaza esta línea por tu implementación (S3, MinIO...).
export const almacenamiento: Almacenamiento = (g.__nubeAlm ??= new AlmacenamientoLocal(
  process.env.NUBE_RUTA_ALMACENAMIENTO ?? path.join(process.cwd(), "storage"),
));
