import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";

import { Suspense } from "react";
import { CalendarCheck, CalendarDays } from "lucide-react";

import { protegerRuta } from "@/lib/protegerRuta";
import { listarAsignaciones, listarPeriodos } from "@/lib/academico/repositorio";
import {
  accionCambiarEstadoPeriodo,
  accionEstablecerVigente,
} from "@/lib/academico/acciones";
import { nombrePeriodo } from "@/lib/academico/tipos";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import EncabezadoAcademico from "@/componentes/academico/EncabezadoAcademico";
import FormularioPeriodo from "@/componentes/academico/FormularioPeriodo";
import BotonAccion from "@/componentes/academico/BotonAccion";

import estilos from "@/componentes/academico/Academico.module.css";

async function ContenidoPeriodos() {
  const usuario = await protegerRuta("ADMINISTRADOR");

  const [periodos, asignaciones] = await Promise.all([
    listarPeriodos(),
    listarAsignaciones(),
  ]);

  const vigente = periodos.find((periodo) => periodo.vigente);
  const gestionSugerida = new Date().getFullYear();

  // Cantidad de materias asignadas en cada periodo
  const asignacionesPorPeriodo = new Map<number, number>();
  for (const asignacion of asignaciones) {
    asignacionesPorPeriodo.set(
      asignacion.periodo.id,
      (asignacionesPorPeriodo.get(asignacion.periodo.id) ?? 0) + 1
    );
  }

  return (
    <EstructuraDashboard usuario={usuario.usuario} rol={usuario.rol}>
      <div className={estilos.contenedor}>
        <EncabezadoAcademico
          etiqueta="GESTIÓN ACADÉMICA"
          titulo="Periodos académicos"
          descripcion="Registra las gestiones y semestres en los que se organizan materias, docentes y proyectos."
          insignia={{
            texto: vigente ? `Vigente: ${nombrePeriodo(vigente)}` : "Sin periodo vigente",
            icono: CalendarCheck,
          }}
        />

        <div className={estilos.columnas}>
          {/* REGISTRO */}
          <section className={estilos.panel}>
            <div className={estilos.panelCabecera}>
              <div>
                <h2>Nuevo periodo</h2>
                <p>Gestión y semestre académico</p>
              </div>
            </div>
            <div className={estilos.panelCuerpo}>
              <FormularioPeriodo gestionSugerida={gestionSugerida} />
            </div>
          </section>

          {/* LISTA */}
          <section className={estilos.panel}>
            <div className={estilos.panelCabecera}>
              <div>
                <h2>Periodos registrados</h2>
                <p>
                  Solo un periodo puede estar vigente. Los periodos inactivos
                  no aceptan nuevas asignaciones.
                </p>
              </div>
              <CalendarDays size={20} color="#075aa5" />
            </div>

            {periodos.length === 0 ? (
              <p className={estilos.vacio}>Aún no hay periodos registrados.</p>
            ) : (
              <div className={estilos.tablaContenedor}>
                <table className={estilos.tabla}>
                  <thead>
                    <tr>
                      <th scope="col">Periodo</th>
                      <th scope="col">Gestión</th>
                      <th scope="col">Semestre</th>
                      <th scope="col">Asignaciones</th>
                      <th scope="col">Estado</th>
                      <th scope="col">
                        <span className={estilos.oculto}>Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {periodos.map((periodo) => (
                      <tr
                        key={periodo.id}
                        className={periodo.activo ? undefined : estilos.filaInactiva}
                      >
                        <td>
                          <strong>{nombrePeriodo(periodo)}</strong>
                        </td>
                        <td>{periodo.gestion}</td>
                        <td>{periodo.semestre}</td>
                        <td>{asignacionesPorPeriodo.get(periodo.id) ?? 0}</td>
                        <td>
                          {periodo.vigente ? (
                            <span className={`${estilos.insignia} ${estilos.insigniaVigente}`}>
                              Vigente
                            </span>
                          ) : periodo.activo ? (
                            <span className={`${estilos.insignia} ${estilos.insigniaActiva}`}>
                              Activo
                            </span>
                          ) : (
                            <span className={`${estilos.insignia} ${estilos.insigniaInactiva}`}>
                              Inactivo
                            </span>
                          )}
                        </td>
                        <td>
                          <div className={estilos.accionesTabla}>
                            {!periodo.vigente && periodo.activo && (
                              <BotonAccion accion={accionEstablecerVigente} id={periodo.id}>
                                Marcar vigente
                              </BotonAccion>
                            )}

                            {!periodo.vigente && (
                              <BotonAccion
                                accion={accionCambiarEstadoPeriodo}
                                id={periodo.id}
                                peligro={periodo.activo}
                              >
                                {periodo.activo ? "Desactivar" : "Activar"}
                              </BotonAccion>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </EstructuraDashboard>
  );
}

export default function PaginaPeriodos() {
  return (
    <Suspense fallback={<CargandoDashboard />}>
      <ContenidoPeriodos />
    </Suspense>
  );
}
