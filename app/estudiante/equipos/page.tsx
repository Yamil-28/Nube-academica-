import DetallesListado from "@/componentes/dashboard/DetallesListado";
import FiltrosListado, { coincide, parametro, type ParametrosListado } from "@/componentes/dashboard/FiltrosListado";
import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";
import { Suspense } from "react";
import Link from "next/link";
import { Users, UserPlus } from "lucide-react";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import {
  listarEquiposDeUsuario,
} from "@/lib/equipos/servicio";
import { ETIQUETA_ROL_EQUIPO } from "@/lib/equipos/tipos";
import { protegerRuta } from "@/lib/protegerRuta";
import { listarProyectosDeUsuario } from "@/lib/proyectos/servicio";
import { obtenerMaterias } from "@/lib/proyectos/materiasSimuladas";
import { ETIQUETA_ESTADO } from "@/lib/proyectos/tipos";
import { obtenerNombresUsuarios } from "@/lib/proyectos/nombres";

import estilos from "./page.module.css";

type Parametros = ParametrosListado;

async function ContenidoMisEquipos({
  parametros,
}: {
  parametros: Promise<Parametros>;
}) {
  const usuario = await protegerRuta("ESTUDIANTE");
  const filtros = await parametros;
  const creado = parametro(filtros, "creado");

  const equipos = await listarEquiposDeUsuario(usuario.id);
  const [proyectos, materias] = await Promise.all([listarProyectosDeUsuario(usuario.id), obtenerMaterias()]);
  const proyectoPorId = new Map(proyectos.map((p) => [p.id, p]));
  const nombreMateria = new Map(materias.map((m) => [m.id, m.nombre]));
  const nombres = await obtenerNombresUsuarios(
    [...equipos.flatMap((e) => e.miembros.map((m) => m.usuarioId)), ...proyectos.map((p) => p.docenteId)]
  );

  const visibles = equipos.filter((equipo) => {
    const proyecto = proyectoPorId.get(equipo.proyectoId);
    return coincide(parametro(filtros, "q"), equipo.nombre, proyecto?.titulo,
      nombreMateria.get(proyecto?.materiaId ?? 0), ...equipo.miembros.map((m) => nombres.get(m.usuarioId)));
  });

  return (
    <EstructuraDashboard usuario={usuario.usuario} rol={usuario.rol}>
      <div className={estilos.contenedor}>
        <section className={estilos.encabezado}>
          <div>
            <span className={estilos.etiqueta}>EQUIPOS DE TRABAJO</span>
            <h1>Mis equipos</h1>
            <p>Equipos de los que formas parte y sus integrantes.</p>
          </div>

          <Link href="/estudiante/equipos/nuevo" className={estilos.botonPrincipal}>
            <UserPlus size={18} />
            Crear equipo
          </Link>
        </section>

        {creado === "1" && (
          <p className={estilos.aviso}>Equipo creado correctamente.</p>
        )}

        <FiltrosListado ruta="/estudiante/equipos" filtros={filtros} etiqueta="Buscar equipo, proyecto o integrante" />
        {visibles.length === 0 ? (
          <section className={estilos.panel}>
            <div className={estilos.vacio}>
              <Users size={35} />
              <h3>Aún no formas parte de ningún equipo</h3>
              <p>Crea uno para tu proyecto y agrega a tus compañeros.</p>
            </div>
          </section>
        ) : (
          visibles.map((equipo) => {
            const proyecto = proyectoPorId.get(equipo.proyectoId);
            const miRol = equipo.miembros.find(
              (m) => m.usuarioId === usuario.id
            )?.rolEquipo;

            return (
              <article key={equipo.id} className={estilos.tarjeta}>
                <header className={estilos.tarjetaCabecera}>
                  <div>
                    <h2>{equipo.nombre}</h2>
                    <p>
                      Proyecto: {proyecto?.titulo ?? "—"} ·{" "}
                      {equipo.miembros.length}{" "}
                      {equipo.miembros.length === 1 ? "integrante" : "integrantes"}
                    </p>
                  </div>

                  {miRol && (
                    <span className={estilos.rol}>{ETIQUETA_ROL_EQUIPO[miRol]}</span>
                  )}
                </header>

                <ul className={estilos.lista}>
                  {equipo.miembros.map((m) => (
                    <li key={m.id} className={estilos.miembro}>
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
                    </li>
                  ))}
                </ul>
                <DetallesListado titulo={equipo.nombre}>
                  <p>Proyecto <strong>{proyecto?.titulo ?? "—"}</strong></p>
                  <p>Materia <strong>{nombreMateria.get(proyecto?.materiaId ?? 0) ?? "—"}</strong></p>
                  <p>Docente <strong>{nombres.get(proyecto?.docenteId ?? 0) ?? "—"}</strong></p>
                  <p>Estado <strong>{proyecto ? ETIQUETA_ESTADO[proyecto.estado] : "—"}</strong></p>
                  <ul>{equipo.miembros.map((m) => <li key={m.id}>{nombres.get(m.usuarioId) ?? "Usuario"} · {ETIQUETA_ROL_EQUIPO[m.rolEquipo]}</li>)}</ul>
                </DetallesListado>
              </article>
            );
          })
        )}
      </div>
    </EstructuraDashboard>
  );
}

export default function PaginaMisEquipos({
  searchParams,
}: {
  searchParams: Promise<Parametros>;
}) {
  return (
    <Suspense fallback={<CargandoDashboard />}>
      <ContenidoMisEquipos parametros={searchParams} />
    </Suspense>
  );
}