import { Suspense } from "react";
import { FolderKanban } from "lucide-react";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import { protegerRuta } from "@/lib/protegerRuta";
import { prisma } from "@/lib/prisma";
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
  const materias = await obtenerMaterias();
  const avances = await listarAvancesDeProyectos(proyectos.map((p) => p.id));

  // Solo lectura: nombres de los estudiantes que crearon los proyectos
  const autores = await prisma.usuario.findMany({
    where: { id: { in: proyectos.map((p) => p.creadoPorId) } },
    select: { id: true, nombre: true },
  });

  const nombreMateria = new Map(materias.map((m) => [m.id, m.nombre]));
  const nombreAutor = new Map(autores.map((a) => [a.id, a.nombre]));

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
                  </tr>
                </thead>
                <tbody>
                  {proyectos.map((p) => (
                    <tr key={p.id}>
                      <td>{p.titulo}</td>
                      <td>{nombreMateria.get(p.materiaId) ?? "—"}</td>
                      <td>{nombreAutor.get(p.creadoPorId) ?? "—"}</td>
                      <td>{p.gestion}-{p.semestre}</td>
                      <td>
                        <span className={estilos.estado}>
                          {ETIQUETA_ESTADO[p.estado]}
                        </span>
                      </td>
                      <td>{cantidadAvances(p.id)}</td>
                      <td>{p.fechaInicio.toLocaleDateString("es-BO")}</td>
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

export default function PaginaProyectosAsignados() {
  return (
    <Suspense fallback={<p>Cargando proyectos asignados...</p>}>
      <ContenidoProyectosAsignados />
    </Suspense>
  );
}