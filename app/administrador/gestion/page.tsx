import { Suspense } from "react";
import Link from "next/link";
import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";
import { parametro, type ParametrosListado } from "@/componentes/dashboard/FiltrosListado";
import { protegerRuta } from "@/lib/protegerRuta";
import { prisma } from "@/lib/prisma";
import { obtenerMaterias } from "@/lib/proyectos/materiasSimuladas";
import { listarEstudiantesDisponibles } from "@/lib/equipos/servicio";
import { guardarEquipo, guardarIntegrante, guardarProyecto } from "./acciones";
import estilos from "./page.module.css";

const mensajes: Record<string, string> = {
  datos: "Revisa los datos del formulario.",
  proyecto_invalido: "El proyecto debe tener un estudiante responsable activo.",
  ya_tiene_equipo: "El proyecto ya tiene un equipo.",
  proyecto_finalizado: "El proyecto está finalizado.",
  estudiante_invalido: "Selecciona un estudiante activo.",
  ya_es_miembro: "El estudiante ya forma parte de este equipo.",
  no_encontrado: "El equipo no está disponible.",
};

function Opciones({ filas }: { filas: { id: number; nombre: string }[] }) {
  return <><option value="">Seleccionar</option>{filas.map((fila) => <option key={fila.id} value={fila.id}>{fila.nombre}</option>)}</>;
}

async function Contenido({ searchParams }: { searchParams: Promise<ParametrosListado> }) {
  await protegerRuta("ADMINISTRADOR");
  const filtros = await searchParams;
  const modo = parametro(filtros, "modo");
  const error = parametro(filtros, "error");
  const equipoId = Number(parametro(filtros, "equipo"));
  const esProyecto = modo === "proyecto";
  const esIntegrante = modo === "integrante";
  const equipo = esIntegrante && Number.isSafeInteger(equipoId) && equipoId > 0
    ? await prisma.equipo.findFirst({
      where: { id: equipoId, proyecto: { estado: { not: "FINALIZADO" } } }, select: { id: true, nombre: true },
    }) : null;
  const [materias, docentes, estudiantes, proyectos, equipos] = await Promise.all([
    esProyecto ? obtenerMaterias() : [],
    esProyecto ? prisma.usuario.findMany({ where: { rol: "DOCENTE", activo: true }, select: { id: true, nombre: true }, orderBy: { nombre: "asc" } }) : [],
    esProyecto || equipo ? listarEstudiantesDisponibles(equipo?.id ?? 0) : [],
    !esProyecto && !esIntegrante ? prisma.proyecto.findMany({
      where: { equipo: null, estado: { not: "FINALIZADO" }, creador: { rol: "ESTUDIANTE", activo: true } },
      select: { id: true, titulo: true, creador: { select: { nombre: true } } }, orderBy: { titulo: "asc" },
    }) : [],
    esIntegrante && !equipo ? prisma.equipo.findMany({
      where: { proyecto: { estado: { not: "FINALIZADO" } } },
      select: { id: true, nombre: true }, orderBy: { nombre: "asc" },
    }) : [],
  ]);
  const titulo = esProyecto ? "Crear proyecto" : esIntegrante ? "Añadir integrante" : "Crear equipo";
  const disponible = esProyecto ? materias.length && docentes.length && estudiantes.length
    : esIntegrante ? equipo && estudiantes.length : proyectos.length;

  return (
    <section className={estilos.panel}>
      <h1>{titulo}</h1>
      {error && <p role="alert">{mensajes[error] ?? "No se pudo completar la operación."}</p>}
      {disponible ? (
        <form className={estilos.formulario} action={esProyecto ? guardarProyecto : esIntegrante ? guardarIntegrante : guardarEquipo}>
          {esProyecto ? <>
            <label>Título<input name="titulo" required minLength={5} maxLength={120} /></label>
            <label>Descripción<textarea name="descripcion" required minLength={10} maxLength={1000} /></label>
            <label>Materia<select name="materiaId" required><Opciones filas={materias} /></select></label>
            <label>Docente<select name="docenteId" required><Opciones filas={docentes} /></select></label>
            <label>Estudiante responsable<select name="estudianteId" required><Opciones filas={estudiantes} /></select></label>
            <label>Semestre<select name="semestre" required><option value="1">Primer semestre</option><option value="2">Segundo semestre</option></select></label>
          </> : esIntegrante ? <>
            <p>Equipo <strong>{equipo?.nombre}</strong></p>
            <input type="hidden" name="equipoId" value={equipo?.id} />
            <label>Estudiante<select name="estudianteId" required><Opciones filas={estudiantes} /></select></label>
          </> : <>
            <label>Nombre del equipo<input name="nombre" required minLength={3} maxLength={60} /></label>
            <label>Proyecto<select name="proyectoId" required><Opciones filas={proyectos.map((p) => ({ id: p.id, nombre: `${p.titulo} · ${p.creador.nombre}` }))} /></select></label>
            <p>El estudiante responsable del proyecto quedará como líder del equipo.</p>
          </>}
          <button type="submit">{titulo}</button>
        </form>
      ) : equipos.length ? (
        <form className={estilos.formulario} action="/administrador/gestion" method="get">
          <input type="hidden" name="modo" value="integrante" />
          <label>Equipo<select name="equipo" required><Opciones filas={equipos} /></select></label>
          <button type="submit">Continuar</button>
        </form>
      ) : <p>{esProyecto ? "Se requieren materias, docentes y estudiantes activos."
        : esIntegrante ? "No hay un equipo disponible o estudiantes activos para añadir."
        : "No hay proyectos activos sin equipo con un estudiante responsable."}</p>}
      <Link href={esProyecto ? "/administrador/proyectos" : "/administrador/equipos"}>Volver al listado</Link>
    </section>
  );
}

export default function PaginaGestion({ searchParams }: { searchParams: Promise<ParametrosListado> }) {
  return <Suspense fallback={<CargandoDashboard />}><Contenido searchParams={searchParams} /></Suspense>;
}
