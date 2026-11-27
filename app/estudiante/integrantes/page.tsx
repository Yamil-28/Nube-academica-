import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";
import { Suspense } from "react";
import Link from "next/link";
import { Users } from "lucide-react";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import DetallesListado from "@/componentes/dashboard/DetallesListado";
import FiltrosListado, { coincide, parametro, type ParametrosListado } from "@/componentes/dashboard/FiltrosListado";
import {
  listarEquiposDeUsuario,
  listarEstudiantesDisponibles,
  titulosDeProyectos,
} from "@/lib/equipos/servicio";
import {
  ETIQUETA_ROL_EQUIPO,
  MENSAJE_ERROR,
  type ErrorEquipo,
} from "@/lib/equipos/tipos";
import { protegerRuta } from "@/lib/protegerRuta";
import { obtenerNombresUsuarios } from "@/lib/proyectos/nombres";
import { obtenerProyecto } from "@/lib/proyectos/servicio";

import { agregarIntegrante, cambiarRol, quitarIntegrante } from "./acciones";
import estilos from "./page.module.css";

type Parametros = ParametrosListado;

const MENSAJE_OK: Record<string, string> = {
  agregado: "Integrante agregado al equipo.",
  quitado: "Integrante quitado del equipo.",
  rol: "Rol actualizado correctamente.",
};

function textoDeError(codigo?: string): string | null {
  if (!codigo) return null;

  if (Object.prototype.hasOwnProperty.call(MENSAJE_ERROR, codigo)) {
    return MENSAJE_ERROR[codigo as ErrorEquipo];
  }

  return "No se pudo completar la acción.";
}

