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

async function ContenidoEquiposDocente() {
  const usuario = await protegerRuta("DOCENTE");

  const equipos = await listarEquiposDeDocente(usuario.id);
  const proyectos = await listarProyectosDeDocente(usuario.id);
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
          <h1>Equipos de mis materias</h1>
          <p>Equipos de los proyectos en los que eres docente responsable.</p>
        </section>

        {equipos.length === 0 ? (
          <section className={estilos.panel}>
            <div className={estilos.vacio}>
              <Users size={35} />
              <h3>Aún no hay equipos en tus proyectos</h3>
              <p>Aparecerán cuando un estudiante cree el equipo de un proyecto tuyo.</p>
            </div>
          </section>
        ) : (
          equipos.map((equipo) => {
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
              </article>
            );
          })
        )}
      </div>
    </EstructuraDashboard>
  );
}

export default function PaginaEquiposDocente() {
  return (
    <Suspense fallback={<CargandoDashboard />}>
      <ContenidoEquiposDocente />
    </Suspense>
  );
}