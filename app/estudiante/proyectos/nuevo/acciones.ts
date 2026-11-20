"use server";

import { redirect } from "next/navigation";

import { protegerRuta } from "@/lib/protegerRuta";
import { prisma } from "@/lib/prisma";
import { obtenerMaterias } from "@/lib/proyectos/materiasSimuladas";
import { crearProyecto } from "@/lib/proyectos/servicio";

const RUTA_ERROR = "/estudiante/proyectos/nuevo?error=datos";

export async function registrarProyecto(formData: FormData) {
  const usuario = await protegerRuta("ESTUDIANTE");

  const titulo = String(formData.get("titulo") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const materiaId = Number(formData.get("materiaId"));
  const docenteId = Number(formData.get("docenteId"));
  const semestreNumero = Number(formData.get("semestre"));

  if (titulo.length < 5 || titulo.length > 120) redirect(RUTA_ERROR);
  if (descripcion.length < 10 || descripcion.length > 1000) redirect(RUTA_ERROR);
  if (semestreNumero !== 1 && semestreNumero !== 2) redirect(RUTA_ERROR);

  const materias = await obtenerMaterias();
  if (!materias.some((m) => m.id === materiaId)) redirect(RUTA_ERROR);

  const docente = await prisma.usuario.findFirst({
    where: { id: docenteId, rol: "DOCENTE", activo: true },
    select: { id: true },
  });
  if (!docente) redirect(RUTA_ERROR);

  await crearProyecto({
    titulo,
    descripcion,
    materiaId,
    docenteId: docente.id,
    creadoPorId: usuario.id,
    gestion: new Date().getFullYear(),
    semestre: semestreNumero === 2 ? 2 : 1,
  });

  redirect("/estudiante/proyectos?creado=1");
}