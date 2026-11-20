"use server";

import { redirect } from "next/navigation";

import { protegerRuta } from "@/lib/protegerRuta";
import {
  cambiarEstado,
  crearObservacion,
  obtenerProyecto,
} from "@/lib/proyectos/servicio";
import {
  TRANSICIONES_DOCENTE,
  type EstadoProyecto,
} from "@/lib/proyectos/tipos";

const RUTA = "/docente/revisiones";

export async function guardarObservacion(formData: FormData) {
  const usuario = await protegerRuta("DOCENTE");

  const proyectoId = Number(formData.get("proyectoId"));
  const texto = String(formData.get("texto") ?? "").trim();

  if (texto.length < 5 || texto.length > 500) redirect(`${RUTA}?error=datos`);

  const proyecto = await obtenerProyecto(proyectoId);

  // Solo el docente responsable, y no sobre proyectos cerrados
  if (
    !proyecto ||
    proyecto.docenteId !== usuario.id ||
    proyecto.estado === "FINALIZADO"
  ) {
    redirect(`${RUTA}?error=datos`);
  }

  await crearObservacion({
    proyectoId: proyecto.id,
    docenteId: usuario.id,
    texto,
  });

  redirect(`${RUTA}?observacion=1`);
}

export async function actualizarEstado(formData: FormData) {
  const usuario = await protegerRuta("DOCENTE");

  const proyectoId = Number(formData.get("proyectoId"));
  const nuevoEstado = String(formData.get("estado") ?? "") as EstadoProyecto;

  const proyecto = await obtenerProyecto(proyectoId);

  if (
    !proyecto ||
    proyecto.docenteId !== usuario.id ||
    !TRANSICIONES_DOCENTE[proyecto.estado].includes(nuevoEstado)
  ) {
    redirect(`${RUTA}?error=estado`);
  }

  await cambiarEstado(proyecto.id, nuevoEstado);

  redirect(`${RUTA}?estado=1`);
}