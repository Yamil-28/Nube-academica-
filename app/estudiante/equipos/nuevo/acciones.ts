"use server";

import { redirect } from "next/navigation";

import { crearEquipo } from "@/lib/equipos/servicio";
import { protegerRuta } from "@/lib/protegerRuta";

const RUTA = "/estudiante/equipos/nuevo";

export async function registrarEquipo(formData: FormData) {
  const usuario = await protegerRuta("ESTUDIANTE");

  const nombre = String(formData.get("nombre") ?? "").trim();
  const proyectoId = Number(formData.get("proyectoId"));

  if (nombre.length < 3 || nombre.length > 60) {
    redirect(`${RUTA}?error=nombre`);
  }

  const resultado = await crearEquipo({
    nombre,
    proyectoId,
    solicitanteId: usuario.id,
  });

  if (!resultado.ok) {
    redirect(`${RUTA}?error=${resultado.error}`);
  }

  redirect("/estudiante/equipos?creado=1");
}