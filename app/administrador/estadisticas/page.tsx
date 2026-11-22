import { Suspense } from "react";

import {
  BookOpen,
  CalendarClock,
  ChartColumn,
  ClipboardCheck,
  Cloud,
  FolderKanban,
  History,
  UsersRound,
  UserCheck,
  UserPlus,
  Users,
  UserX,
} from "lucide-react";

import { protegerRuta } from "@/lib/protegerRuta";
import { obtenerEstadisticasUsuarios } from "@/lib/informes/estadisticasUsuarios";
import { obtenerEstadisticasAcademicas } from "@/lib/informes/estadisticasAcademicas";
import { formatearFechaHora, pluralizar } from "@/lib/informes/formato";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import NavegacionInterna from "@/componentes/dashboard/NavegacionInterna";
import TarjetaEstadistica from "@/componentes/dashboard/TarjetaEstadistica";
import GraficoBarrasHorizontales, {
  type ColorBarra,
} from "@/componentes/informes/GraficoBarrasHorizontales";
import GraficoColumnas from "@/componentes/informes/GraficoColumnas";

import estilos from "./page.module.css";

/* ==========================================
   CONFIGURACIÓN DE LA PÁGINA
========================================== */

const coloresRoles: Record<string, ColorBarra> = {
  ADMINISTRADOR: "dorado",
  DOCENTE: "verde",
  ESTUDIANTE: "morado",
};

// Indicadores que dependen de módulos aún no integrados.
// Al integrar cada módulo, su sección se reemplaza por datos reales.
const indicadoresPendientes = [
  {
    titulo: "Actividad del sistema",
    descripcion: "Acciones registradas por la auditoría, por día y tipo.",
    icono: History,
  },
  {
    titulo: "Nube académica",
    descripcion: "Espacio utilizado, cuotas por proyecto y archivos.",
    icono: Cloud,
  },
];

/* ==========================================
   CONTENIDO (SE CONSULTA EN EL SERVIDOR)
========================================== */

