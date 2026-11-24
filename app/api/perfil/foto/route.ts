import { randomUUID } from "node:crypto";
import { connection } from "next/server";
import sharp from "sharp";

import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/sesion";
import { MAX_FOTO_PERFIL, TIPOS_FOTO_PERFIL } from "@/lib/fotoPerfil";

const noAutorizado = () => Response.json({ mensaje: "Tu sesión ya no es válida." }, { status: 401 });
const demasiadoGrande = () => Response.json({ mensaje: "La foto debe pesar como máximo 2 MB." }, { status: 413 });

function cuentaActual(sesion: NonNullable<Awaited<ReturnType<typeof obtenerSesion>>>) {
  return {
    id: sesion.id,
    usuario: sesion.usuario,
    rol: sesion.rol,
    versionSesion: sesion.versionSesion,
    activo: true,
  };
}

export async function GET() {
  await connection();
  const sesion = await obtenerSesion();
  if (!sesion) return noAutorizado();

  const foto = await prisma.fotoPerfil.findFirst({
    where: { usuarioId: sesion.id, usuario: cuentaActual(sesion) },
    select: { imagen: true },
  });
  if (!foto) return new Response(null, { status: 404 });

  return new Response(Buffer.from(foto.imagen), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function PUT(req: Request) {
  const sesion = await obtenerSesion();
  if (!sesion) return noAutorizado();

  const cuenta = cuentaActual(sesion);
  if (!await prisma.usuario.findUnique({ where: cuenta, select: { id: true } })) {
    return noAutorizado();
  }
  if (Number(req.headers.get("content-length")) > MAX_FOTO_PERFIL) return demasiadoGrande();
  if (!TIPOS_FOTO_PERFIL.some((tipo) => tipo === req.headers.get("content-type")) || !req.body) {
    return Response.json({ mensaje: "Selecciona una imagen JPG, PNG o WebP." }, { status: 415 });
  }

  const lector = req.body.getReader();
  const partes: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await lector.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_FOTO_PERFIL) {
        await lector.cancel().catch(() => {});
        return demasiadoGrande();
      }
      partes.push(value);
    }
  } catch {
    return Response.json({ mensaje: "No se pudo leer la foto enviada." }, { status: 400 });
  } finally {
    lector.releaseLock();
  }

  let imagen: Uint8Array<ArrayBuffer>;
  try {
    const original = sharp(Buffer.concat(partes, total), { limitInputPixels: 16_000_000 });
    const { format, pages } = await original.metadata();
    if ((format !== "jpeg" && format !== "png" && format !== "webp") || (pages ?? 1) > 1) {
      return Response.json({ mensaje: "Selecciona una imagen JPG, PNG o WebP sin animación." }, { status: 415 });
    }
    imagen = new Uint8Array(await original.autoOrient().resize(256, 256, { fit: "cover" }).webp({ quality: 86 }).toBuffer());
  } catch {
    return Response.json({ mensaje: "La imagen no se pudo abrir o supera el tamaño de 16 megapíxeles." }, { status: 422 });
  }

  const revision = randomUUID();
  try {
    await prisma.usuario.update({
      where: cuenta,
      data: {
        fotoPerfil: { upsert: { create: { imagen, revision }, update: { imagen, revision } } },
      },
      select: { id: true },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") return noAutorizado();
    console.error("No se pudo guardar la foto de perfil", error);
    return Response.json({ mensaje: "No se pudo guardar la foto. Inténtalo nuevamente." }, { status: 500 });
  }
  return Response.json({ revision });
}
