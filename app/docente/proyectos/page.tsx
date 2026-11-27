import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";
import { Suspense } from "react";
import { FolderKanban } from "lucide-react";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import DetallesListado from "@/componentes/dashboard/DetallesListado";
import detalles from "@/componentes/dashboard/DetallesListado.module.css";
import { protegerRuta } from "@/lib/protegerRuta";
import { listarEquiposDeDocente } from "@/lib/equipos/servicio";
import { ETIQUETA_ROL_EQUIPO } from "@/lib/equipos/tipos";
import { obtenerNombresUsuarios } from "@/lib/proyectos/nombres";
import {
  listarAvancesDeProyectos,
  listarProyectosDeDocente,
} from "@/lib/proyectos/servicio";
import { obtenerMaterias } from "@/lib/proyectos/materiasSimuladas";
import { ETIQUETA_ESTADO } from "@/lib/proyectos/tipos";

import estilos from "./page.module.css";

async function ContenidoProyectosAsignados() {
  const usuario = await protegerRuta("DOCENTE");

  const proyectos = await listarProyectosDeDocente(usuario.id);
  const [materias, avances, equipos] = await Promise.all([
    obtenerMaterias(),
    listarAvancesDeProyectos(proyectos.map((p) => p.id)),
    listarEquiposDeDocente(usuario.id),
  ]);
  const nombres = await obtenerNombresUsuarios([
    ...proyectos.map((p) => p.creadoPorId),
    ...equipos.flatMap((equipo) => equipo.miembros.map((miembro) => miembro.usuarioId)),
  ]);

  const nombreMateria = new Map(materias.map((m) => [m.id, m.nombre]));
  const equipoPorProyecto = new Map(equipos.map((equipo) => [equipo.proyectoId, equipo]));

  const cantidadAvances = (proyectoId: number) =>
    avances.filter((a) => a.proyectoId === proyectoId).length;

  return (
    <EstructuraDashboard usuario={usuario.usuario} rol={usuario.rol}>
      <div className={estilos.contenedor}>
        <section>
          <span className={estilos.etiqueta}>PROYECTOS ACADÉMICOS</span>
          <h1>Proyectos asignados</h1>
          <p>Proyectos en los que fuiste elegido como docente responsable.</p>
        </section>

        <section className={estilos.panel}>
          {proyectos.length === 0 ? (
            <div className={estilos.vacio}>
              <FolderKanban size={35} />
              <h3>Aún no tienes proyectos asignados</h3>
              <p>Cuando un estudiante te elija como responsable, aparecerá aquí.</p>
            </div>
          ) : (
            <div className={estilos.contenedorTabla}>
              <table className={estilos.tabla}>
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Materia</th>
                    <th>Estudiante</th>
                    <th>Gestión</th>
                    <th>Estado</th>
                    <th>Avances</th>
                    <th>Inicio</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {proyectos.map((p) => {
                    const equipo = equipoPorProyecto.get(p.id);
                    return (
                    <tr key={p.id}>
                      <td>{p.titulo}</td>
                      <td>{nombreMateria.get(p.materiaId) ?? "—"}</td>
                      <td>{nombres.get(p.creadoPorId) ?? "—"}</td>
                      <td>{p.gestion}-{p.semestre}</td>
                      <td>
                        <span className={estilos.estado}>
                          {ETIQUETA_ESTADO[p.estado]}
                        </span>
                      </td>
                      <td>{cantidadAvances(p.id)}</td>
                      <td>{p.fechaInicio.toLocaleDateString("es-BO")}</td>
                      <td>
                        <DetallesListado titulo={p.titulo}>
                          <dl className={detalles.datos}>
                            <div><dt>Materia</dt><dd>{nombreMateria.get(p.materiaId) ?? "—"}</dd></div>
                            <div><dt>Docente responsable</dt><dd>{usuario.nombre}</dd></div>
                            <div><dt>Estudiante responsable</dt><dd>{nombres.get(p.creadoPorId) ?? "—"}</dd></div>
                            <div><dt>Estado</dt><dd>{ETIQUETA_ESTADO[p.estado]}</dd></div>
                            <div><dt>Gestión y semestre</dt><dd>{p.gestion}-{p.semestre}</dd></div>
                            <div><dt>Avances registrados</dt><dd>{cantidadAvances(p.id)}</dd></div>
                          </dl>
                          <h3>Descripción</h3>
                          <p>{p.descripcion || "Sin descripción."}</p>
                          <h3>Equipo de trabajo</h3>
                          {equipo ? (
                            <>
                              <p>{equipo.nombre}</p>
                              <ul className={detalles.miembros}>
                                {equipo.miembros.map((miembro) => (
                                  <li key={miembro.id}>
                                    {nombres.get(miembro.usuarioId) ?? "Usuario"} · {ETIQUETA_ROL_EQUIPO[miembro.rolEquipo]}
                                  </li>
                                ))}
                              </ul>
                            </>
                          ) : <p>Aún no hay un equipo asociado.</p>}
                        </DetallesListado>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </EstructuraDashboard>
  );
}

export default function PaginaProyectosAsignados() {
  return (
    <Suspense fallback={<CargandoDashboard />}>
      <ContenidoProyectosAsignados />
    </Suspense>
  );
}