async function ContenidoEstadisticas() {
  // 1. Solo administradores (rol verificado en Neon)
  const usuario = await protegerRuta("ADMINISTRADOR");

  // 2. Datos de usuarios, gestión académica y proyectos (en paralelo)
  const [estadisticas, academico] = await Promise.all([
    obtenerEstadisticasUsuarios(),
    obtenerEstadisticasAcademicas(),
  ]);

  const fechaGeneracion = formatearFechaHora(estadisticas.generadoEn);

  const totalRegistrosAnio = estadisticas.registrosPorMes.reduce(
    (suma, mes) => suma + mes.total,
    0
  );

  return (
    <EstructuraDashboard usuario={usuario.usuario} rol={usuario.rol}>
      <div className={estilos.estadisticas}>
        <NavegacionInterna
          titulo="Estadísticas generales"
          nombreSeccion="Informes y reportes"
          rutaInicio="/administrador"
        />

        {/* ENCABEZADO */}
        <div className={estilos.estadisticasEncabezado}>
          <div>
            <span className={estilos.estadisticasEtiqueta}>
              INFORMES Y REPORTES
            </span>

            <h1>Estadísticas generales</h1>

            <p>
              Indicadores consolidados de SISCloud para respaldar las
              decisiones de la Carrera.
            </p>
          </div>

          <div className={estilos.estadisticasInsignia}>
            <CalendarClock size={20} />
            <span>Datos al {fechaGeneracion}</span>
          </div>
        </div>

        {/* INDICADORES DE USUARIOS */}
        <section className={estilos.estadisticasSeccion}>
          <div className={estilos.estadisticasTituloSeccion}>
            <h2>Usuarios de la plataforma</h2>
            <p>Cuentas registradas y su estado actual</p>
          </div>

          <div className={estilos.estadisticasCuadricula}>
            <TarjetaEstadistica
              titulo="Total de usuarios"
              valor={estadisticas.total}
              icono={Users}
              ruta="/administrador/usuarios"
              color="azul"
            />

            <TarjetaEstadistica
              titulo="Cuentas activas"
              valor={estadisticas.activos}
              icono={UserCheck}
              ruta="/administrador/usuarios"
              color="verde"
            />

            <TarjetaEstadistica
              titulo="Cuentas inactivas"
              valor={estadisticas.inactivos}
              icono={UserX}
              ruta="/administrador/usuarios"
              color="dorado"
            />

            <TarjetaEstadistica
              titulo={`Nuevos (últimos ${estadisticas.diasUsuariosNuevos} días)`}
              valor={estadisticas.nuevosRecientes}
              icono={UserPlus}
              ruta="/administrador/usuarios"
              color="morado"
            />
          </div>
        </section>

        {/* GRÁFICOS */}
        <div className={estilos.estadisticasColumnas}>
          <section className={estilos.estadisticasPanel}>
            <div className={estilos.estadisticasPanelCabecera}>
              <div>
                <h2>Distribución por rol</h2>
                <p>Usuarios de cada rol y su estado</p>
              </div>
              <Users size={20} />
            </div>

            <div className={estilos.estadisticasPanelCuerpo}>
              <GraficoBarrasHorizontales
                descripcion="Cantidad de usuarios por rol"
                datos={estadisticas.porRol.map((rol) => ({
                  etiqueta: rol.nombre,
                  valor: rol.total,
                  detalle: `${pluralizar(rol.activos, "activo", "activos")} · ${pluralizar(rol.inactivos, "inactivo", "inactivos")}`,
                  color: coloresRoles[rol.rol],
                }))}
              />
            </div>
          </section>

          <section className={estilos.estadisticasPanel}>
            <div className={estilos.estadisticasPanelCabecera}>
              <div>
                <h2>Registros por mes</h2>
                <p>
                  Cuentas creadas en los últimos 12 meses ·{" "}
                  {totalRegistrosAnio.toLocaleString("es-BO")} en total
                </p>
              </div>
              <ChartColumn size={20} />
            </div>

            <div className={estilos.estadisticasPanelCuerpo}>
              <GraficoColumnas
                descripcion="Cuentas de usuario creadas por mes"
                unidad="registros"
                datos={estadisticas.registrosPorMes.map((mes) => ({
                  clave: mes.clave,
                  etiqueta: mes.etiqueta,
                  valor: mes.total,
                }))}
              />
            </div>
          </section>
        </div>

        {/* GESTIÓN ACADÉMICA Y PROYECTOS */}
        <section className={estilos.estadisticasSeccion}>
          <div className={estilos.estadisticasTituloSeccion}>
            <h2>Gestión académica y proyectos</h2>
            <p>
              Periodo vigente: {academico.periodoVigente ?? "sin periodo vigente"}
            </p>
          </div>

          <div className={estilos.estadisticasCuadricula}>
            <TarjetaEstadistica
              titulo="Materias activas"
              valor={academico.materiasActivas}
              icono={BookOpen}
              ruta="/administrador/materias"
              color="azul"
            />
            <TarjetaEstadistica
              titulo="Asignaciones en el periodo"
              valor={academico.asignacionesVigentes}
              icono={UsersRound}
              ruta="/administrador/docentes"
              color="verde"
            />
            <TarjetaEstadistica
              titulo="Proyectos registrados"
              valor={academico.totalProyectos}
              icono={FolderKanban}
              ruta="/administrador/reportes/proyectos"
              color="morado"
            />
            <TarjetaEstadistica
              titulo="Avances por revisar"
              valor={academico.avancesPendientes}
              icono={ClipboardCheck}
              ruta="/administrador/reportes/avances?revision=PENDIENTE"
              color="dorado"
            />
          </div>
        </section>

        <div className={estilos.estadisticasColumnas}>
          <section className={estilos.estadisticasPanel}>
            <div className={estilos.estadisticasPanelCabecera}>
              <div>
                <h2>Proyectos por estado</h2>
                <p>Todos los periodos</p>
              </div>
              <FolderKanban size={20} />
            </div>
            <div className={estilos.estadisticasPanelCuerpo}>
              <GraficoBarrasHorizontales
                descripcion="Cantidad de proyectos por estado"
                datos={academico.porEstado.map((dato, indice) => ({
                  ...dato,
                  color: (["azul", "morado", "dorado", "verde", "dorado"] as const)[indice],
                }))}
              />
            </div>
          </section>

          <section className={estilos.estadisticasPanel}>
            <div className={estilos.estadisticasPanelCabecera}>
              <div>
                <h2>Proyectos por materia</h2>
                <p>Periodo {academico.periodoVigente ?? "vigente"}</p>
              </div>
              <BookOpen size={20} />
            </div>
            <div className={estilos.estadisticasPanelCuerpo}>
              <GraficoBarrasHorizontales
                descripcion="Cantidad de proyectos por materia en el periodo vigente"
                datos={academico.porMateria.map((dato) => ({ ...dato, color: "azul" as const }))}
              />
            </div>
          </section>
        </div>

        {/* INDICADORES EN INTEGRACIÓN */}
        <section className={estilos.estadisticasSeccion}>
          <div className={estilos.estadisticasTituloSeccion}>
            <h2>Indicadores en integración</h2>
            <p>
              Se activarán a medida que los demás módulos de SISCloud se
              integren a la base de datos
            </p>
          </div>

          <div className={estilos.estadisticasPendientes}>
            {indicadoresPendientes.map(
              ({ titulo, descripcion, icono: Icono }) => (
                <article
                  key={titulo}
                  className={estilos.estadisticasPendiente}
                >
                  <span className={estilos.estadisticasPendienteIcono}>
                    <Icono size={20} />
                  </span>

                  <div>
                    <strong>{titulo}</strong>
                    <p>{descripcion}</p>
                  </div>

                  <span className={estilos.estadisticasPendienteEstado}>
                    Pendiente
                  </span>
                </article>
              )
            )}
          </div>
        </section>
      </div>
    </EstructuraDashboard>
  );
}

/* ==========================================
   PÁGINA
========================================== */

export default function PaginaEstadisticas() {
  return (
    <Suspense
      fallback={
        <p className={estilos.estadisticasCargando}>
          Cargando estadísticas...
        </p>
      }
    >
      <ContenidoEstadisticas />
    </Suspense>
  );
}
