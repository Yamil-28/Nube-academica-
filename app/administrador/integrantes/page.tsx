import { Suspense } from "react";
import { Users } from "lucide-react";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import { listarEquipos } from "@/lib/equipos/servicio";
import { ETIQUETA_ROL_EQUIPO, type RolEquipo } from "@/lib/equipos/tipos";
import { protegerRuta } from "@/lib/protegerRuta";
import { obtenerNombresUsuarios } from "@/lib/proyectos/nombres";
import { listarProyectos } from "@/lib/proyectos/servicio";

import estilos from "../equipos/page.module.css";

type Parametros = { rol?: string };

async function ContenidoIntegrantesAdmin({
  parametros,
}: {
  parametros: Promise<Parametros>;
}) {
  const usuario = await protegerRuta("ADMINISTRADOR");
  const { rol } = await parametros;

  // Solo se acepta un rol válido
  const filtro: RolEquipo | undefined =
    rol === "LIDER" || rol === "INTEGRANTE" ? rol : undefined;

  const equipos = await listarEquipos();
  const proyectos = await listarProyectos();
  const nombres = await obtenerNombresUsuarios(
    equipos.flatMap((e) => e.miembros.map((m) => m.usuarioId))
  );

  const titulo = new Map(proyectos.map((p) => [p.id, p.titulo]));

  const filas = equipos
    .flatMap((e) =>
      e.miembros.map((m) => ({
        id: m.id,
        nombre: nombres.get(m.usuarioId) ?? "Usuario",
        rolEquipo: m.rolEquipo,
        equipo: e.nombre,
        proyecto: titulo.get(e.proyectoId) ?? "—",
        ingreso: m.fechaIngreso,
      }))
    )
    .filter((f) => !filtro || f.rolEquipo === filtro)
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  return (
    <EstructuraDashboard usuario={usuario.usuario} rol={usuario.rol}>
      <div className={estilos.contenedor}>
        <section>
          <span className={estilos.etiqueta}>EQUIPOS DE TRABAJO</span>
          <h1>Integrantes</h1>
          <p>Todas las personas que forman parte de algún equipo.</p>
        </section>

        <form method="get" className={estilos.filtro}>
          <select name="rol" defaultValue={filtro ?? ""}>
            <option value="">Todos los roles</option>
            <option value="LIDER">Líderes</option>
            <option value="INTEGRANTE">Integrantes</option>
          </select>
          <button type="submit" className={estilos.botonFiltro}>
            Filtrar
          </button>
        </form>

        <section className={estilos.panel}>
          {filas.length === 0 ? (
            <div className={estilos.vacio}>
              <Users size={35} />
              <h3>No hay integrantes para mostrar</h3>
              <p>Aparecerán cuando los estudiantes formen equipos.</p>
            </div>
          ) : (
            <div className={estilos.contenedorTabla}>
              <table className={estilos.tabla}>
                <thead>
                  <tr>
                    <th>Integrante</th>
                    <th>Rol</th>
                    <th>Equipo</th>
                    <th>Proyecto</th>
                    <th>Ingreso</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map((f) => (
                    <tr key={f.id}>
                      <td>{f.nombre}</td>
                      <td>
                        <span
                          className={
                            f.rolEquipo === "LIDER"
                              ? estilos.rolLider
                              : estilos.rolIntegrante
                          }
                        >
                          {ETIQUETA_ROL_EQUIPO[f.rolEquipo]}
                        </span>
                      </td>
                      <td>{f.equipo}</td>
                      <td>{f.proyecto}</td>
                      <td>{f.ingreso.toLocaleDateString("es-BO")}</td>
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

export default function PaginaIntegrantesAdministrador({
  searchParams,
}: {
  searchParams: Promise<Parametros>;
}) {
  return (
    <Suspense fallback={<p>Cargando integrantes...</p>}>
      <ContenidoIntegrantesAdmin parametros={searchParams} />
    </Suspense>
  );
}