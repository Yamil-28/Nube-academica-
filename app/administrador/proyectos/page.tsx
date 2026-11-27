import FiltrosListado, { coincide, parametro, type ParametrosListado } from "@/componentes/dashboard/FiltrosListado";
import opciones from "@/componentes/dashboard/DetallesListado.module.css";
import Link from "next/link";
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

type Parametros = ParametrosListado;

async function ContenidoTodosLosProyectos({
  parametros,
}: {
  parametros: Promise<Parametros>;
}) {
  // Verificar acceso del Administrador
  await protegerRuta("ADMINISTRADOR");

  const filtros = await parametros;
  const estado = parametro(filtros, "estado");
  const q = parametro(filtros, "q");
  const materia = parametro(filtros, "materia");

  // Solo se acepta un estado válido
  const filtro = ESTADOS_PROYECTO.find(
    (e) => e === estado
  );

  // Consultar proyectos
  const todos = await listarProyectos();

  const porEstado = filtro
    ? todos.filter((p) => p.estado === filtro)
    : todos;

  // Consultar materias, avances y usuarios
  const materias = await obtenerMaterias();

  const avances = await listarAvancesDeProyectos(
    todos.map((p) => p.id)
  );

  const nombres = await obtenerNombresUsuarios(
    porEstado.flatMap((p) => [
      p.creadoPorId,
      p.docenteId,
    ])
  );

  const nombreMateria = new Map(
    materias.map((m) => [m.id, m.nombre])
  );

  const proyectos = porEstado.filter((p) => (!materia || String(p.materiaId) === materia) && coincide(q, p.titulo, p.gestion, nombres.get(p.creadoPorId), nombres.get(p.docenteId), nombreMateria.get(p.materiaId)));

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
        <Link className={opciones.boton} href="/administrador/gestion?modo=proyecto">Crear proyecto</Link>
        {parametro(filtros, "guardado") === "proyecto" && <p role="status">Proyecto creado correctamente.</p>}

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

      <FiltrosListado ruta="/administrador/proyectos" filtros={filtros} etiqueta="Buscar proyecto, materia, docente o responsable" selectores={[
        { nombre: "estado", todos: "Todos los estados", opciones: ESTADOS_PROYECTO.map((valor) => ({ valor, etiqueta: ETIQUETA_ESTADO[valor] })) },
        { nombre: "materia", todos: "Todas las materias", opciones: materias.map((m) => ({ valor: String(m.id), etiqueta: m.nombre })) },
      ]} />

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
