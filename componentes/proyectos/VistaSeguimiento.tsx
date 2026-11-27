import Link from "next/link";
import FiltrosListado, { coincide, parametro, type ParametrosListado } from "@/componentes/dashboard/FiltrosListado";

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
  searchParams: Promise<ParametrosListado>;
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

const TIPOS_ACTIVIDAD = [
  { valor: "avance", etiqueta: "Avance" },
  { valor: "observacion", etiqueta: "Observación docente" },
];

const FILTROS_POR_VISTA = {
  estado: { segmento: "seguimiento", etiqueta: "Buscar proyecto o estado" },
  actividades: { segmento: "actividades", etiqueta: "Buscar proyecto o actividad" },
  observaciones: { segmento: "observaciones", etiqueta: "Buscar proyecto u observación" },
};

export default async function VistaSeguimiento({ rol, vista, searchParams }: Propiedades) {
  const usuario = await protegerRuta(rol);
  const docente = rol === "DOCENTE";
  const esEstado = vista === "estado";
  const filtros = await searchParams;
  const filtroVista = FILTROS_POR_VISTA[vista];
  const q = parametro(filtros, "q");
  const estado = esEstado ? parametro(filtros, "estado") : "";
  const tipo = vista === "actividades" ? parametro(filtros, "tipo") : "";
  const proyectos = await (docente
    ? listarProyectosDeDocente(usuario.id)
    : listarProyectosDeUsuario(usuario.id));
  const ids = proyectos.map(({ id }) => id);
  const proyectosPorId = new Map(proyectos.map((proyecto) => [proyecto.id, proyecto]));
  const proyectoSeleccionado = parametro(filtros, "proyecto");
  const proyectosVisibles = proyectos.filter((proyecto) =>
    (!estado || proyecto.estado === estado) &&
    coincide(q, proyecto.titulo, ETIQUETA_ESTADO[proyecto.estado])
  );
  const [avances, observaciones] = await Promise.all([
    vista === "actividades" ? listarAvancesDeProyectos(ids) : [],
    vista !== "estado" ? listarObservacionesDeProyectos(ids) : [],
  ]);
  const actividades = [
    ...avances.map((avance) => ({
      clave: "avance-" + avance.id,
      categoria: "avance",
      tipo: "Avance",
      texto: avance.descripcion,
      fecha: avance.fecha,
      proyectoId: avance.proyectoId,
    })),
    ...observaciones.map((observacion) => ({
      clave: "observacion-" + observacion.id,
      categoria: "observacion",
      tipo: "Observación docente",
      texto: observacion.texto,
      fecha: observacion.fecha,
      proyectoId: observacion.proyectoId,
    })),
  ].sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

  const actividadesVisibles = actividades.filter((actividad) =>
    (!tipo || actividad.categoria === tipo) &&
    (!proyectoSeleccionado || String(actividad.proyectoId) === proyectoSeleccionado) &&
    coincide(q, actividad.texto, actividad.tipo, proyectosPorId.get(actividad.proyectoId)?.titulo)
  );
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

      {proyectos.length > 0 && (
        <FiltrosListado
          ruta={`/${docente ? "docente" : "estudiante"}/${filtroVista.segmento}`}
          filtros={filtros}
          etiqueta={filtroVista.etiqueta}
          selectores={esEstado ? [
            { nombre: "estado", todos: "Todos los estados", opciones: ESTADOS_PROYECTO.map((valor) => ({ valor, etiqueta: ETIQUETA_ESTADO[valor] })) },
          ] : [
            { nombre: "proyecto", todos: "Todos los proyectos", opciones: proyectos.map(({ id, titulo }) => ({ valor: String(id), etiqueta: titulo })) },
            ...(vista === "actividades" ? [{ nombre: "tipo", todos: "Todos los tipos", opciones: TIPOS_ACTIVIDAD }] : []),
          ]}
        />
      )}

      {proyectos.length === 0 ? (
        <p className={estilos.panel}>{docente ? "Aún no tienes proyectos asignados." : "Aún no participas en proyectos."}</p>
      ) : esEstado ? (
        proyectosVisibles.length === 0 ? (
          <p className={estilos.panel}>No hay proyectos que coincidan con los filtros.</p>
        ) : (
        <div className={estilos.panel}>
          <table className={estilos.tabla} aria-label="Estado de mis proyectos">
            <thead>
              <tr><th scope="col">Proyecto</th><th scope="col">Estado</th><th scope="col">Inicio</th><th scope="col">Cierre</th></tr>
            </thead>
            <tbody>
              {proyectosVisibles.map((proyecto) => (
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
        )
      ) : actividades.length === 0 ? (
        <p className={estilos.panel}>Todavía no hay {vista === "observaciones" ? "observaciones" : "actividades"} registradas.</p>
      ) : actividadesVisibles.length === 0 ? (
        <p className={estilos.panel}>No hay {vista === "observaciones" ? "observaciones" : "actividades"} que coincidan con los filtros.</p>
      ) : (
        <ul className={estilos.lista}>
          {actividadesVisibles.map(({ clave, tipo, texto, fecha, proyectoId }) => (
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
