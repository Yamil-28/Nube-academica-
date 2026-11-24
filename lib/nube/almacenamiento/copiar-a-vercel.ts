import { BlobNotFoundError, head } from "@vercel/blob";
import { createHash } from "node:crypto";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { AlmacenamientoLocal } from "./local";
import { AlmacenamientoVercel } from "./vercel";

async function huella(contenido: ReadableStream<Uint8Array>) {
  const hash = createHash("sha256");
  const lector = contenido.getReader();
  try {
    for (;;) {
      const { value, done } = await lector.read();
      if (done) return hash.digest("hex");
      hash.update(value);
    }
  } finally {
    lector.releaseLock();
  }
}

async function copiarArchivos() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Configura BLOB_READ_WRITE_TOKEN para el almacén privado de destino");
  }

  const raiz = process.env.NUBE_RUTA_ALMACENAMIENTO ?? path.join(process.cwd(), "storage");
  const local = new AlmacenamientoLocal(raiz);
  const remoto = new AlmacenamientoVercel();
  let total = 0;

  for (const proyecto of await readdir(path.join(raiz, "proyectos"), { withFileTypes: true })) {
    if (!proyecto.isDirectory() || !/^\d+$/.test(proyecto.name)) continue;
    const archivos = await readdir(path.join(raiz, "proyectos", proyecto.name), { withFileTypes: true });
    for (const archivo of archivos) {
      if (!archivo.isFile()) continue;
      const clave = `proyectos/${proyecto.name}/${archivo.name}`;
      const existente = await head(clave).catch((error: unknown) => {
        if (error instanceof BlobNotFoundError) return null;
        throw error;
      });
      if (!existente) await remoto.guardar(clave, await local.leer(clave));
      const original = await huella(await local.leer(clave));
      const copia = await huella(await remoto.leer(clave));
      if (original !== copia) throw new Error(`La copia no coincide con el archivo local: ${clave}`);
      total++;
    }
  }
  console.log(`Archivos verificados en Vercel Blob: ${total}`);
}

copiarArchivos().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Falló la copia de archivos");
  process.exitCode = 1;
});
