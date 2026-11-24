import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";

import { Suspense } from "react";
import { FileDown, FileSpreadsheet, FileText, Users } from "lucide-react";

import { protegerRuta } from "@/lib/protegerRuta";
import {
  describirFiltrosUsuarios,
  filtrosAParametros,
  leerFiltrosUsuarios,
} from "@/lib/informes/filtrosUsuarios";
import {
  COLUMNAS_USUARIOS,
  obtenerVistaPreviaUsuarios,
} from "@/lib/informes/reporteUsuarios";
import { formatearFechaHora, pluralizar } from "@/lib/informes/formato";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import EncabezadoInforme from "@/componentes/informes/EncabezadoInforme";
import FiltrosUsuarios from "@/componentes/informes/FiltrosUsuarios";
import TablaReporte from "@/componentes/informes/TablaReporte";
import Paginacion from "@/componentes/informes/Paginacion";

import estilos from "@/componentes/informes/PaginaInforme.module.css";

const RUTA_PAGINA = "/administrador/reportes/usuarios";
const RUTA_EXPORTAR = "/api/reportes/usuarios";

type ParametrosBusqueda = Promise<
  Record<string, string | string[] | undefined>
>;

async function ContenidoInformeUsuarios({
  searchParams,
}: {
  searchParams: ParametrosBusqueda;
}) {
  // 1. Solo administradores
  const usuario = await protegerRuta("ADMINISTRADOR");

  // 2. Filtros validados desde la URL
  const { filtros, errores } = leerFiltrosUsuarios(await searchParams);

  // 3. Datos de la vista previa
  const vista = await obtenerVistaPreviaUsuarios(filtros);
  const generadoEn = new Date();

  const enlaceExportar = (formato: string) =>
    `${RUTA_EXPORTAR}?${filtrosAParametros(filtros, { formato })}`;

  const enlacePagina = (pagina: number) => {
    const parametros = filtrosAParametros(filtros, {
      pagina: String(pagina),
    });
    return `${RUTA_PAGINA}?${parametros}`;
  };

  const sinResultados = vista.resumen.total === 0;
  const claseDeshabilitado = sinResultados
    ? ` ${estilos.botonExportarDeshabilitado}`
    : "";

  return (
    <EstructuraDashboard usuario={usuario.usuario} rol={usuario.rol}>
      <div className={estilos.contenedor}>
        <EncabezadoInforme
          etiqueta="REPORTES GENERALES"
          titulo="Informe de usuarios"
          descripcion="Cuentas registradas en SISCloud por rol, estado y fecha de registro."
          insignia={{
            texto: `Consulta: ${formatearFechaHora(generadoEn)}`,
            icono: Users,
          }}
        />

        {errores.length > 0 && (
          <p className={estilos.error} role="alert">
            {errores.join(" ")}
          </p>
        )}

        {/* FILTROS */}
        <section className={estilos.panel}>
          <div className={estilos.panelCabecera}>
            <div>
              <h2>Filtros</h2>
              <p>Define qué usuarios incluir en el informe</p>
            </div>
          </div>

          <div className={estilos.panelCuerpo}>
            <FiltrosUsuarios filtros={filtros} rutaBase={RUTA_PAGINA} />
          </div>
        </section>

        {/* RESULTADO */}
        <section className={estilos.panel}>
          <div className={estilos.panelCabecera}>
            <div>
              <h2>Vista previa</h2>
              <p>
                {describirFiltrosUsuarios(filtros)
                  .map((filtro) => filtro.valor)
                  .join(" · ")}
              </p>
            </div>

            <div className={estilos.exportar}>
              <a
                href={enlaceExportar("pdf")}
                className={`${estilos.botonExportar} ${estilos.botonExportarPrincipal}${claseDeshabilitado}`}
                aria-disabled={sinResultados}
                download
              >
                <FileText size={16} /> PDF
              </a>

              <a
                href={enlaceExportar("xlsx")}
                className={`${estilos.botonExportar}${claseDeshabilitado}`}
                aria-disabled={sinResultados}
                download
              >
                <FileSpreadsheet size={16} /> Excel
              </a>

              <a
                href={enlaceExportar("csv")}
                className={`${estilos.botonExportar}${claseDeshabilitado}`}
                aria-disabled={sinResultados}
                download
              >
                <FileDown size={16} /> CSV
              </a>
            </div>
          </div>

          <div className={estilos.panelCuerpo}>
            <div className={estilos.resumen}>
              <span>
                {pluralizar(vista.resumen.total, "usuario", "usuarios")}
              </span>
              <span>
                {pluralizar(vista.resumen.activos, "activo", "activos")}
              </span>
              <span>
                {pluralizar(vista.resumen.inactivos, "inactivo", "inactivos")}
              </span>
            </div>
          </div>

          <TablaReporte
            columnas={COLUMNAS_USUARIOS}
            filas={vista.filas}
            descripcion="Usuarios que cumplen los filtros seleccionados"
          />

          <Paginacion
            paginaActual={vista.pagina}
            totalPaginas={vista.totalPaginas}
            totalRegistros={vista.resumen.total}
            crearEnlace={enlacePagina}
          />
        </section>
      </div>
    </EstructuraDashboard>
  );
}

export default function PaginaInformeUsuarios({
  searchParams,
}: {
  searchParams: ParametrosBusqueda;
}) {
  return (
    <Suspense
      fallback={<CargandoDashboard />}
    >
      <ContenidoInformeUsuarios searchParams={searchParams} />
    </Suspense>
  );
}
