import FiltrosListado, { coincide, parametro, type ParametrosListado } from "@/componentes/dashboard/FiltrosListado";
import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";

import { Suspense } from "react";
import { Library } from "lucide-react";

import { protegerRuta } from "@/lib/protegerRuta";
import { obtenerNombresUsuarios } from "@/lib/proyectos/nombres";
import { listarProyectos } from "@/lib/proyectos/servicio";
import { obtenerMaterias } from "@/lib/proyectos/materiasSimuladas";

import estilos from "../proyectos/page.module.css";

async function ContenidoRepositorio({ searchParams }: { searchParams: Promise<ParametrosListado> }) {
  // Verificar acceso del Administrador
  await protegerRuta("ADMINISTRADOR");
  const filtros = await searchParams;
  const q = parametro(filtros, "q");

  // Obtener todos los proyectos
  const todos = await listarProyectos();

  // Seleccionar únicamente proyectos finalizados
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

  // Organizar por gestión y semestre
  // Del período más reciente al más antiguo
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

  const periodos = [
    ...new Set(
      visibles.map(
        (p) => `${p.gestion}-${p.semestre}`
      )
    ),
  ]
    .sort()
    .reverse();

  return (
    <div className={estilos.contenedor}>
      {/* ENCABEZADO */}
      <section>
        <span className={estilos.etiqueta}>
          PROYECTOS ACADÉMICOS
        </span>

        <h1>Repositorio académico</h1>

        <p>
          Proyectos finalizados, organizados por gestión,
          semestre y materia para su consulta posterior.
        </p>
      </section>
      <FiltrosListado ruta="/administrador/repositorio" filtros={filtros} etiqueta="Buscar proyecto, materia, docente o gestión" selectores={selectores} />


      {/* REPOSITORIO */}
      {periodos.length === 0 ? (
        <section className={estilos.panel}>
          <div className={estilos.vacio}>
            <Library size={35} />

            <h3>{finalizados.length ? "No hay proyectos que coincidan" : "El repositorio está vacío"}</h3>

            <p>
              Los proyectos finalizados se conservarán
              aquí automáticamente.
            </p>
          </div>
        </section>
      ) : (
        periodos.map((periodo) => {
          const delPeriodo = visibles.filter(
            (p) =>
              `${p.gestion}-${p.semestre}` === periodo
          );

          const materiaIds = [
            ...new Set(
              delPeriodo.map((p) => p.materiaId)
            ),
          ];

          const [gestion, semestre] = periodo.split("-");

          return (
            <section
              key={periodo}
              className={estilos.panel}
            >
              <h2 className={estilos.periodo}>
                Gestión {gestion} · Semestre {semestre}
              </h2>

              {materiaIds.map((materiaId) => (
                <div key={materiaId}>
                  <h3 className={estilos.materia}>
                    {nombreMateria.get(materiaId) ??
                      "Materia"}
                  </h3>

                  <ul className={estilos.lista}>
                    {delPeriodo
                      .filter(
                        (p) =>
                          p.materiaId === materiaId
                      )
                      .map((p) => (
                        <li
                          key={p.id}
                          className={estilos.item}
                        >
                          <strong>{p.titulo}</strong>

                          <p>
                            Estudiante:{" "}
                            {nombres.get(p.creadoPorId) ??
                              "—"}
                            {" · "}
                            Docente:{" "}
                            {nombres.get(p.docenteId) ??
                              "—"}
                            {" · "}
                            Cierre:{" "}
                            {p.fechaCierre
                              ? p.fechaCierre.toLocaleDateString(
                                  "es-BO"
                                )
                              : "—"}
                          </p>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </section>
          );
        })
      )}
    </div>
  );
}

export default function PaginaRepositorioAcademico({ searchParams }: { searchParams: Promise<ParametrosListado> }) {
  return (
    <Suspense fallback={<CargandoDashboard />}>
      <ContenidoRepositorio searchParams={searchParams} />
    </Suspense>
  );
}
