import FiltrosListado, { coincide, parametro, type ParametrosListado } from "@/componentes/dashboard/FiltrosListado";
import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";

import { Suspense } from "react";
import { Archive } from "lucide-react";

import { protegerRuta } from "@/lib/protegerRuta";
import { obtenerNombresUsuarios } from "@/lib/proyectos/nombres";
import { listarProyectos } from "@/lib/proyectos/servicio";
import { obtenerMaterias } from "@/lib/proyectos/materiasSimuladas";

import estilos from "../proyectos/page.module.css";

async function ContenidoFinalizados({ searchParams }: { searchParams: Promise<ParametrosListado> }) {
  // Verificar acceso del Administrador
  await protegerRuta("ADMINISTRADOR");
  const filtros = await searchParams;
  const q = parametro(filtros, "q");

  // Obtener proyectos
  const todos = await listarProyectos();

  // Filtrar proyectos finalizados
  const finalizados = todos.filter(
    (p) => p.estado === "FINALIZADO"
  );

  // Obtener materias y nombres de usuarios
  const materias = await obtenerMaterias();

  const nombres = await obtenerNombresUsuarios(
    finalizados.flatMap((p) => [
      p.creadoPorId,
      p.docenteId,
    ])
  );

  const nombreMateria = new Map(
    materias.map((m) => [m.id, m.nombre])
  );

  const materia = parametro(filtros, "materia");
  const periodo = parametro(filtros, "periodo");
  const periodosDisponibles = [...new Set(finalizados.map((p) => `${p.gestion}-${p.semestre}`))].sort().reverse();
  const visibles = finalizados.filter((p) =>
    (!materia || String(p.materiaId) === materia) &&
    (!periodo || `${p.gestion}-${p.semestre}` === periodo) &&
    coincide(q, p.titulo, nombreMateria.get(p.materiaId), nombres.get(p.docenteId), p.gestion));
  const selectores = [
    { nombre: "materia", todos: "Todas las materias", opciones: materias.map((m) => ({ valor: String(m.id), etiqueta: m.nombre })) },
    { nombre: "periodo", todos: "Todos los periodos", opciones: periodosDisponibles.map((valor) => {
      const [gestion, semestre] = valor.split("-");
      return { valor, etiqueta: `${semestre === "1" ? "I" : "II"}/${gestion}` };
    }) },
  ];

  return (
    <div className={estilos.contenedor}>
      {/* ENCABEZADO */}
      <section>
        <span className={estilos.etiqueta}>
          PROYECTOS ACADÉMICOS
        </span>

        <h1>Proyectos finalizados</h1>

        <p>
          Proyectos cuyo desarrollo concluyó y fueron
          cerrados por el docente.
        </p>
      </section>
      <FiltrosListado ruta="/administrador/finalizados" filtros={filtros} etiqueta="Buscar proyecto, materia, docente o gestión" selectores={selectores} />


      {/* TABLA DE PROYECTOS FINALIZADOS */}
      <section className={estilos.panel}>
        {visibles.length === 0 ? (
          <div className={estilos.vacio}>
            <Archive size={35} />

            <h3>Aún no hay proyectos finalizados</h3>

            <p>
              Aparecerán cuando un docente cierre un proyecto.
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
                  <th>Cierre</th>
                </tr>
              </thead>

              <tbody>
                {visibles.map((p) => (
                  <tr key={p.id}>
                    <td>{p.titulo}</td>

                    <td>
                      {nombreMateria.get(p.materiaId) ?? "—"}
                    </td>

                    <td>
                      {nombres.get(p.creadoPorId) ?? "—"}
                    </td>

                    <td>
                      {nombres.get(p.docenteId) ?? "—"}
                    </td>

                    <td>
                      {p.gestion}-{p.semestre}
                    </td>

                    <td>
                      {p.fechaCierre
                        ? p.fechaCierre.toLocaleDateString(
                            "es-BO"
                          )
                        : "—"}
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

export default function PaginaProyectosFinalizados({ searchParams }: { searchParams: Promise<ParametrosListado> }) {
  return (
    <Suspense fallback={<CargandoDashboard />}>
      <ContenidoFinalizados searchParams={searchParams} />
    </Suspense>
  );
}
