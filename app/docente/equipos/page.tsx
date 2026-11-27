import DetallesListado from "@/componentes/dashboard/DetallesListado";
import FiltrosListado, { coincide, parametro, type ParametrosListado } from "@/componentes/dashboard/FiltrosListado";
import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";
import { Suspense } from "react";
import { Users } from "lucide-react";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import { listarEquiposDeDocente } from "@/lib/equipos/servicio";
import { ETIQUETA_ROL_EQUIPO } from "@/lib/equipos/tipos";
import { protegerRuta } from "@/lib/protegerRuta";
import { obtenerMaterias } from "@/lib/proyectos/materiasSimuladas";
import { obtenerNombresUsuarios } from "@/lib/proyectos/nombres";
import { listarProyectosDeDocente } from "@/lib/proyectos/servicio";
import { ETIQUETA_ESTADO } from "@/lib/proyectos/tipos";

import estilos from "./page.module.css";

async function ContenidoEquiposDocente({ searchParams }: { searchParams: Promise<ParametrosListado> }) {
  const usuario = await protegerRuta("DOCENTE");

  const filtros = await searchParams;
  const equipos = await listarEquiposDeDocente(usuario.id);
  const proyectos = await listarProyectosDeDocente(usuario.id);
  const materias = await obtenerMaterias();
  const nombres = await obtenerNombresUsuarios(
    [...equipos.flatMap((e) => e.miembros.map((m) => m.usuarioId)), ...proyectos.map((p) => p.docenteId)]
  );

  const proyectoPorId = new Map(proyectos.map((p) => [p.id, p]));
  const nombreMateria = new Map(materias.map((m) => [m.id, m.nombre]));

  const visibles = equipos.filter((equipo) => {
    const proyecto = proyectoPorId.get(equipo.proyectoId);
    return coincide(parametro(filtros, "q"), equipo.nombre, proyecto?.titulo,
      nombreMateria.get(proyecto?.materiaId ?? 0), ...equipo.miembros.map((m) => nombres.get(m.usuarioId)));
  });

  return (
    <EstructuraDashboard usuario={usuario.usuario} rol={usuario.rol}>
      <div className={estilos.contenedor}>
        <section>
          <span className={estilos.etiqueta}>EQUIPOS DE TRABAJO</span>
          <h1>Equipos de mis materias</h1>
          <p>Equipos de los proyectos en los que eres docente responsable.</p>
        </section>

        <FiltrosListado ruta="/docente/equipos" filtros={filtros} etiqueta="Buscar equipo, proyecto o integrante" />
        {visibles.length === 0 ? (
          <section className={estilos.panel}>
            <div className={estilos.vacio}>
              <Users size={35} />
              <h3>Aún no hay equipos en tus proyectos</h3>
              <p>Aparecerán cuando un estudiante cree el equipo de un proyecto tuyo.</p>
            </div>
          </section>
        ) : (
          visibles.map((equipo) => {
            const proyecto = proyectoPorId.get(equipo.proyectoId);

            return (
              <article key={equipo.id} className={estilos.tarjeta}>
                <header className={estilos.tarjetaCabecera}>
                  <div>
                    <h2>{equipo.nombre}</h2>
                    <p>
                      Proyecto: {proyecto?.titulo ?? "—"} ·{" "}
                      {proyecto ? nombreMateria.get(proyecto.materiaId) ?? "—" : "—"}
                    </p>
                  </div>

                  {proyecto && (
                    <span className={estilos.estado}>
                      {ETIQUETA_ESTADO[proyecto.estado]}
                    </span>
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

export default function PaginaEquiposDocente({ searchParams }: { searchParams: Promise<ParametrosListado> }) {
  return (
    <Suspense fallback={<CargandoDashboard />}>
      <ContenidoEquiposDocente searchParams={searchParams} />
    </Suspense>
  );
}