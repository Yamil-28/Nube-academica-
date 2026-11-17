
import { Suspense } from "react";
import { BookOpen, FolderKanban, Info, UsersRound } from "lucide-react";

import { protegerRuta } from "@/lib/protegerRuta";
import { listarAsignaciones, obtenerPeriodoVigente } from "@/lib/academico/repositorio";
import { nombrePeriodo } from "@/lib/academico/tipos";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import NavegacionInterna from "@/componentes/dashboard/NavegacionInterna";
import EncabezadoAcademico from "@/componentes/academico/EncabezadoAcademico";

import estilos from "@/componentes/academico/Academico.module.css";

/* ==========================================
   MIS ESTUDIANTES (DOCENTE)
   El documento no contempla inscripciones
   (Capítulo 1, límites). El docente conoce a sus
   estudiantes a través de los PROYECTOS de sus
   materias (Tabla 6, Módulo 5), por lo que esta
   vista se completa al integrar ese módulo.
========================================== */

async function ContenidoMisEstudiantes() {
  const usuario = await protegerRuta("DOCENTE");

  const vigente = await obtenerPeriodoVigente();
  const asignaciones = vigente
    ? await listarAsignaciones({ idDocente: usuario.id, idPeriodo: vigente.id })
    : [];

  return (
    <EstructuraDashboard usuario={usuario.usuario} rol={usuario.rol}>
      <div className={estilos.contenedor}>
        <NavegacionInterna
          titulo="Mis estudiantes"
          nombreSeccion="Gestión académica"
          rutaInicio="/docente"
        />

        <EncabezadoAcademico
          etiqueta="GESTIÓN ACADÉMICA"
          titulo="Mis estudiantes"
          descripcion="Estudiantes que desarrollan proyectos en las materias que tienes asignadas."
          insignia={{ texto: "Docente", icono: UsersRound }}
        />

        <p className={`${estilos.mensaje} ${estilos.mensajeExito}`} role="note">
          <Info size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
          SISCloud no gestiona inscripciones. Los estudiantes se vinculan a tus
          materias al registrar sus proyectos, y aparecerán aquí cuando se
          integre el módulo de Gestión de proyectos académicos.
        </p>

        <section className={estilos.panel}>
          <div className={estilos.panelCabecera}>
            <div>
              <h2>Materias del periodo {vigente ? nombrePeriodo(vigente) : "vigente"}</h2>
              <p>Estudiantes vinculados por medio de proyectos</p>
            </div>
          </div>

          <div className={estilos.panelCuerpo}>
            {asignaciones.length === 0 ? (
              <p className={estilos.vacio}>
                No tienes materias asignadas en el periodo vigente.
              </p>
            ) : (
              <div className={estilos.tarjetas}>
                {asignaciones.map((asignacion) => (
                  <article key={asignacion.id} className={estilos.tarjeta}>
                    <div className={estilos.tarjetaSuperior}>
                      <span className={estilos.tarjetaIcono}>
                        <BookOpen size={20} />
                      </span>
                      {asignacion.materia.codigo && <span className={estilos.codigo}>{asignacion.materia.codigo}</span>}
                    </div>

                    <h3>{asignacion.materia.nombre}</h3>
                    <p>Aún no hay proyectos registrados en esta materia.</p>

                    <div className={estilos.tarjetaPie}>
                      <FolderKanban size={14} />
                      <span>
                        <strong>0</strong> estudiantes con proyectos
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </EstructuraDashboard>
  );
}

export default function PaginaMisEstudiantes() {
  return (
    <Suspense fallback={<p className={estilos.cargando}>Cargando estudiantes...</p>}>
      <ContenidoMisEstudiantes />
    </Suspense>
  );
}
