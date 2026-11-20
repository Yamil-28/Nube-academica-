import { Suspense } from "react";
import { Archive } from "lucide-react";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import { protegerRuta } from "@/lib/protegerRuta";
import { obtenerNombresUsuarios } from "@/lib/proyectos/nombres";
import { listarProyectos } from "@/lib/proyectos/servicio";
import { obtenerMaterias } from "@/lib/proyectos/materiasSimuladas";

import estilos from "../proyectos/page.module.css";

async function ContenidoFinalizados() {
  const usuario = await protegerRuta("ADMINISTRADOR");

  const todos = await listarProyectos();
  const finalizados = todos.filter((p) => p.estado === "FINALIZADO");

  const materias = await obtenerMaterias();
  const nombres = await obtenerNombresUsuarios(
    finalizados.flatMap((p) => [p.creadoPorId, p.docenteId])
  );

  const nombreMateria = new Map(materias.map((m) => [m.id, m.nombre]));

  return (
    <EstructuraDashboard usuario={usuario.usuario} rol={usuario.rol}>
      <div className={estilos.contenedor}>
        <section>
          <span className={estilos.etiqueta}>PROYECTOS ACADÉMICOS</span>
          <h1>Proyectos finalizados</h1>
          <p>Proyectos cuyo desarrollo concluyó y fueron cerrados por el docente.</p>
        </section>

        <section className={estilos.panel}>
          {finalizados.length === 0 ? (
            <div className={estilos.vacio}>
              <Archive size={35} />
              <h3>Aún no hay proyectos finalizados</h3>
              <p>Aparecerán cuando un docente cierre un proyecto.</p>
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
                  {finalizados.map((p) => (
                    <tr key={p.id}>
                      <td>{p.titulo}</td>
                      <td>{nombreMateria.get(p.materiaId) ?? "—"}</td>
                      <td>{nombres.get(p.creadoPorId) ?? "—"}</td>
                      <td>{nombres.get(p.docenteId) ?? "—"}</td>
                      <td>{p.gestion}-{p.semestre}</td>
                      <td>
                        {p.fechaCierre
                          ? p.fechaCierre.toLocaleDateString("es-BO")
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
    </EstructuraDashboard>
  );
}

export default function PaginaProyectosFinalizados() {
  return (
    <Suspense fallback={<p>Cargando proyectos finalizados...</p>}>
      <ContenidoFinalizados />
    </Suspense>
  );
}