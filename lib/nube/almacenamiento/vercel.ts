import { del, get, put } from "@vercel/blob";
import type { Almacenamiento } from "./tipos";

export class AlmacenamientoVercel implements Almacenamiento {
  async guardar(clave: string, contenido: ReadableStream<Uint8Array>) {
    await put(clave, contenido, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: false,
      multipart: true,
      contentType: "application/octet-stream",
    });
  }

  async leer(clave: string) {
    const resultado = await get(clave, { access: "private", useCache: false });
    if (resultado?.statusCode !== 200) {
      throw new Error("El archivo no existe en el almacenamiento privado");
    }
    return resultado.stream;
  }

  async eliminar(clave: string) {
    await del(clave);
  }
}
