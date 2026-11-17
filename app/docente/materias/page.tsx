
import { Suspense } from "react";
import { BookOpen, CalendarCheck, History } from "lucide-react";

import { protegerRuta } from "@/lib/protegerRuta";
import { listarAsignaciones, obtenerPeriodoVigente } from "@/lib/academico/repositorio";
import { nombrePeriodo } from "@/lib/academico/tipos";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import NavegacionInterna from "@/componentes/dashboard/NavegacionInterna";
import EncabezadoAcademico from "@/componentes/academico/EncabezadoAcademico";

import estilos from "@/componentes/academico/Academico.module.css";

async function ContenidoMisMaterias() {
  // El docente solo consulta las materias que tiene asignadas (Tabla 6)
  const usuario = await protegerRuta("DOCENTE");

  const [vigente, asignaciones] = await Promise.all([
    obtenerPeriodoVigente(),
    listarAsignaciones({ idDocente: usuario.id }),
  ]);

  const actuales = asignaciones.filter((a) => a.periodo.id === vigente?.id);
  const anteriores = asignaciones.filter((a) => a.periodo.id !== vigente?.id);

  return (
    <EstructuraDashboard usuario={usuario.usuario} rol={usuario.rol}>
      <div className={estilos.contenedor}>
        <NavegacionInterna
          titulo="Mis materias"
          nombreSeccion="Gestión académica"
          rutaInicio="/docente"
        />

        <EncabezadoAcademico
          etiqueta="GESTIÓN ACADÉMICA"
          titulo="Mis materias"
          descripcion="Materias que tienes asignadas por la Carrera en cada periodo académico."
          insignia={{
            texto: vigente ? `Periodo ${nombrePeriodo(vigente)}` : "Sin periodo vigente",
            icono: CalendarCheck,
          }}
        />

        {/* PERIODO VIGENTE */}
        <section className={estilos.panel}>
          <div className={estilos.panelCabecera}>
            <div>
              <h2>Periodo vigente</h2>
              <p>
                {actuales.length === 1
                  ? "1 materia asignada"
                  : `${actuales.length} materias asignadas`}
              </p>
            </div>
          </div>

          <div className={estilos.panelCuerpo}>
            {actuales.length === 0 ? (
              <p className={estilos.vacio}>
                No tienes materias asignadas en el periodo vigente. Si es un
                error, comunícate con el administrador de la Carrera.
              </p>
            ) : (
              <div className={estilos.tarjetas}>
                {actuales.map((asignacion) => (
                  <article key={asignacion.id} className={estilos.tarjeta}>
                    <div className={estilos.tarjetaSuperior}>
                      <span className={estilos.tarjetaIcono}>
                        <BookOpen size={20} />
                      </span>
                      {asignacion.materia.codigo && <span className={estilos.codigo}>{asignacion.materia.codigo}</span>}
                    </div>

                    <h3>{asignacion.materia.nombre}</h3>
                    <p>
                      {asignacion.materia.nivel}.° semestre de la carrera
                      {asignacion.materia.descripcion ? ` · ${asignacion.materia.descripcion}` : ""}
                    </p>

                    <div className={estilos.tarjetaPie}>
                      <CalendarCheck size={14} />
                      <span>
                        Periodo <strong>{nombrePeriodo(asignacion.periodo)}</strong>
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* HISTORIAL */}
        <section className={estilos.panel}>
          <div className={estilos.panelCabecera}>
            <div>
              <h2>Periodos anteriores</h2>
              <p>Materias que dictaste en otros periodos</p>
            </div>
            <History size={20} color="#075aa5" />
          </div>

          {anteriores.length === 0 ? (
            <p className={estilos.vacio}>No hay registros de periodos anteriores.</p>
          ) : (
            <div className={estilos.tablaContenedor}>
              <table className={estilos.tabla}>
                <thead>
                  <tr>
                    <th scope="col">Periodo</th>
                    <th scope="col">Código</th>
                    <th scope="col">Materia</th>
                    <th scope="col">Semestre</th>
                  </tr>
                </thead>
                <tbody>
                  {anteriores.map((asignacion) => (
                    <tr key={asignacion.id}>
                      <td>{nombrePeriodo(asignacion.periodo)}</td>
                      <td className={estilos.codigo}>{asignacion.materia.codigo ?? "—"}</td>
                      <td>{asignacion.materia.nombre}</td>
                      <td>{asignacion.materia.nivel}.°</td>
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

export default function PaginaMisMaterias() {
  return (
    <Suspense fallback={<p className={estilos.cargando}>Cargando materias...</p>}>
      <ContenidoMisMaterias />
    </Suspense>
  );
}
