import DetallesListado from "@/componentes/dashboard/DetallesListado";
import opciones from "@/componentes/dashboard/DetallesListado.module.css";
import Link from "next/link";
import FiltrosListado, { coincide, parametro, type ParametrosListado } from "@/componentes/dashboard/FiltrosListado";
import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";

import { Suspense } from "react";
import { Users } from "lucide-react";

import { listarEquipos } from "@/lib/equipos/servicio";
import { protegerRuta } from "@/lib/protegerRuta";
import { obtenerMaterias } from "@/lib/proyectos/materiasSimuladas";
import { obtenerNombresUsuarios } from "@/lib/proyectos/nombres";
import { listarProyectos } from "@/lib/proyectos/servicio";
import { ESTADOS_PROYECTO, ETIQUETA_ESTADO } from "@/lib/proyectos/tipos";

import estilos from "./page.module.css";

async function ContenidoTodosLosEquipos({ searchParams }: { searchParams: Promise<ParametrosListado> }) {
  // Verificar acceso del Administrador
  await protegerRuta("ADMINISTRADOR");
  const filtros = await searchParams;
  const q = parametro(filtros, "q");

  // Obtener información de equipos, proyectos y materias
  const equipos = await listarEquipos();
  const proyectos = await listarProyectos();
  const materias = await obtenerMaterias();

  const nombres = await obtenerNombresUsuarios(
    [...equipos.flatMap((e) => e.miembros.map((m) => m.usuarioId)), ...proyectos.map((p) => p.docenteId)]
  );

  const proyectoPorId = new Map(
    proyectos.map((p) => [p.id, p])
  );

  const nombreMateria = new Map(
    materias.map((m) => [m.id, m.nombre])
  );

  const materia = parametro(filtros, "materia");
  const estado = parametro(filtros, "estado");
  const visibles = equipos.filter((equipo) => {
    const proyecto = proyectoPorId.get(equipo.proyectoId);
    return (!materia || String(proyecto?.materiaId) === materia) &&
      (!estado || proyecto?.estado === estado) &&
      coincide(q, equipo.nombre, proyecto?.titulo, nombreMateria.get(proyecto?.materiaId ?? 0),
        nombres.get(proyecto?.docenteId ?? 0), ...equipo.miembros.map((m) => nombres.get(m.usuarioId)));
  });

  return (
    <div className={estilos.contenedor}>
      {/* ENCABEZADO */}
      <section>
        <span className={estilos.etiqueta}>
          EQUIPOS DE TRABAJO
        </span>

        <h1>Todos los equipos</h1>
        <Link className={opciones.boton} href="/administrador/gestion?modo=equipo">Crear equipo</Link>
        {parametro(filtros, "guardado") === "equipo" && <p role="status">Equipo creado correctamente.</p>}

        <p>
          Supervisión general de los equipos registrados en SISCloud.
        </p>
      </section>
      <FiltrosListado ruta="/administrador/equipos" filtros={filtros} etiqueta="Buscar equipo, proyecto, materia o integrante" selectores={[
        { nombre: "materia", todos: "Todas las materias", opciones: materias.map((m) => ({ valor: String(m.id), etiqueta: m.nombre })) },
        { nombre: "estado", todos: "Todos los estados", opciones: ESTADOS_PROYECTO.map((valor) => ({ valor, etiqueta: ETIQUETA_ESTADO[valor] })) },
      ]} />


      {/* TABLA DE EQUIPOS */}
      <section className={estilos.panel}>
        {visibles.length === 0 ? (
          <div className={estilos.vacio}>
            <Users size={35} />
            <h3>{equipos.length ? "No hay equipos que coincidan" : "No hay equipos registrados"}</h3>
          </div>
        ) : (
          <div className={estilos.contenedorTabla}>
            <table className={estilos.tabla}>
              <thead>
                <tr>
                  <th>Equipo</th>
                  <th>Proyecto</th>
                  <th>Materia</th>
                  <th>Estado</th>
                  <th>Líder</th>
                  <th>Integrantes</th>
                  <th>Creado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {visibles.map((e) => {
                  const proyecto = proyectoPorId.get(
                    e.proyectoId
                  );

                  const lideres = e.miembros
                    .filter((m) => m.rolEquipo === "LIDER")
                    .map(
                      (m) =>
                        nombres.get(m.usuarioId) ?? "Usuario"
                    )
                    .join(", ");

                  return (
                    <tr key={e.id}>
                      <td>{e.nombre}</td>

                      <td>
                        {proyecto?.titulo ?? "—"}
                      </td>

                      <td>
                        {proyecto
                          ? nombreMateria.get(
                              proyecto.materiaId
                            ) ?? "—"
                          : "—"}
                      </td>

                      <td>
                        {proyecto && (
                          <span className={estilos.estado}>
                            {
                              ETIQUETA_ESTADO[
                                proyecto.estado
                              ]
                            }
                          </span>
                        )}
                      </td>

                      <td>{lideres || "—"}</td>

                      <td>{e.miembros.length}</td>

                      <td>
                        {e.creadoEn.toLocaleDateString(
                          "es-BO"
                        )}
                      </td>
                      <td>
                        <div className={estilos.accionesFila}>
                        <DetallesListado titulo={e.nombre}>
                          <dl className={opciones.datos}>
                            <div><dt>Proyecto</dt><dd>{proyecto?.titulo ?? "—"}</dd></div>
                            <div><dt>Materia</dt><dd>{nombreMateria.get(proyecto?.materiaId ?? 0) ?? "—"}</dd></div>
                            <div><dt>Docente</dt><dd>{nombres.get(proyecto?.docenteId ?? 0) ?? "—"}</dd></div>
                            <div><dt>Estado del proyecto</dt><dd>{proyecto ? ETIQUETA_ESTADO[proyecto.estado] : "—"}</dd></div>
                          </dl>
                          <h3>Integrantes del equipo ({e.miembros.length})</h3>
                          <ul className={opciones.miembros}>{e.miembros.map((m) => <li key={m.id}>{nombres.get(m.usuarioId) ?? "Usuario"} · {m.rolEquipo === "LIDER" ? "Líder" : "Integrante"}</li>)}</ul>
                        </DetallesListado>
                        {proyecto && proyecto.estado !== "FINALIZADO" && (
                          <Link className={opciones.boton} href={`/administrador/gestion?modo=integrante&equipo=${e.id}`}>Añadir integrante</Link>
                        )}
                        </div>
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
  );
}

export default function PaginaTodosLosEquipos({ searchParams }: { searchParams: Promise<ParametrosListado> }) {
  return (
    <Suspense fallback={<CargandoDashboard />}>
      <ContenidoTodosLosEquipos searchParams={searchParams} />
    </Suspense>
  );
}
