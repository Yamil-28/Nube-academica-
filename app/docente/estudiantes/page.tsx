import { Suspense } from "react";
import { BookOpen, FolderKanban, UsersRound } from "lucide-react";

import { protegerRuta } from "@/lib/protegerRuta";
import { prisma } from "@/lib/prisma";
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
   estudiantes a través de los PROYECTOS que dirige
   en sus materias (Tabla 6, Módulo 5).
========================================== */

async function ContenidoMisEstudiantes() {
  const usuario = await protegerRuta("DOCENTE");

  const vigente = await obtenerPeriodoVigente();

  const [asignaciones, proyectos] = vigente
    ? await Promise.all([
        listarAsignaciones({ idDocente: usuario.id, idPeriodo: vigente.id }),
        prisma.proyecto.findMany({
          where: { docenteId: usuario.id, idPeriodo: vigente.id },
          include: {
            equipo: { include: { miembros: { include: { usuario: { select: { id: true, nombre: true, usuario: true } } } } } },
          },
          orderBy: { titulo: "asc" },
        }),
      ])
    : [[], []];

  const totalEstudiantes = new Set(
    proyectos.flatMap((p) => (p.equipo?.miembros ?? []).map((m) => m.usuario.id))
  ).size;

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
          descripcion="Estudiantes que desarrollan proyectos bajo tu dirección en tus materias."
          insignia={{
            texto: `${totalEstudiantes} estudiantes · ${vigente ? nombrePeriodo(vigente) : "sin periodo"}`,
            icono: UsersRound,
          }}
        />

        {asignaciones.length === 0 ? (
          <section className={estilos.panel}>
            <p className={estilos.vacio}>
              No tienes materias asignadas en el periodo vigente.
            </p>
          </section>
        ) : (
          asignaciones.map((asignacion) => {
            const proyectosMateria = proyectos.filter(
              (p) => p.materiaId === asignacion.materia.id
            );

            return (
              <section key={asignacion.id} className={estilos.panel}>
                <div className={estilos.panelCabecera}>
                  <div>
                    <h2>
                      <BookOpen size={17} style={{ verticalAlign: "-3px", marginRight: 6 }} />
                      {asignacion.materia.nombre}
                    </h2>
                    <p>
                      {proyectosMateria.length === 1
                        ? "1 proyecto"
                        : `${proyectosMateria.length} proyectos`}{" "}
                      en {nombrePeriodo(asignacion.periodo)}
                    </p>
                  </div>
                </div>

                {proyectosMateria.length === 0 ? (
                  <p className={estilos.vacio}>
                    Aún no hay proyectos registrados en esta materia.
                  </p>
                ) : (
                  <div className={estilos.tablaContenedor}>
                    <table className={estilos.tabla}>
                      <thead>
                        <tr>
                          <th scope="col">Estudiante</th>
                          <th scope="col">Usuario</th>
                          <th scope="col">Proyecto</th>
                          <th scope="col">Rol en el equipo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {proyectosMateria.flatMap((proyecto) =>
                          (proyecto.equipo?.miembros ?? []).map((miembro) => (
                            <tr key={`${proyecto.id}-${miembro.usuario.id}`}>
                              <td>{miembro.usuario.nombre}</td>
                              <td>@{miembro.usuario.usuario}</td>
                              <td>
                                <FolderKanban
                                  size={13}
                                  style={{ verticalAlign: "-2px", marginRight: 5, color: "#075aa5" }}
                                />
                                {proyecto.titulo}
                              </td>
                              <td style={{ textTransform: "capitalize" }}>{miembro.rolEquipo}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            );
          })
        )}
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
