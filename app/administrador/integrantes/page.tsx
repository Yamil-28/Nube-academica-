import FiltrosListado, { coincide, parametro, type ParametrosListado } from "@/componentes/dashboard/FiltrosListado";
import DetallesListado from "@/componentes/dashboard/DetallesListado";
import opciones from "@/componentes/dashboard/DetallesListado.module.css";
import Link from "next/link";
import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";

import { Suspense } from "react";
import { Users } from "lucide-react";

import { listarEquipos } from "@/lib/equipos/servicio";
import {
  ETIQUETA_ROL_EQUIPO,
  type RolEquipo,
} from "@/lib/equipos/tipos";
import { protegerRuta } from "@/lib/protegerRuta";
import { obtenerNombresUsuarios } from "@/lib/proyectos/nombres";
import { listarProyectos } from "@/lib/proyectos/servicio";

import estilos from "../equipos/page.module.css";

type Parametros = ParametrosListado;

async function ContenidoIntegrantesAdmin({
  parametros,
}: {
  parametros: Promise<Parametros>;
}) {
  // Verificar acceso del Administrador
  await protegerRuta("ADMINISTRADOR");

  const filtros = await parametros;
  const rol = parametro(filtros, "rol");
  const q = parametro(filtros, "q");
  const equipoId = parametro(filtros, "equipo");

  // Solo se acepta un rol válido
  const filtro: RolEquipo | undefined =
    rol === "LIDER" || rol === "INTEGRANTE"
      ? rol
      : undefined;

  // Consultar equipos y proyectos
  const equipos = await listarEquipos();
  const proyectos = await listarProyectos();

  const nombres = await obtenerNombresUsuarios(
    equipos.flatMap((e) =>
      e.miembros.map((m) => m.usuarioId)
    )
  );

  const titulo = new Map(
    proyectos.map((p) => [p.id, p.titulo])
  );

  // Preparar los registros de integrantes
  const filas = equipos
    .flatMap((e) =>
      e.miembros.map((m) => ({
        id: m.id,
        equipoId: e.id,
        nombre: nombres.get(m.usuarioId) ?? "Usuario",
        rolEquipo: m.rolEquipo,
        equipo: e.nombre,
        proyecto: titulo.get(e.proyectoId) ?? "—",
        ingreso: m.fechaIngreso,
      }))
    )
    .filter((f) => (!filtro || f.rolEquipo === filtro) && (!equipoId || String(f.equipoId) === equipoId) && coincide(q, f.nombre, f.equipo, f.proyecto))
    .sort((a, b) =>
      a.nombre.localeCompare(b.nombre, "es")
    );

  return (
    <div className={estilos.contenedor}>
      {/* ENCABEZADO */}
      <section>
        <span className={estilos.etiqueta}>
          EQUIPOS DE TRABAJO
        </span>

        <h1>Integrantes</h1>
        <Link className={opciones.boton} href="/administrador/gestion?modo=integrante">Añadir integrante</Link>

        <p>
          Todas las personas que forman parte de algún equipo.
        </p>
      </section>

      {parametro(filtros, "guardado") === "integrante" && <p role="status">Integrante añadido correctamente.</p>}
      <FiltrosListado ruta="/administrador/integrantes" filtros={filtros} etiqueta="Buscar integrante, equipo o proyecto" selectores={[
        { nombre: "rol", todos: "Todos los roles", opciones: Object.entries(ETIQUETA_ROL_EQUIPO).map(([valor, etiqueta]) => ({ valor, etiqueta })) },
        { nombre: "equipo", todos: "Todos los equipos", opciones: equipos.map((e) => ({ valor: String(e.id), etiqueta: e.nombre })) },
      ]} />

      {/* TABLA DE INTEGRANTES */}
      <section className={estilos.panel}>
        {filas.length === 0 ? (
          <div className={estilos.vacio}>
            <Users size={35} />

            <h3>
              No hay integrantes para mostrar
            </h3>

            <p>
              Aparecerán cuando los estudiantes formen equipos.
            </p>
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
                  <th>Acciones</th>
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
                        {
                          ETIQUETA_ROL_EQUIPO[
                            f.rolEquipo
                          ]
                        }
                      </span>
                    </td>

                    <td>{f.equipo}</td>

                    <td>{f.proyecto}</td>

                    <td>
                      {f.ingreso.toLocaleDateString(
                        "es-BO"
                      )}
                    </td>
                    <td><DetallesListado titulo={f.nombre}>
                      <p>Equipo <strong>{f.equipo}</strong></p>
                      <p>Proyecto <strong>{f.proyecto}</strong></p>
                      <p>Rol <strong>{ETIQUETA_ROL_EQUIPO[f.rolEquipo]}</strong></p>
                      <p>Fecha de ingreso <strong>{f.ingreso.toLocaleDateString("es-BO")}</strong></p>
                      <Link className={opciones.boton} href={`/administrador/equipos?q=${encodeURIComponent(f.equipo)}`}>Ver equipo</Link>
                    </DetallesListado></td>
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

export default function PaginaIntegrantesAdministrador({
  searchParams,
}: {
  searchParams: Promise<Parametros>;
}) {
  return (
    <Suspense fallback={<CargandoDashboard />}>
      <ContenidoIntegrantesAdmin
        parametros={searchParams}
      />
    </Suspense>
  );
}
