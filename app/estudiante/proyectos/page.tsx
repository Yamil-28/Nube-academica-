import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";
import { Suspense } from "react";
import Link from "next/link";
import { FolderKanban, FolderPlus } from "lucide-react";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import { protegerRuta } from "@/lib/protegerRuta";
import { listarProyectosDeUsuario } from "@/lib/proyectos/servicio";
import { obtenerMaterias } from "@/lib/proyectos/materiasSimuladas";
import { ETIQUETA_ESTADO } from "@/lib/proyectos/tipos";

import estilos from "./page.module.css";

async function ContenidoProyectos({
  parametros,
}: {
  parametros: Promise<{ creado?: string }>;
}) {
  const usuario = await protegerRuta("ESTUDIANTE");
  const { creado } = await parametros;

  const [proyectos, materias] = await Promise.all([
    listarProyectosDeUsuario(usuario.id),
    obtenerMaterias(),
  ]);

  const nombreMateria = new Map(materias.map((m) => [m.id, m.nombre]));

  return (
    <EstructuraDashboard usuario={usuario.usuario} rol={usuario.rol}>
      <div className={estilos.contenedor}>
        <section className={estilos.encabezado}>
          <div>
            <span className={estilos.etiqueta}>PROYECTOS ACADÉMICOS</span>
            <h1>Mis proyectos</h1>
            <p>Consulta y gestiona los proyectos en los que participas.</p>
          </div>

          <Link
            href="/estudiante/proyectos/nuevo"
            className={estilos.botonPrincipal}
          >
            <FolderPlus size={18} />
            Crear proyecto
          </Link>
        </section>

        {creado === "1" && (
          <p className={estilos.aviso}>Proyecto registrado correctamente.</p>
        )}

        <section className={estilos.panel}>
          {proyectos.length === 0 ? (
            <div className={estilos.vacio}>
              <FolderKanban size={35} />
              <h3>Aún no tienes proyectos registrados</h3>
              <p>Cuando registres uno, aparecerá aquí con su estado.</p>
            </div>
          ) : (
            <div className={estilos.contenedorTabla}>
              <table className={estilos.tabla}>
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Materia</th>
                    <th>Gestión</th>
                    <th>Estado</th>
                    <th>Inicio</th>
                  </tr>
                </thead>
                <tbody>
                  {proyectos.map((p) => (
                    <tr key={p.id}>
                      <td>{p.titulo}</td>
                      <td>{nombreMateria.get(p.materiaId) ?? "—"}</td>
                      <td>{p.gestion}-{p.semestre}</td>
                      <td>
                        <span className={estilos.estado}>
                          {ETIQUETA_ESTADO[p.estado]}
                        </span>
                      </td>
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

export default function PaginaMisProyectos({
  searchParams,
}: {
  searchParams: Promise<{ creado?: string }>;
}) {
  return (
    <Suspense fallback={<CargandoDashboard />}>
      <ContenidoProyectos parametros={searchParams} />
    </Suspense>
  );
}