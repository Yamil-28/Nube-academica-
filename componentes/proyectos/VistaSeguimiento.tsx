import Link from "next/link";

import {
  listarAvancesDeProyectos,
  listarObservacionesDeProyectos,
  listarProyectosDeDocente,
  listarProyectosDeUsuario,
} from "@/lib/proyectos/servicio";
import { ESTADOS_PROYECTO, ETIQUETA_ESTADO } from "@/lib/proyectos/tipos";
import { protegerRuta } from "@/lib/protegerRuta";

import estilos from "./VistaSeguimiento.module.css";

type Propiedades = {
  rol: "DOCENTE" | "ESTUDIANTE";
  vista: "actividades" | "estado" | "observaciones";
};

const FECHA = new Intl.DateTimeFormat("es-BO", {
  dateStyle: "medium",
  timeZone: "America/La_Paz",
});

const TITULOS = {
  actividades: "Actividades",
  estado: "Estado de proyectos",
  observaciones: "Observaciones docentes",
};

export default async function VistaSeguimiento({ rol, vista }: Propiedades) {
  const usuario = await protegerRuta(rol);
  const docente = rol === "DOCENTE";
  const proyectos = await (docente
    ? listarProyectosDeDocente(usuario.id)
    : listarProyectosDeUsuario(usuario.id));
  const ids = proyectos.map(({ id }) => id);
  const proyectosPorId = new Map(proyectos.map((proyecto) => [proyecto.id, proyecto]));
  const [avances, observaciones] = await Promise.all([
    vista === "actividades" ? listarAvancesDeProyectos(ids) : [],
    vista !== "estado" ? listarObservacionesDeProyectos(ids) : [],
  ]);
  const actividades = [
    ...avances.map((avance) => ({
      clave: "avance-" + avance.id,
      tipo: "Avance",
      texto: avance.descripcion,
      fecha: avance.fecha,
      proyectoId: avance.proyectoId,
    })),
    ...observaciones.map((observacion) => ({
      clave: "observacion-" + observacion.id,
      tipo: "Observación docente",
      texto: observacion.texto,
      fecha: observacion.fecha,
      proyectoId: observacion.proyectoId,
    })),
  ].sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

  const esEstado = vista === "estado";
  const rutaAccion = docente ? "/docente/revisiones" : "/estudiante/avances";
  const textoAccion = docente ? "Revisar avances" : "Ir a Mis avances";

  return (
    <div className={estilos.seguimiento}>
      <header className={estilos.encabezado}>
        <div>
          <span className={estilos.etiqueta}>SEGUIMIENTO</span>
          <h1>{TITULOS[vista]}</h1>
          <p>
            {esEstado
              ? "Consulta la etapa actual de cada proyecto."
              : vista === "observaciones"
                ? "Consulta los comentarios del docente sobre tus proyectos."
                : "Consulta los avances y las observaciones de tus proyectos, del más reciente al más antiguo."}
          </p>
        </div>
        <Link className={estilos.accion} href={rutaAccion}>{textoAccion}</Link>
      </header>

      {esEstado && proyectos.length > 0 && (
        <dl className={estilos.resumen} aria-label="Proyectos por estado">
          {ESTADOS_PROYECTO.map((estado) => (
            <div className={estilos.panel} key={estado}>
              <dt>{ETIQUETA_ESTADO[estado]}</dt>
              <dd>{proyectos.filter((proyecto) => proyecto.estado === estado).length}</dd>
            </div>
          ))}
        </dl>
      )}

      {proyectos.length === 0 ? (
        <p className={estilos.panel}>{docente ? "Aún no tienes proyectos asignados." : "Aún no participas en proyectos."}</p>
      ) : esEstado ? (
        <div className={estilos.panel}>
          <table className={estilos.tabla} aria-label="Estado de mis proyectos">
            <thead>
              <tr><th scope="col">Proyecto</th><th scope="col">Estado</th><th scope="col">Inicio</th><th scope="col">Cierre</th></tr>
            </thead>
            <tbody>
              {proyectos.map((proyecto) => (
                <tr key={proyecto.id}>
                  <th scope="row">{proyecto.titulo}</th>
                  <td><span className={estilos.estado}>{ETIQUETA_ESTADO[proyecto.estado]}</span></td>
                  <td>{FECHA.format(proyecto.fechaInicio)}</td>
                  <td>{proyecto.fechaCierre ? FECHA.format(proyecto.fechaCierre) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : actividades.length === 0 ? (
        <p className={estilos.panel}>Todavía no hay {vista === "observaciones" ? "observaciones" : "actividades"} registradas.</p>
      ) : (
        <ul className={estilos.lista}>
          {actividades.map(({ clave, tipo, texto, fecha, proyectoId }) => (
            <li className={estilos.panel} key={clave}>
              <div className={estilos.actividad}>
                <strong>{proyectosPorId.get(proyectoId)?.titulo}</strong>
                <span className={estilos.estado}>{tipo}</span>
                <time dateTime={fecha.toISOString()}>{FECHA.format(fecha)}</time>
              </div>
              <p className={estilos.texto}>{texto}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
