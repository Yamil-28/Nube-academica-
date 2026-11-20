import { Suspense } from "react";
import { Users } from "lucide-react";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import { listarEquipos } from "@/lib/equipos/servicio";
import { protegerRuta } from "@/lib/protegerRuta";
import { obtenerMaterias } from "@/lib/proyectos/materiasSimuladas";
import { obtenerNombresUsuarios } from "@/lib/proyectos/nombres";
import { listarProyectos } from "@/lib/proyectos/servicio";
import { ETIQUETA_ESTADO } from "@/lib/proyectos/tipos";

import estilos from "./page.module.css";

async function ContenidoTodosLosEquipos() {
  const usuario = await protegerRuta("ADMINISTRADOR");

  const equipos = await listarEquipos();
  const proyectos = await listarProyectos();
  const materias = await obtenerMaterias();
  const nombres = await obtenerNombresUsuarios(
    equipos.flatMap((e) => e.miembros.map((m) => m.usuarioId))
  );

  const proyectoPorId = new Map(proyectos.map((p) => [p.id, p]));
  const nombreMateria = new Map(materias.map((m) => [m.id, m.nombre]));

  return (
    <EstructuraDashboard usuario={usuario.usuario} rol={usuario.rol}>
      <div className={estilos.contenedor}>
        <section>
          <span className={estilos.etiqueta}>EQUIPOS DE TRABAJO</span>
          <h1>Todos los equipos</h1>
          <p>Supervisión general de los equipos registrados en SISCloud.</p>
        </section>

        <section className={estilos.panel}>
          {equipos.length === 0 ? (
            <div className={estilos.vacio}>
              <Users size={35} />
              <h3>No hay equipos registrados</h3>
              <p>Aparecerán cuando los estudiantes los creen.</p>
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
                  </tr>
                </thead>
                <tbody>
                  {equipos.map((e) => {
                    const proyecto = proyectoPorId.get(e.proyectoId);
                    const lideres = e.miembros
                      .filter((m) => m.rolEquipo === "LIDER")
                      .map((m) => nombres.get(m.usuarioId) ?? "Usuario")
                      .join(", ");

                    return (
                      <tr key={e.id}>
                        <td>{e.nombre}</td>
                        <td>{proyecto?.titulo ?? "—"}</td>
                        <td>
                          {proyecto
                            ? nombreMateria.get(proyecto.materiaId) ?? "—"
                            : "—"}
                        </td>
                        <td>
                          {proyecto && (
                            <span className={estilos.estado}>
                              {ETIQUETA_ESTADO[proyecto.estado]}
                            </span>
                          )}
                        </td>
                        <td>{lideres || "—"}</td>
                        <td>{e.miembros.length}</td>
                        <td>{e.creadoEn.toLocaleDateString("es-BO")}</td>
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

export default function PaginaTodosLosEquipos() {
  return (
    <Suspense fallback={<p>Cargando equipos...</p>}>
      <ContenidoTodosLosEquipos />
    </Suspense>
  );
}