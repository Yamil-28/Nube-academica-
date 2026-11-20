"use server";

import { redirect } from "next/navigation";

import {
  agregarMiembro,
  cambiarRolMiembro,
  quitarMiembro,
} from "@/lib/equipos/servicio";
import { protegerRuta } from "@/lib/protegerRuta";

const RUTA = "/estudiante/integrantes";

export async function agregarIntegrante(formData: FormData) {
  const usuario = await protegerRuta("ESTUDIANTE");

  const resultado = await agregarMiembro({
    equipoId: Number(formData.get("equipoId")),
    usuarioId: Number(formData.get("usuarioId")),
    solicitanteId: usuario.id,
  });

  if (!resultado.ok) redirect(`${RUTA}?error=${resultado.error}`);

  redirect(`${RUTA}?ok=agregado`);
}

export async function quitarIntegrante(formData: FormData) {
  const usuario = await protegerRuta("ESTUDIANTE");

  const resultado = await quitarMiembro({
    equipoId: Number(formData.get("equipoId")),
    usuarioId: Number(formData.get("usuarioId")),
    solicitanteId: usuario.id,
  });

  if (!resultado.ok) redirect(`${RUTA}?error=${resultado.error}`);

  redirect(`${RUTA}?ok=quitado`);
}

export async function cambiarRol(formData: FormData) {
  const usuario = await protegerRuta("ESTUDIANTE");

  const rol = String(formData.get("rol") ?? "");

  if (rol !== "LIDER" && rol !== "INTEGRANTE") {
    redirect(`${RUTA}?error=no_encontrado`);
  }

  const resultado = await cambiarRolMiembro({
    equipoId: Number(formData.get("equipoId")),
    usuarioId: Number(formData.get("usuarioId")),
    rol,
    solicitanteId: usuario.id,
  });

  if (!resultado.ok) redirect(`${RUTA}?error=${resultado.error}`);

  redirect(`${RUTA}?ok=rol`);
}