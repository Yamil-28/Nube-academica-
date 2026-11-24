import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";
import { Suspense } from "react";
import Link from "next/link";
import { FolderPlus } from "lucide-react";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import { listarProyectosSinEquipo } from "@/lib/equipos/servicio";
import { MENSAJE_ERROR, type ErrorEquipo } from "@/lib/equipos/tipos";
import { protegerRuta } from "@/lib/protegerRuta";

import { registrarEquipo } from "./acciones";
import estilos from "./page.module.css";

type Parametros = { error?: string };

function textoDeError(codigo?: string): string | null {
  if (!codigo) return null;

  if (codigo === "nombre") {
    return "El nombre del equipo debe tener entre 3 y 60 caracteres.";
  }

  if (Object.prototype.hasOwnProperty.call(MENSAJE_ERROR, codigo)) {
    return MENSAJE_ERROR[codigo as ErrorEquipo];
  }

  return "No se pudo crear el equipo.";
}

async function ContenidoNuevoEquipo({
  parametros,
}: {
  parametros: Promise<Parametros>;
}) {
  const usuario = await protegerRuta("ESTUDIANTE");
  const { error } = await parametros;

  const proyectos = await listarProyectosSinEquipo(usuario.id);
  const mensaje = textoDeError(error);

  return (
    <EstructuraDashboard usuario={usuario.usuario} rol={usuario.rol}>
      <div className={estilos.contenedor}>
        <section>
          <span className={estilos.etiqueta}>EQUIPOS DE TRABAJO</span>
          <h1>Crear equipo</h1>
          <p>
            Cada proyecto tiene un equipo. Quien lo crea queda como líder y
            después podrá agregar a los demás integrantes.
          </p>
        </section>

        {mensaje && <p className={estilos.error}>{mensaje}</p>}

        {proyectos.length === 0 ? (
          <section className={estilos.panel}>
            <div className={estilos.vacio}>
              <FolderPlus size={35} />
              <h3>No tienes proyectos sin equipo</h3>
              <p>
                Para crear un equipo necesitas un proyecto activo que todavía no
                tenga uno.{" "}
                <Link href="/estudiante/proyectos/nuevo">Crear un proyecto</Link>
              </p>
            </div>
          </section>
        ) : (
          <form action={registrarEquipo} className={estilos.formulario}>
            <label>
              Nombre del equipo
              <input name="nombre" type="text" maxLength={60} required />
            </label>

            <label>
              Proyecto
              <select name="proyectoId" required defaultValue="">
                <option value="" disabled>
                  Selecciona un proyecto
                </option>
                {proyectos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.titulo}
                  </option>
                ))}
              </select>
            </label>

            <div className={estilos.botones}>
              <Link href="/estudiante/equipos" className={estilos.cancelar}>
                Cancelar
              </Link>
              <button type="submit" className={estilos.guardar}>
                Crear equipo
              </button>
            </div>
          </form>
        )}
      </div>
    </EstructuraDashboard>
  );
}

export default function PaginaCrearEquipo({
  searchParams,
}: {
  searchParams: Promise<Parametros>;
}) {
  return (
    <Suspense fallback={<CargandoDashboard />}>
      <ContenidoNuevoEquipo parametros={searchParams} />
    </Suspense>
  );
}