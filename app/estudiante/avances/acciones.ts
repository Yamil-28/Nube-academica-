"use server";

import { redirect } from "next/navigation";

import { protegerRuta } from "@/lib/protegerRuta";
import {
  cambiarEstado,
  crearAvance,
  esParticipanteDeProyecto,
  obtenerProyecto,
} from "@/lib/proyectos/servicio";

const RUTA_ERROR = "/estudiante/avances?error=datos";

export async function guardarAvance(formData: FormData) {
  const usuario = await protegerRuta("ESTUDIANTE");

  const proyectoId = Number(formData.get("proyectoId"));
  const descripcion = String(formData.get("descripcion") ?? "").trim();

  if (descripcion.length < 5 || descripcion.length > 500) redirect(RUTA_ERROR);

  const proyecto = await obtenerProyecto(proyectoId);

  if (!proyecto || proyecto.estado === "FINALIZADO") redirect(RUTA_ERROR);

  // Solo el creador o los integrantes del equipo
  const participa = await esParticipanteDeProyecto(proyecto.id, usuario.id);
  if (!participa) redirect(RUTA_ERROR);

  await crearAvance({
    proyectoId: proyecto.id,
    autorId: usuario.id,
    descripcion,
  });

  // El primer avance pone el proyecto en desarrollo
  if (proyecto.estado === "REGISTRADO") {
    await cambiarEstado(proyecto.id, "EN_DESARROLLO");
  }

  redirect("/estudiante/avances?registrado=1");
}