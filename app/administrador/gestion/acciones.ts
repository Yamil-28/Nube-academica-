"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { protegerRuta } from "@/lib/protegerRuta";
import { prisma } from "@/lib/prisma";
import { agregarMiembro, crearEquipo } from "@/lib/equipos/servicio";
import { crearProyecto } from "@/lib/proyectos/servicio";
import { obtenerMaterias } from "@/lib/proyectos/materiasSimuladas";

export async function guardarProyecto(form: FormData) {
  await protegerRuta("ADMINISTRADOR");
  const error = "/administrador/gestion?modo=proyecto&error=datos";
  const titulo = String(form.get("titulo") ?? "").trim();
  const descripcion = String(form.get("descripcion") ?? "").trim();
  const materiaId = Number(form.get("materiaId"));
  const docenteId = Number(form.get("docenteId"));
  const estudianteId = Number(form.get("estudianteId"));
  const semestre = Number(form.get("semestre"));
  if (titulo.length < 5 || titulo.length > 120 || descripcion.length < 10 || descripcion.length > 1000 ||
      (semestre !== 1 && semestre !== 2) ||
      ![materiaId, docenteId, estudianteId].every((id) => Number.isSafeInteger(id) && id > 0)) redirect(error);
  const [materias, docente, estudiante] = await Promise.all([
    obtenerMaterias(),
    prisma.usuario.count({ where: { id: docenteId, activo: true, rol: "DOCENTE" } }),
    prisma.usuario.count({ where: { id: estudianteId, activo: true, rol: "ESTUDIANTE" } }),
  ]);
  if (!materias.some((materia) => materia.id === materiaId) || !docente || !estudiante) redirect(error);
  await crearProyecto({
    titulo, descripcion, materiaId, docenteId, creadoPorId: estudianteId,
    gestion: Number(new Intl.DateTimeFormat("es-BO", { year: "numeric", timeZone: "America/La_Paz" }).format(new Date())),
    semestre,
  });
  revalidatePath("/administrador/proyectos");
  redirect("/administrador/proyectos?guardado=proyecto");
}

export async function guardarEquipo(form: FormData) {
  const admin = await protegerRuta("ADMINISTRADOR");
  const nombre = String(form.get("nombre") ?? "").trim();
  if (nombre.length < 3 || nombre.length > 60) redirect("/administrador/gestion?modo=equipo&error=datos");
  const resultado = await crearEquipo({
    nombre, proyectoId: Number(form.get("proyectoId")), solicitanteId: admin.id, esAdministrador: true,
  });
  if (!resultado.ok) redirect(`/administrador/gestion?modo=equipo&error=${resultado.error}`);
  revalidatePath("/administrador/equipos");
  redirect("/administrador/equipos?guardado=equipo");
}

export async function guardarIntegrante(form: FormData) {
  const admin = await protegerRuta("ADMINISTRADOR");
  const equipoId = Number(form.get("equipoId"));
  const resultado = await agregarMiembro({
    equipoId, usuarioId: Number(form.get("estudianteId")), solicitanteId: admin.id, esAdministrador: true,
  });
  if (!resultado.ok) redirect(`/administrador/gestion?modo=integrante&equipo=${equipoId}&error=${resultado.error}`);
  revalidatePath("/administrador/equipos");
  revalidatePath("/administrador/integrantes");
  redirect("/administrador/integrantes?guardado=integrante");
}
