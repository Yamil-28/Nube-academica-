import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";

import { Suspense } from "react";
import { FolderKanban } from "lucide-react";

import { protegerRuta } from "@/lib/protegerRuta";
import { obtenerNombresUsuarios } from "@/lib/proyectos/nombres";
import {
  listarAvancesDeProyectos,
  listarProyectos,
} from "@/lib/proyectos/servicio";
import { obtenerMaterias } from "@/lib/proyectos/materiasSimuladas";
import {
  ESTADOS_PROYECTO,
  ETIQUETA_ESTADO,
} from "@/lib/proyectos/tipos";

import estilos from "./page.module.css";

type Parametros = { estado?: string };

async function ContenidoTodosLosProyectos({
  parametros,
}: {
  parametros: Promise<Parametros>;
}) {
  // Verificar acceso del Administrador
  await protegerRuta("ADMINISTRADOR");

  const { estado } = await parametros;

  // Solo se acepta un estado válido
  const filtro = ESTADOS_PROYECTO.find(
    (e) => e === estado
  );

  // Consultar proyectos
  const todos = await listarProyectos();

  const proyectos = filtro
    ? todos.filter((p) => p.estado === filtro)
    : todos;

  // Consultar materias, avances y usuarios
  const materias = await obtenerMaterias();

  const avances = await listarAvancesDeProyectos(
    todos.map((p) => p.id)
  );

  const nombres = await obtenerNombresUsuarios(
    proyectos.flatMap((p) => [
      p.creadoPorId,
      p.docenteId,
    ])
  );

  const nombreMateria = new Map(
    materias.map((m) => [m.id, m.nombre])
  );

  const cantidadAvances = (id: number) =>
    avances.filter((a) => a.proyectoId === id).length;

  return (
    <div className={estilos.contenedor}>
      {/* ENCABEZADO */}
      <section>
        <span className={estilos.etiqueta}>
          PROYECTOS ACADÉMICOS
        </span>

        <h1>Todos los proyectos</h1>

        <p>
          Supervisión general de los proyectos registrados en SISCloud.
        </p>
      </section>

      {/* TARJETAS ESTADÍSTICAS */}
      <section className={estilos.contadores}>
        {ESTADOS_PROYECTO.map((e) => (
          <div
            key={e}
            className={estilos.contador}
          >
            <strong>
              {
                todos.filter(
                  (p) => p.estado === e
                ).length
              }
            </strong>

            <span>
              {ETIQUETA_ESTADO[e]}
            </span>
          </div>
        ))}
      </section>

      {/* FILTRO POR ESTADO */}
      <form
        method="get"
        className={estilos.filtro}
      >
        <select
          name="estado"
          defaultValue={filtro ?? ""}
        >
          <option value="">
            Todos los estados
          </option>

          {ESTADOS_PROYECTO.map((e) => (
            <option key={e} value={e}>
              {ETIQUETA_ESTADO[e]}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className={estilos.botonFiltro}
        >
          Filtrar
        </button>
      </form>

      {/* TABLA DE PROYECTOS */}
      <section className={estilos.panel}>
        {proyectos.length === 0 ? (
          <div className={estilos.vacio}>
            <FolderKanban size={35} />

            <h3>
              No hay proyectos para mostrar
            </h3>

            <p>
              Cuando los estudiantes registren proyectos,
              aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className={estilos.contenedorTabla}>
            <table className={estilos.tabla}>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Materia</th>
                  <th>Estudiante</th>
                  <th>Docente</th>
                  <th>Gestión</th>
                  <th>Estado</th>
                  <th>Avances</th>
                  <th>Inicio</th>
                </tr>
              </thead>

              <tbody>
                {proyectos.map((p) => (
                  <tr key={p.id}>
                    <td>{p.titulo}</td>

                    <td>
                      {nombreMateria.get(
                        p.materiaId
                      ) ?? "—"}
                    </td>

                    <td>
                      {nombres.get(
                        p.creadoPorId
                      ) ?? "—"}
                    </td>

                    <td>
                      {nombres.get(
                        p.docenteId
                      ) ?? "—"}
                    </td>

                    <td>
                      {p.gestion}-{p.semestre}
                    </td>

                    <td>
                      <span className={estilos.estado}>
                        {ETIQUETA_ESTADO[p.estado]}
                      </span>
                    </td>

                    <td>
                      {cantidadAvances(p.id)}
                    </td>

                    <td>
                      {p.fechaInicio.toLocaleDateString(
                        "es-BO"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default function PaginaTodosLosProyectos({
  searchParams,
}: {
  searchParams: Promise<Parametros>;
}) {
  return (
    <Suspense fallback={<CargandoDashboard />}>
      <ContenidoTodosLosProyectos
        parametros={searchParams}
      />
    </Suspense>
  );
}
