import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";
import { Suspense } from "react";
import Link from "next/link";
import { ClipboardList } from "lucide-react";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import { protegerRuta } from "@/lib/protegerRuta";
import { obtenerNombresUsuarios } from "@/lib/proyectos/nombres";
import {
  listarAvancesDeProyectos,
  listarObservacionesDeProyectos,
  listarProyectosDeUsuario,
} from "@/lib/proyectos/servicio";
import { ETIQUETA_ESTADO } from "@/lib/proyectos/tipos";

import { guardarAvance } from "./acciones";
import estilos from "./page.module.css";

type Parametros = { registrado?: string; error?: string };

async function ContenidoAvances({
  parametros,
}: {
  parametros: Promise<Parametros>;
}) {
  const usuario = await protegerRuta("ESTUDIANTE");
  const { registrado, error } = await parametros;

  const proyectos = await listarProyectosDeUsuario(usuario.id);
  const ids = proyectos.map((p) => p.id);

  const avances = await listarAvancesDeProyectos(ids);
  const observaciones = await listarObservacionesDeProyectos(ids);
  
  const nombres = await obtenerNombresUsuarios([
    ...observaciones.map((o) => o.docenteId),
    ...avances.map((a) => a.autorId),
  ]);

  const titulos = new Map(proyectos.map((p) => [p.id, p.titulo]));
  const activos = proyectos.filter((p) => p.estado !== "FINALIZADO");

  return (
    <EstructuraDashboard usuario={usuario.usuario} rol={usuario.rol}>
      <div className={estilos.contenedor}>
        <section>
          <span className={estilos.etiqueta}>PROYECTOS ACADÉMICOS</span>
          <h1>Mis avances</h1>
          <p>Registra el progreso de tus proyectos para que el docente pueda revisarlo.</p>
        </section>

        {registrado === "1" && (
          <p className={estilos.aviso}>Avance registrado correctamente.</p>
        )}
        {error && (
          <p className={estilos.error}>
            Revisa los datos: elige un proyecto activo y escribe entre 5 y 500 caracteres.
          </p>
        )}

        {proyectos.length === 0 ? (
          <section className={estilos.panel}>
            <div className={estilos.vacio}>
              <ClipboardList size={35} />
              <h3>Primero necesitas un proyecto</h3>
              <p>
                <Link href="/estudiante/proyectos/nuevo">Crea uno aquí</Link> para
                poder registrar avances.
              </p>
            </div>
          </section>
        ) : (
          <>
            {activos.length > 0 && (
              <form action={guardarAvance} className={estilos.formulario}>
                <label>
                  Proyecto
                  <select name="proyectoId" required defaultValue="">
                    <option value="" disabled>Selecciona un proyecto</option>
                    {activos.map((p) => (
                      <option key={p.id} value={p.id}>{p.titulo}</option>
                    ))}
                  </select>
                </label>

                <label>
                  ¿Qué avanzaron?
                  <textarea name="descripcion" rows={4} maxLength={500} required />
                </label>

                <div className={estilos.botones}>
                  <button type="submit" className={estilos.guardar}>
                    Registrar avance
                  </button>
                </div>
              </form>
            )}

            <section className={estilos.panel}>
              <h2 className={estilos.subtitulo}>Observaciones del docente</h2>

              {observaciones.length === 0 ? (
                <p className={estilos.textoSuave}>
                  Tu docente aún no registró observaciones.
                </p>
              ) : (
                <ul className={estilos.lista}>
                  {observaciones.map((o) => (
                    <li key={o.id} className={estilos.itemDocente}>
                      <div className={estilos.itemCabecera}>
                        <strong>{titulos.get(o.proyectoId) ?? "Proyecto"}</strong>
                        <span>{o.fecha.toLocaleString("es-BO")}</span>
                      </div>
                      <span className={estilos.autor}>
                        {nombres.get(o.docenteId) ?? "Docente"}
                      </span>
                      <p>{o.texto}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className={estilos.panel}>
              <h2 className={estilos.subtitulo}>Historial de avances</h2>

              {avances.length === 0 ? (
                <p className={estilos.textoSuave}>Aún no registraste avances.</p>
              ) : (
                <ul className={estilos.lista}>
                  {avances.map((a) => (
                    <li key={a.id} className={estilos.item}>
                      <div className={estilos.itemCabecera}>
                        <strong>{titulos.get(a.proyectoId) ?? "Proyecto"}</strong>
                        <span>{a.fecha.toLocaleString("es-BO")}</span>
                      </div>
                      <span className={estilos.autorAvance}>
                        Registrado por {nombres.get(a.autorId) ?? "un integrante"}
                      </span>
                      <p>{a.descripcion}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <p className={estilos.textoSuave}>
              Estado de tus proyectos:{" "}
              {proyectos
                .map((p) => `${p.titulo} (${ETIQUETA_ESTADO[p.estado]})`)
                .join(", ")}
            </p>
          </>
        )}
      </div>
    </EstructuraDashboard>
  );
}

export default function PaginaMisAvances({
  searchParams,
}: {
  searchParams: Promise<Parametros>;
}) {
  return (
    <Suspense fallback={<CargandoDashboard />}>
      <ContenidoAvances parametros={searchParams} />
    </Suspense>
  );
}