import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as WebStream } from "node:stream/web";
import type { Almacenamiento } from "./tipos";

export class AlmacenamientoLocal implements Almacenamiento {
  private raiz: string;
  constructor(raiz: string) { this.raiz = path.resolve(raiz); }

  /** Impide salirse de la carpeta raíz (path traversal). */
  private ruta(clave: string): string {
    const destino = path.resolve(this.raiz, clave);
    if (!destino.startsWith(this.raiz + path.sep)) throw new Error("Clave de almacenamiento inválida");
    return destino;
  }
  async guardar(clave: string, contenido: ReadableStream<Uint8Array>) {
    const destino = this.ruta(clave);
    await mkdir(path.dirname(destino), { recursive: true });
    await pipeline(Readable.fromWeb(contenido as unknown as WebStream), createWriteStream(destino, { flags: "wx" }));
  }
  async leer(clave: string) {
    const origen = this.ruta(clave);
    await stat(origen);
    return Readable.toWeb(createReadStream(origen)) as unknown as ReadableStream<Uint8Array>;
  }
  async eliminar(clave: string) { await rm(this.ruta(clave), { force: true }); }
}
