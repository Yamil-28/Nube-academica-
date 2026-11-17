
import { Suspense } from "react";
import { CalendarCheck, GraduationCap } from "lucide-react";

import { protegerRuta } from "@/lib/protegerRuta";
import {
  listarAsignaciones,
  listarDocentes,
  obtenerPeriodoVigente,
} from "@/lib/academico/repositorio";
import { nombrePeriodo } from "@/lib/academico/tipos";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import NavegacionInterna from "@/componentes/dashboard/NavegacionInterna";
import EncabezadoAcademico from "@/componentes/academico/EncabezadoAcademico";

import estilos from "@/componentes/academico/Academico.module.css";

async function ContenidoDocentesEstudiante() {
  const usuario = await protegerRuta("ESTUDIANTE");

  const [docentes, vigente] = await Promise.all([
    listarDocentes(true),
    obtenerPeriodoVigente(),
  ]);

  const asignaciones = vigente ? await listarAsignaciones({ idPeriodo: vigente.id }) : [];

  return (
    <EstructuraDashboard usuario={usuario.usuario} rol={usuario.rol}>
      <div className={estilos.contenedor}>
        <NavegacionInterna
          titulo="Docentes"
          nombreSeccion="Gestión académica"
          rutaInicio="/estudiante"
        />

        <EncabezadoAcademico
          etiqueta="GESTIÓN ACADÉMICA"
          titulo="Docentes de la Carrera"
          descripcion="Docentes de Ingeniería de Sistemas y las materias que dictan en el periodo vigente."
          insignia={{
            texto: vigente ? `Periodo ${nombrePeriodo(vigente)}` : "Sin periodo vigente",
            icono: CalendarCheck,
          }}
        />

        <section className={estilos.panel}>
          <div className={estilos.panelCuerpo}>
            {docentes.length === 0 ? (
              <p className={estilos.vacio}>Aún no hay docentes registrados.</p>
            ) : (
              <div className={estilos.tarjetas}>
                {docentes.map((docente) => {
                  const materias = asignaciones
                    .filter((a) => a.docente.id === docente.id)
                    .map((a) => a.materia);

                  return (
                    <article key={docente.id} className={estilos.tarjeta}>
                      <div className={estilos.tarjetaSuperior}>
                        <span className={estilos.tarjetaIcono}>
                          <GraduationCap size={20} />
                        </span>
                      </div>

                      <h3>{docente.nombre}</h3>

                      {materias.length === 0 ? (
                        <p>Sin materias en el periodo vigente.</p>
                      ) : (
                        <p>
                          {materias.map((materia) => (
                            <span key={materia.id} className={estilos.secundario}>
                              {materia.codigo && (
                                <>
                                  <span className={estilos.codigo}>{materia.codigo}</span>{" "}
                                </>
                              )}
                              {materia.nombre}
                            </span>
                          ))}
                        </p>
                      )}

                      <div className={estilos.tarjetaPie}>
                        <span>
                          <strong>{materias.length}</strong>{" "}
                          {materias.length === 1 ? "materia" : "materias"} en{" "}
                          {vigente ? nombrePeriodo(vigente) : "el periodo"}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </EstructuraDashboard>
  );
}

export default function PaginaDocentesEstudiante() {
  return (
    <Suspense fallback={<p className={estilos.cargando}>Cargando docentes...</p>}>
      <ContenidoDocentesEstudiante />
    </Suspense>
  );
}
