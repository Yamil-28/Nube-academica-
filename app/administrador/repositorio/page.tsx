import { Suspense } from "react";
import { Library } from "lucide-react";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import { protegerRuta } from "@/lib/protegerRuta";
import { obtenerNombresUsuarios } from "@/lib/proyectos/nombres";
import { listarProyectos } from "@/lib/proyectos/servicio";
import { obtenerMaterias } from "@/lib/proyectos/materiasSimuladas";

import estilos from "../proyectos/page.module.css";

async function ContenidoRepositorio() {
  const usuario = await protegerRuta("ADMINISTRADOR");

  const todos = await listarProyectos();
  const finalizados = todos.filter((p) => p.estado === "FINALIZADO");

  const materias = await obtenerMaterias();
  const nombres = await obtenerNombresUsuarios(
    finalizados.flatMap((p) => [p.creadoPorId, p.docenteId])
  );

  const nombreMateria = new Map(materias.map((m) => [m.id, m.nombre]));

  // Gestión-semestre, del más reciente al más antiguo
  const periodos = [
    ...new Set(finalizados.map((p) => `${p.gestion}-${p.semestre}`)),
  ]
    .sort()
    .reverse();

  return (
    <EstructuraDashboard usuario={usuario.usuario} rol={usuario.rol}>
      <div className={estilos.contenedor}>
        <section>
          <span className={estilos.etiqueta}>PROYECTOS ACADÉMICOS</span>
          <h1>Repositorio académico</h1>
          <p>
            Proyectos finalizados, organizados por gestión, semestre y materia
            para su consulta posterior.
          </p>
        </section>

        {periodos.length === 0 ? (
          <section className={estilos.panel}>
            <div className={estilos.vacio}>
              <Library size={35} />
              <h3>El repositorio está vacío</h3>
              <p>Los proyectos finalizados se conservarán aquí automáticamente.</p>
            </div>
          </section>
        ) : (
          periodos.map((periodo) => {
            const delPeriodo = finalizados.filter(
              (p) => `${p.gestion}-${p.semestre}` === periodo
            );
            const materiaIds = [...new Set(delPeriodo.map((p) => p.materiaId))];
            const [gestion, semestre] = periodo.split("-");

            return (
              <section key={periodo} className={estilos.panel}>
                <h2 className={estilos.periodo}>
                  Gestión {gestion} · Semestre {semestre}
                </h2>

                {materiaIds.map((materiaId) => (
                  <div key={materiaId}>
                    <h3 className={estilos.materia}>
                      {nombreMateria.get(materiaId) ?? "Materia"}
                    </h3>

                    <ul className={estilos.lista}>
                      {delPeriodo
                        .filter((p) => p.materiaId === materiaId)
                        .map((p) => (
                          <li key={p.id} className={estilos.item}>
                            <strong>{p.titulo}</strong>
                            <p>
                              Estudiante: {nombres.get(p.creadoPorId) ?? "—"} ·
                              Docente: {nombres.get(p.docenteId) ?? "—"} · Cierre:{" "}
                              {p.fechaCierre
                                ? p.fechaCierre.toLocaleDateString("es-BO")
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
    </EstructuraDashboard>
  );
}

export default function PaginaRepositorioAcademico() {
  return (
    <Suspense fallback={<p>Cargando repositorio...</p>}>
      <ContenidoRepositorio />
    </Suspense>
  );
}