
import { notFound } from "next/navigation";
import { FileDown, FileSpreadsheet, FileText } from "lucide-react";

import { protegerRuta } from "@/lib/protegerRuta";
import type { RolUsuario } from "@/lib/sesion";
import { obtenerReporte } from "@/lib/informes/reportesDatos";
import {
  describirFiltros,
  leerFiltros,
  LIMITE_VISTA_PREVIA,
  valoresAParametros,
} from "@/lib/informes/motor";
import { formatearFechaHora } from "@/lib/informes/formato";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import EncabezadoInforme from "@/componentes/informes/EncabezadoInforme";
import FiltrosReporte from "@/componentes/informes/FiltrosReporte";
import TablaReporte from "@/componentes/informes/TablaReporte";

import estilos from "@/componentes/informes/PaginaInforme.module.css";

const RUTAS_ROL: Record<RolUsuario, string> = {
  ADMINISTRADOR: "/administrador",
  DOCENTE: "/docente",
  ESTUDIANTE: "/estudiante",
};

type Propiedades = {
  rol: RolUsuario;
  parametros: Promise<{ tipo: string }>;
  busqueda: Promise<Record<string, string | string[] | undefined>>;
};

// Página común a todos los reportes: filtros, vista previa y exportación
export default async function VistaReporte({ rol, parametros, busqueda }: Propiedades) {
  // 1. Solo el rol dueño de esta sección (verificado en Neon)
  const usuario = await protegerRuta(rol);
  const { tipo } = await parametros;

  // 2. El reporte debe existir y pertenecer a este rol (RF15)
  const definicion = obtenerReporte(tipo, rol);
  if (!definicion) notFound();

  const rutaInicio = RUTAS_ROL[rol];
  const rutaReportes = `${rutaInicio}/reportes`;
  const rutaPagina = `${rutaReportes}/${definicion.id}`;

  // 3. Filtros validados y datos
  const { valores, opciones } = await leerFiltros(definicion, await busqueda, usuario);

  const { tabla, resumen } = await definicion.generar({
    usuario,
    filtros: valores,
    limite: LIMITE_VISTA_PREVIA,
  });

  const generadoEn = new Date();
  const sinResultados = tabla.filas.length === 0;

  const enlaceExportar = (formato: string) =>
    `/api/reportes/${definicion.id}?${valoresAParametros(valores, { formato })}`;

  const claseDeshabilitado = sinResultados ? ` ${estilos.botonExportarDeshabilitado}` : "";

  return (
    <EstructuraDashboard usuario={usuario.usuario} rol={usuario.rol}>
      <div className={estilos.contenedor}>
        <EncabezadoInforme
          etiqueta="INFORMES Y REPORTES"
          titulo={definicion.titulo}
          descripcion={definicion.descripcion}
          insignia={{ texto: `Consulta: ${formatearFechaHora(generadoEn)}`, icono: FileText }}
        />

        {/* FILTROS */}
        <section className={estilos.panel}>
          <div className={estilos.panelCabecera}>
            <div>
              <h2>Filtros</h2>
              <p>Define qué información incluir en el reporte</p>
            </div>
          </div>
          <div className={estilos.panelCuerpo}>
            <FiltrosReporte
              filtros={definicion.filtros.map(({ clave, etiqueta, textoTodos }) => ({
                clave,
                etiqueta,
                textoTodos,
              }))}
              opciones={opciones}
              valores={valores}
              rutaBase={rutaPagina}
            />
          </div>
        </section>

        {/* RESULTADO */}
        <section className={estilos.panel}>
          <div className={estilos.panelCabecera}>
            <div>
              <h2>Vista previa</h2>
              <p>
                {describirFiltros(definicion, valores, opciones)
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
              {resumen.map((dato) => (
                <span key={dato.etiqueta}>
                  {dato.etiqueta}: {dato.valor}
                </span>
              ))}
            </div>
          </div>

          <TablaReporte
            columnas={tabla.columnas}
            filas={tabla.filas}
            descripcion={definicion.titulo}
          />

          {tabla.filas.length >= LIMITE_VISTA_PREVIA && (
            <p className={estilos.aviso} style={{ margin: 20 }}>
              La vista previa muestra los primeros {LIMITE_VISTA_PREVIA} registros. La
              exportación incluye el resultado completo.
            </p>
          )}
        </section>
      </div>
    </EstructuraDashboard>
  );
}
