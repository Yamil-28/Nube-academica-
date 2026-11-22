
import { Suspense } from "react";
import { BookOpen, CalendarCheck, GraduationCap } from "lucide-react";

import { protegerRuta } from "@/lib/protegerRuta";
import {
  listarAsignaciones,
  listarMaterias,
  obtenerPeriodoVigente,
} from "@/lib/academico/repositorio";
import { nombrePeriodo } from "@/lib/academico/tipos";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import NavegacionInterna from "@/componentes/dashboard/NavegacionInterna";
import EncabezadoAcademico from "@/componentes/academico/EncabezadoAcademico";

import estilos from "@/componentes/academico/Academico.module.css";

async function ContenidoMateriasEstudiante() {
  // El estudiante consulta materias y docentes (Tabla 6)
  const usuario = await protegerRuta("ESTUDIANTE");

  const [materias, vigente] = await Promise.all([
    listarMaterias({ soloActivas: true }),
    obtenerPeriodoVigente(),
  ]);

  const asignaciones = vigente ? await listarAsignaciones({ idPeriodo: vigente.id }) : [];

  // Agrupar por semestre de la carrera
  const porNivel = new Map<number, typeof materias>();
  for (const materia of materias) {
    const lista = porNivel.get(materia.nivel) ?? [];
    lista.push(materia);
    porNivel.set(materia.nivel, lista);
  }

  return (
    <EstructuraDashboard usuario={usuario.usuario} rol={usuario.rol}>
      <div className={estilos.contenedor}>
        <NavegacionInterna
          titulo="Materias"
          nombreSeccion="Gestión académica"
          rutaInicio="/estudiante"
        />

        <EncabezadoAcademico
          etiqueta="GESTIÓN ACADÉMICA"
          titulo="Materias de la Carrera"
          descripcion="Asignaturas de Ingeniería de Sistemas y sus docentes en el periodo vigente."
          insignia={{
            texto: vigente ? `Periodo ${nombrePeriodo(vigente)}` : "Sin periodo vigente",
            icono: CalendarCheck,
          }}
        />

        {materias.length === 0 ? (
          <section className={estilos.panel}>
            <p className={estilos.vacio}>Aún no hay materias registradas.</p>
          </section>
        ) : (
          [...porNivel.entries()].map(([nivel, lista]) => (
            <section key={nivel} className={estilos.panel}>
              <div className={estilos.panelCabecera}>
                <div>
                  <h2>{nivel}.° semestre</h2>
                  <p>
                    {lista.length === 1 ? "1 materia" : `${lista.length} materias`}
                  </p>
                </div>
              </div>

              <div className={estilos.panelCuerpo}>
                <div className={estilos.tarjetas}>
                  {lista.map((materia) => {
                    const docentes = asignaciones
                      .filter((a) => a.materia.id === materia.id)
                      .map((a) => a.docente.nombre);

                    return (
                      <article key={materia.id} className={estilos.tarjeta}>
                        <div className={estilos.tarjetaSuperior}>
                          <span className={estilos.tarjetaIcono}>
                            <BookOpen size={20} />
                          </span>
                          {materia.codigo && <span className={estilos.codigo}>{materia.codigo}</span>}
                        </div>

                        <h3>{materia.nombre}</h3>
                        {materia.descripcion && <p>{materia.descripcion}</p>}

                        <div className={estilos.tarjetaPie}>
                          <GraduationCap size={14} />
                          <span>
                            {docentes.length > 0 ? (
                              <strong>{docentes.join(", ")}</strong>
                            ) : (
                              "Docente por asignar"
                            )}
                          </span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>
          ))
        )}
      </div>
    </EstructuraDashboard>
  );
}

export default function PaginaMateriasEstudiante() {
  return (
    <Suspense fallback={<p className={estilos.cargando}>Cargando materias...</p>}>
      <ContenidoMateriasEstudiante />
    </Suspense>
  );
}
