import { randomUUID } from "node:crypto";
import { del, get } from "@vercel/blob";
import { generateClientTokenFromReadWriteToken } from "@vercel/blob/client";
import { SignJWT, jwtVerify } from "jose";
import { id, idOpcional, json, leerJson, manejar } from "@/lib/nube/http";
import { autorizarCargaDirecta, subirArchivo, subirVersion } from "@/lib/nube/servicio";
import { ErrorNube } from "@/lib/nube/tipos";

function claveFirma() {
  const secreto = process.env.CLAVE_SECRETA_SESION;
  if (!secreto || secreto.length < 32) throw new Error("Falta la clave de sesión");
  return new TextEncoder().encode(secreto);
}

export const POST = manejar(async (req, ctx) => {
  if (process.env.NUBE_ALMACENAMIENTO !== "vercel") return json({ directa: false });
  const datos = await leerJson(req);
  const usuario = String(ctx.usuario.id);
  const audience = "siscloud:nube:carga-directa";

  if (typeof datos.comprobante === "string") {
    const verificado = await jwtVerify(datos.comprobante, claveFirma(), {
      algorithms: ["HS256"], audience, subject: usuario,
    }).catch(() => null);
    if (!verificado) throw new ErrorNube(400, "CARGA_INVALIDA", "La autorización de subida venció o no es válida");

    const { clave, nombre, bytes, mime, archivoId, proyectoId, carpetaId, comentario } = verificado.payload;
    if (typeof clave !== "string" || typeof nombre !== "string" || typeof bytes !== "number" || typeof mime !== "string") {
      throw new ErrorNube(400, "CARGA_INVALIDA", "La autorización de subida no es válida");
    }
    const destino = archivoId == null
      ? { proyectoId: id(proyectoId), carpetaId: idOpcional(carpetaId) }
      : { archivoId: id(archivoId) };
    const archivo = {
      name: nombre, size: bytes, type: mime,
      async stream() {
        const blob = await get(clave, { access: "private", useCache: false });
        if (blob?.statusCode !== 200 || blob.blob.size !== bytes) {
          if (blob?.statusCode === 200) await blob.stream.cancel();
          throw new ErrorNube(400, "CARGA_INCOMPLETA", "El contenido recibido no coincide con el archivo autorizado");
        }
        return blob.stream;
      },
    };
    const nota = typeof comentario === "string" ? comentario : null;
    const resultado = destino.archivoId !== undefined
      ? await subirVersion(ctx, destino.archivoId, archivo, nota)
      : await subirArchivo(ctx, { ...destino, archivo, comentario: nota });
    await del(clave).catch(() => undefined); // La carga temporal también expira automáticamente.
    return json(resultado, 201);
  }

  const { nombre, bytes, mime, comentario } = datos;
  if (typeof nombre !== "string" || nombre.length > 255 || typeof bytes !== "number" || !Number.isSafeInteger(bytes)) {
    throw new ErrorNube(400, "ARCHIVO_INVALIDO", "El nombre o el tamaño del archivo no es válido");
  }
  const destino = datos.archivoId == null
    ? { proyectoId: id(datos.proyectoId), carpetaId: idOpcional(datos.carpetaId) }
    : { archivoId: id(datos.archivoId) };
  await autorizarCargaDirecta(ctx, destino, nombre, bytes);
  const clave = `temporales/${usuario}/${randomUUID()}`;
  const vencimiento = Date.now() + 15 * 60 * 1000;
  const token = await generateClientTokenFromReadWriteToken({
    pathname: clave,
    maximumSizeInBytes: bytes,
    allowedContentTypes: ["application/octet-stream"],
    validUntil: vencimiento,
    ttlDays: 1,
  });
  const comprobante = await new SignJWT({
    ...destino, clave, nombre, bytes,
    mime: typeof mime === "string" ? mime : "",
    comentario: typeof comentario === "string" ? comentario : null,
  }).setProtectedHeader({ alg: "HS256" }).setAudience(audience).setSubject(usuario)
    .setExpirationTime(Math.floor(vencimiento / 1000)).sign(claveFirma());
  return json({ directa: true, clave, token, comprobante });
});
