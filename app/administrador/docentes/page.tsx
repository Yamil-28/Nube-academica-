import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";

import { Suspense } from "react";
import { Filter, GraduationCap, UsersRound } from "lucide-react";

import { protegerRuta } from "@/lib/protegerRuta";
import {
  listarAsignaciones,
  listarDocentes,
  listarMaterias,
  listarPeriodos,
} from "@/lib/academico/repositorio";
import { accionQuitarAsignacion } from "@/lib/academico/acciones";
import { etiquetaMateria, nombrePeriodo } from "@/lib/academico/tipos";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import EncabezadoAcademico from "@/componentes/academico/EncabezadoAcademico";
import FormularioAsignacion from "@/componentes/academico/FormularioAsignacion";
import BotonAccion from "@/componentes/academico/BotonAccion";

import estilos from "@/componentes/academico/Academico.module.css";

const RUTA = "/administrador/docentes";

type ParametrosBusqueda = Promise<Record<string, string | string[] | undefined>>;

async function ContenidoDocentes({ searchParams }: { searchParams: ParametrosBusqueda }) {
  const usuario = await protegerRuta("ADMINISTRADOR");
  const parametros = await searchParams;

  const [periodos, materiasActivas, docentesActivos, todosLosDocentes] = await Promise.all([
    listarPeriodos(),
    listarMaterias({ soloActivas: true }),
    listarDocentes(true),
    listarDocentes(),
  ]);

  // Periodo mostrado: el de la URL (?periodo=ID) o el vigente
  const valorPeriodo = parametros.periodo;
  const idPedido = Number.parseInt(
    Array.isArray(valorPeriodo) ? valorPeriodo[0] : valorPeriodo ?? "",
    10
  );
  const periodo =
    periodos.find((p) => p.id === idPedido) ??
    periodos.find((p) => p.vigente) ??
    periodos[0];

  const asignaciones = periodo ? await listarAsignaciones({ idPeriodo: periodo.id }) : [];
  const periodosActivos = periodos.filter((p) => p.activo);

  // Carga por docente en el periodo mostrado
  const docentesConCarga = todosLosDocentes.map((docente) => ({
    ...docente,
    materias: asignaciones.filter((a) => a.docente.id === docente.id).length,
  }));

  return (
    <EstructuraDashboard usuario={usuario.usuario} rol={usuario.rol}>
      <div className={estilos.contenedor}>
        <EncabezadoAcademico
          etiqueta="GESTIÓN ACADÉMICA"
          titulo="Docentes y materias"
          descripcion="Asigna a cada docente las materias que dicta en cada periodo académico."
          insignia={{
            texto: `${todosLosDocentes.length} docentes registrados`,
            icono: GraduationCap,
          }}
        />

        <div className={estilos.columnas}>
          {/* NUEVA ASIGNACIÓN */}
          <section className={estilos.panel}>
            <div className={estilos.panelCabecera}>
              <div>
                <h2>Nueva asignación</h2>
                <p>Docente, materia y periodo</p>
              </div>
            </div>
            <div className={estilos.panelCuerpo}>
              <FormularioAsignacion
                key={periodo?.id ?? "sin-periodo"}
                docentes={docentesActivos}
                materias={materiasActivas}
                periodos={periodosActivos}
                idPeriodoSeleccionado={periodo?.activo ? periodo.id : undefined}
              />
            </div>
          </section>

          {/* ASIGNACIONES DEL PERIODO */}
          <section className={estilos.panel}>
            <div className={estilos.panelCabecera}>
              <div>
                <h2>
                  Asignaciones {periodo ? nombrePeriodo(periodo) : ""}
                </h2>
                <p>
                  {asignaciones.length} materias asignadas en este periodo
                </p>
              </div>

              <form method="get" action={RUTA} className={estilos.filtrosLinea}>
                <div className={estilos.campo}>
                  <label htmlFor="docentes-periodo">Periodo</label>
                  <select
                    id="docentes-periodo"
                    name="periodo"
                    defaultValue={periodo?.id ?? ""}
                  >
                    {periodos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {nombrePeriodo(p)}
                        {p.vigente ? " (vigente)" : ""}
                        {!p.activo ? " (inactivo)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className={`${estilos.boton} ${estilos.botonSecundario}`}>
                  <Filter size={16} />
                  Ver
                </button>
              </form>
            </div>

            {asignaciones.length === 0 ? (
              <p className={estilos.vacio}>
                No hay docentes asignados en este periodo.
              </p>
            ) : (
              <div className={estilos.tablaContenedor}>
                <table className={estilos.tabla}>
                  <thead>
                    <tr>
                      <th scope="col">Materia</th>
                      <th scope="col">Semestre</th>
                      <th scope="col">Docente</th>
                      <th scope="col">
                        <span className={estilos.oculto}>Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {asignaciones.map((asignacion) => (
                      <tr key={asignacion.id}>
                        <td>
                          <strong>{asignacion.materia.nombre}</strong>
                          {asignacion.materia.codigo && (
                            <span className={`${estilos.secundario} ${estilos.codigo}`}>
                              {asignacion.materia.codigo}
                            </span>
                          )}
                        </td>
                        <td>{asignacion.materia.nivel}.°</td>
                        <td>
                          {asignacion.docente.nombre}
                          <span className={estilos.secundario}>
                            @{asignacion.docente.usuario}
                            {!asignacion.docente.activo ? " · cuenta inactiva" : ""}
                          </span>
                        </td>
                        <td>
                          <div className={estilos.accionesTabla}>
                            <BotonAccion
                              accion={accionQuitarAsignacion}
                              id={asignacion.id}
                              peligro
                              confirmacion={`¿Quitar "${etiquetaMateria(asignacion.materia)}" a ${asignacion.docente.nombre}?`}
                            >
                              Quitar
                            </BotonAccion>
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

        {/* CARGA POR DOCENTE */}
        <section className={estilos.panel}>
          <div className={estilos.panelCabecera}>
            <div>
              <h2>Docentes de la Carrera</h2>
              <p>
                Materias asignadas a cada docente en{" "}
                {periodo ? nombrePeriodo(periodo) : "el periodo"}
              </p>
            </div>
            <UsersRound size={20} color="#075aa5" />
          </div>

          {docentesConCarga.length === 0 ? (
            <p className={estilos.vacio}>
              No hay usuarios con rol Docente. Regístralos en Gestión de usuarios.
            </p>
          ) : (
            <div className={estilos.tablaContenedor}>
              <table className={estilos.tabla}>
                <thead>
                  <tr>
                    <th scope="col">Docente</th>
                    <th scope="col">Usuario</th>
                    <th scope="col">Materias en el periodo</th>
                    <th scope="col">Cuenta</th>
                  </tr>
                </thead>
                <tbody>
                  {docentesConCarga.map((docente) => (
                    <tr
                      key={docente.id}
                      className={docente.activo ? undefined : estilos.filaInactiva}
                    >
                      <td>{docente.nombre}</td>
                      <td>@{docente.usuario}</td>
                      <td>{docente.materias}</td>
                      <td>
                        <span
                          className={`${estilos.insignia} ${
                            docente.activo ? estilos.insigniaActiva : estilos.insigniaInactiva
                          }`}
                        >
                          {docente.activo ? "Activa" : "Inactiva"}
                        </span>
                      </td>
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

export default function PaginaDocentes({ searchParams }: { searchParams: ParametrosBusqueda }) {
  return (
    <Suspense fallback={<CargandoDashboard />}>
      <ContenidoDocentes searchParams={searchParams} />
    </Suspense>
  );
}