async function ContenidoIntegrantes({
  parametros,
}: {
  parametros: Promise<Parametros>;
}) {
  const usuario = await protegerRuta("ESTUDIANTE");
  const filtros = await parametros;
  const ok = parametro(filtros, "ok");
  const error = parametro(filtros, "error");
  const rol = parametro(filtros, "rol");
  const q = parametro(filtros, "q");
  const equipoId = parametro(filtros, "equipo");

  const equipos = await listarEquiposDeUsuario(usuario.id);
  const titulos = await titulosDeProyectos(equipos.map((e) => e.proyectoId));
  const nombres = await obtenerNombresUsuarios(
    equipos.flatMap((e) => e.miembros.map((m) => m.usuarioId))
  );

  // Un equipo solo se edita si soy líder y su proyecto no está finalizado
  const editables = new Set<number>();
  const disponibles = new Map<
    number,
    { id: number; nombre: string; usuario: string }[]
  >();

  for (const equipo of equipos) {
    const soyLider = equipo.miembros.some(
      (m) => m.usuarioId === usuario.id && m.rolEquipo === "LIDER"
    );
    const proyecto = await obtenerProyecto(equipo.proyectoId);

    if (soyLider && proyecto && proyecto.estado !== "FINALIZADO") {
      editables.add(equipo.id);
      disponibles.set(equipo.id, await listarEstudiantesDisponibles(equipo.id));
    }
  }

  const visibles = equipos.filter((equipo) => !equipoId || String(equipo.id) === equipoId)
    .map((equipo) => ({
      ...equipo,
      miembrosVisibles: equipo.miembros.filter((miembro) =>
        (!rol || miembro.rolEquipo === rol) && coincide(q, nombres.get(miembro.usuarioId), equipo.nombre, titulos.get(equipo.proyectoId))),
    }))
    .filter((equipo) => equipo.miembrosVisibles.length > 0);

  const mensajeError = textoDeError(error);
  const mensajeOk = ok ? MENSAJE_OK[ok] : undefined;

  return (
    <EstructuraDashboard usuario={usuario.usuario} rol={usuario.rol}>
      <div className={estilos.contenedor}>
        <section>
          <span className={estilos.etiqueta}>EQUIPOS DE TRABAJO</span>
          <h1>Integrantes</h1>
          <p>Administra quiénes forman parte de tus equipos y con qué rol.</p>
        </section>

        {mensajeOk && <p className={estilos.aviso}>{mensajeOk}</p>}
        {mensajeError && <p className={estilos.error}>{mensajeError}</p>}

        <FiltrosListado ruta="/estudiante/integrantes" filtros={filtros} etiqueta="Buscar integrante, equipo o proyecto" selectores={[
          { nombre: "rol", todos: "Todos los roles", opciones: Object.entries(ETIQUETA_ROL_EQUIPO).map(([valor, etiqueta]) => ({ valor, etiqueta })) },
          { nombre: "equipo", todos: "Todos los equipos", opciones: equipos.map((equipo) => ({ valor: String(equipo.id), etiqueta: equipo.nombre })) },
        ]} />
        {visibles.length === 0 ? (
          <section className={estilos.panel}>
            <div className={estilos.vacio}>
              <Users size={35} />
              <h3>{equipos.length ? "No hay integrantes que coincidan" : "Aún no formas parte de ningún equipo"}</h3>
              {equipos.length === 0 && <p>
                <Link href="/estudiante/equipos/nuevo">Crea un equipo</Link> para
                empezar a agregar integrantes.
              </p>}
            </div>
          </section>
        ) : (
          visibles.map((equipo) => {
            const puedeEditar = editables.has(equipo.id);
            const candidatos = disponibles.get(equipo.id) ?? [];

            return (
              <article key={equipo.id} className={estilos.tarjeta}>
                <header>
                  <h2>{equipo.nombre}</h2>
                  <p>Proyecto: {titulos.get(equipo.proyectoId) ?? "—"}</p>
                </header>

                {!puedeEditar && (
                  <p className={estilos.nota}>
                    Solo el líder puede modificar el equipo, y no se puede
                    modificar si el proyecto está finalizado.
                  </p>
                )}

                <ul className={estilos.lista}>
                  {equipo.miembrosVisibles.map((m) => (
                    <li key={m.id} className={estilos.miembro}>
                      <div className={estilos.miembroDatos}>
                        <span>{nombres.get(m.usuarioId) ?? "Usuario"}</span>
                        <span
                          className={
                            m.rolEquipo === "LIDER"
                              ? estilos.rolLider
                              : estilos.rolIntegrante
                          }
                        >
                          {ETIQUETA_ROL_EQUIPO[m.rolEquipo]}
                        </span>
                      </div>

                      <DetallesListado titulo={nombres.get(m.usuarioId) ?? "Integrante"}>
                        <p>Equipo <strong>{equipo.nombre}</strong></p>
                        <p>Proyecto <strong>{titulos.get(equipo.proyectoId) ?? "—"}</strong></p>
                        <p>Rol <strong>{ETIQUETA_ROL_EQUIPO[m.rolEquipo]}</strong></p>
                        <p>Fecha de ingreso <strong>{m.fechaIngreso.toLocaleDateString("es-BO")}</strong></p>
                      </DetallesListado>

                      {puedeEditar && (
                        <div className={estilos.acciones}>
                          <form action={cambiarRol}>
                            <input type="hidden" name="equipoId" value={equipo.id} />
                            <input type="hidden" name="usuarioId" value={m.usuarioId} />
                            <input
                              type="hidden"
                              name="rol"
                              value={m.rolEquipo === "LIDER" ? "INTEGRANTE" : "LIDER"}
                            />
                            <button type="submit" className={estilos.secundario}>
                              {m.rolEquipo === "LIDER"
                                ? "Pasar a integrante"
                                : "Hacer líder"}
                            </button>
                          </form>

                          <form action={quitarIntegrante}>
                            <input type="hidden" name="equipoId" value={equipo.id} />
                            <input type="hidden" name="usuarioId" value={m.usuarioId} />
                            <button type="submit" className={estilos.peligro}>
                              Quitar
                            </button>
                          </form>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>

                {puedeEditar && (
                  <form action={agregarIntegrante} className={estilos.agregar}>
                    <input type="hidden" name="equipoId" value={equipo.id} />

                    {candidatos.length === 0 ? (
                      <p className={estilos.nota}>
                        No hay más estudiantes disponibles para agregar.
                      </p>
                    ) : (
                      <>
                        <select name="usuarioId" required defaultValue="">
                          <option value="" disabled>
                            Selecciona un estudiante
                          </option>
                          {candidatos.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.nombre} ({c.usuario})
                            </option>
                          ))}
                        </select>
                        <button type="submit" className={estilos.guardar}>
                          Agregar integrante
                        </button>
                      </>
                    )}
                  </form>
                )}
              </article>
            );
          })
        )}
      </div>
    </EstructuraDashboard>
  );
}

export default function PaginaIntegrantes({
  searchParams,
}: {
  searchParams: Promise<Parametros>;
}) {
  return (
    <Suspense fallback={<CargandoDashboard />}>
      <ContenidoIntegrantes parametros={searchParams} />
    </Suspense>
  );
}
