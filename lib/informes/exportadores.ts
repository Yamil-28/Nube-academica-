
import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import {
  fechaParaArchivo,
  formatearFechaHora,
} from "@/lib/informes/formato";

/* ==========================================
   EXPORTACIÓN DE REPORTES: PDF, EXCEL Y CSV
   Cualquier reporte del sistema se exporta con
   estas funciones: solo debe entregar su tabla
   y sus metadatos.
========================================== */

export type FormatoExportacion = "pdf" | "xlsx" | "csv";

export const FORMATOS_VALIDOS: FormatoExportacion[] = ["pdf", "xlsx", "csv"];

export type TablaExportable = {
  columnas: {
    titulo: string;
    ancho?: number; // en caracteres (Excel)
    alineacion?: "izquierda" | "centro" | "derecha";
  }[];
  filas: (string | number)[][];
};

export type MetadatosReporte = {
  titulo: string;
  nombreArchivo: string; // sin extensión ni fecha, p. ej. "informe-usuarios"
  generadoPor: string;
  generadoEn: Date;
  filtros: { etiqueta: string; valor: string }[];
  resumen: { etiqueta: string; valor: string }[];
  nota?: string;
};

export type ArchivoGenerado = {
  contenido: ArrayBuffer;
  tipoContenido: string;
  nombreArchivo: string;
};

const INSTITUCION = "Escuela Militar de Ingeniería";
const SISTEMA = "SISCloud · Sistema de Gestión de Proyectos Académicos";
const CARRERA = "Ingeniería de Sistemas · Unidad Académica La Paz";

const AZUL_PRIMARIO: [number, number, number] = [7, 59, 112];
const AZUL_FONDO: [number, number, number] = [244, 248, 252];
const GRIS_TEXTO: [number, number, number] = [96, 117, 140];

/* ==========================================
   PDF
========================================== */

async function leerLogo(): Promise<string | null> {
  try {
    const ruta = path.join(process.cwd(), "public", "imagenes", "emi.jpg");
    const datos = await readFile(ruta);
    return `data:image/jpeg;base64,${datos.toString("base64")}`;
  } catch {
    // Si el logo no existe, el PDF se genera sin él
    return null;
  }
}

async function generarPdf(
  tabla: TablaExportable,
  meta: MetadatosReporte
): Promise<ArrayBuffer> {
  const orientacion = tabla.columnas.length > 6 ? "landscape" : "portrait";

  const documento = new jsPDF({
    orientation: orientacion,
    unit: "mm",
    format: "a4",
  });

  const anchoPagina = documento.internal.pageSize.getWidth();
  const altoPagina = documento.internal.pageSize.getHeight();
  const margen = 14;

  documento.setProperties({
    title: meta.titulo,
    author: meta.generadoPor,
    creator: "SISCloud",
  });

  // ENCABEZADO INSTITUCIONAL
  const logo = await leerLogo();
  const inicioTexto = logo ? margen + 20 : margen;

  if (logo) {
    documento.addImage(logo, "JPEG", margen, 10, 16, 16);
  }

  documento.setTextColor(...AZUL_PRIMARIO);
  documento.setFont("helvetica", "bold");
  documento.setFontSize(11);
  documento.text(INSTITUCION, inicioTexto, 15);

  documento.setFont("helvetica", "normal");
  documento.setFontSize(8);
  documento.setTextColor(96, 117, 140);
  documento.text(SISTEMA, inicioTexto, 20);
  documento.text(CARRERA, inicioTexto, 24);

  documento.text(
    `Generado: ${formatearFechaHora(meta.generadoEn)}`,
    anchoPagina - margen,
    15,
    { align: "right" }
  );

  documento.setDrawColor(213, 165, 0);
  documento.setLineWidth(0.8);
  documento.line(margen, 30, anchoPagina - margen, 30);

  // TÍTULO
  documento.setTextColor(23, 43, 70);
  documento.setFont("helvetica", "bold");
  documento.setFontSize(15);
  documento.text(meta.titulo, margen, 40);

  // FILTROS Y RESUMEN
  let y = 48;
  documento.setFontSize(9);

  const bloques = [
    { titulo: "Filtros aplicados", lineas: meta.filtros },
    { titulo: "Resumen", lineas: meta.resumen },
  ];

  for (const bloque of bloques) {
    documento.setFont("helvetica", "bold");
    documento.setTextColor(7, 90, 165);
    documento.text(bloque.titulo, margen, y);
    y += 5;

    documento.setFont("helvetica", "normal");
    documento.setTextColor(23, 43, 70);

    const texto = bloque.lineas
      .map((linea) => `${linea.etiqueta}: ${linea.valor}`)
      .join("   ·   ");

    const lineas = documento.splitTextToSize(
      texto,
      anchoPagina - margen * 2
    ) as string[];

    documento.text(lineas, margen, y);
    y += lineas.length * 4.5 + 4;
  }

  if (meta.nota) {
    documento.setFont("helvetica", "italic");
    documento.setTextColor(138, 98, 0);
    const lineas = documento.splitTextToSize(
      meta.nota,
      anchoPagina - margen * 2
    ) as string[];
    documento.text(lineas, margen, y);
    y += lineas.length * 4.5 + 3;
  }

  // TABLA
  const alineacion = { izquierda: "left", centro: "center", derecha: "right" } as const;

  autoTable(documento, {
    startY: y,
    margin: { left: margen, right: margen, bottom: 20 },
    head: [tabla.columnas.map((columna) => columna.titulo)],
    body:
      tabla.filas.length > 0
        ? tabla.filas.map((fila) => fila.map(String))
        : [[
            {
              content: "No se encontraron registros con los filtros seleccionados.",
              colSpan: tabla.columnas.length,
              styles: { halign: "center", textColor: GRIS_TEXTO },
            },
          ]],
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: 2.5,
      textColor: [23, 43, 70],
      lineColor: [220, 230, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: AZUL_PRIMARIO,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: AZUL_FONDO,
    },
    columnStyles: Object.fromEntries(
      tabla.columnas.map((columna, indice) => [
        indice,
        { halign: alineacion[columna.alineacion ?? "izquierda"] },
      ])
    ),
  });

  // PIE DE PÁGINA EN TODAS LAS PÁGINAS
  const totalPaginas = documento.getNumberOfPages();

  for (let pagina = 1; pagina <= totalPaginas; pagina++) {
    documento.setPage(pagina);
    documento.setDrawColor(220, 230, 240);
    documento.setLineWidth(0.2);
    documento.line(margen, altoPagina - 13, anchoPagina - margen, altoPagina - 13);

    documento.setFont("helvetica", "normal");
    documento.setFontSize(7.5);
    documento.setTextColor(96, 117, 140);
    documento.text(
      `Generado por ${meta.generadoPor} · SISCloud`,
      margen,
      altoPagina - 8
    );
    documento.text(
      `Página ${pagina} de ${totalPaginas}`,
      anchoPagina - margen,
      altoPagina - 8,
      { align: "right" }
    );
  }

  return documento.output("arraybuffer");
}

/* ==========================================
   EXCEL (.xlsx)
========================================== */

async function generarExcel(
  tabla: TablaExportable,
  meta: MetadatosReporte
): Promise<ArrayBuffer> {
  const libro = new ExcelJS.Workbook();
  libro.creator = "SISCloud";
  libro.created = meta.generadoEn;

  const hoja = libro.addWorksheet("Reporte");
  const totalColumnas = Math.max(tabla.columnas.length, 1);

  hoja.columns = tabla.columnas.map((columna) => ({
    width: columna.ancho ?? 18,
  }));

  // Filas de encabezado que ocupan todo el ancho de la tabla
  function agregarFilaCompleta(
    texto: string,
    estilo: Partial<ExcelJS.Font> = {}
  ) {
    const fila = hoja.addRow([texto]);
    if (totalColumnas > 1) {
      hoja.mergeCells(fila.number, 1, fila.number, totalColumnas);
    }
    fila.getCell(1).font = { name: "Arial", size: 10, ...estilo };
    return fila;
  }

  agregarFilaCompleta(meta.titulo, {
    size: 15,
    bold: true,
    color: { argb: "FF073B70" },
  });
  agregarFilaCompleta(`${INSTITUCION} · ${CARRERA}`, {
    color: { argb: "FF60758C" },
  });
  agregarFilaCompleta(
    `Generado el ${formatearFechaHora(meta.generadoEn)} por ${meta.generadoPor}`,
    { color: { argb: "FF60758C" } }
  );
  hoja.addRow([]);

  agregarFilaCompleta("Filtros aplicados", {
    bold: true,
    color: { argb: "FF075AA5" },
  });
  for (const filtro of meta.filtros) {
    agregarFilaCompleta(`${filtro.etiqueta}: ${filtro.valor}`);
  }

  agregarFilaCompleta("Resumen", { bold: true, color: { argb: "FF075AA5" } });
  for (const dato of meta.resumen) {
    agregarFilaCompleta(`${dato.etiqueta}: ${dato.valor}`);
  }

  if (meta.nota) {
    agregarFilaCompleta(meta.nota, {
      italic: true,
      color: { argb: "FF8A6200" },
    });
  }

  hoja.addRow([]);

  // Encabezado de la tabla
  const filaTitulos = hoja.addRow(tabla.columnas.map((c) => c.titulo));
  filaTitulos.eachCell((celda) => {
    celda.font = { name: "Arial", bold: true, color: { argb: "FFFFFFFF" } };
    celda.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF073B70" },
    };
    celda.alignment = { vertical: "middle", horizontal: "center" };
  });
  filaTitulos.height = 20;

  // Datos
  const alineacion = { izquierda: "left", centro: "center", derecha: "right" } as const;

  tabla.filas.forEach((datos, indice) => {
    const fila = hoja.addRow(datos);

    fila.eachCell((celda, numeroColumna) => {
      const columna = tabla.columnas[numeroColumna - 1];
      celda.font = { name: "Arial", size: 10 };
      celda.alignment = {
        horizontal: alineacion[columna?.alineacion ?? "izquierda"],
      };
      celda.border = {
        bottom: { style: "thin", color: { argb: "FFDCE6F0" } },
      };

      if (indice % 2 === 1) {
        celda.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF4F8FC" },
        };
      }
    });
  });

  // Filtros de Excel y encabezado fijo al desplazarse
  if (tabla.filas.length > 0) {
    hoja.autoFilter = {
      from: { row: filaTitulos.number, column: 1 },
      to: { row: filaTitulos.number, column: totalColumnas },
    };
  }

  hoja.views = [{ state: "frozen", ySplit: filaTitulos.number }];

  // Se copia a un ArrayBuffer propio (writeBuffer devuelve un Buffer de Node)
  const contenido = new Uint8Array(await libro.xlsx.writeBuffer());
  return contenido.slice().buffer;
}

/* ==========================================
   CSV
========================================== */

function escaparCsv(valor: string | number): string {
  let texto = String(valor);

  // Evita que Excel interprete el contenido como una fórmula
  if (/^[=+\-@\t\r]/.test(texto)) {
    texto = `'${texto}`;
  }

  return /[";\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

function generarCsv(tabla: TablaExportable): ArrayBuffer {
  // Punto y coma: separador que Excel espera en configuración regional en español
  const lineas = [
    tabla.columnas.map((columna) => escaparCsv(columna.titulo)).join(";"),
    ...tabla.filas.map((fila) => fila.map(escaparCsv).join(";")),
  ];

  // BOM UTF-8 para que Excel muestre bien las tildes y la ñ
  return new TextEncoder().encode(`\uFEFF${lineas.join("\r\n")}`).buffer;
}

/* ==========================================
   PUNTO DE ENTRADA
========================================== */

export async function exportarReporte(
  formato: FormatoExportacion,
  tabla: TablaExportable,
  meta: MetadatosReporte
): Promise<ArchivoGenerado> {
  const nombreBase = `${meta.nombreArchivo}-${fechaParaArchivo(meta.generadoEn)}`;

  switch (formato) {
    case "pdf":
      return {
        contenido: await generarPdf(tabla, meta),
        tipoContenido: "application/pdf",
        nombreArchivo: `${nombreBase}.pdf`,
      };

    case "xlsx":
      return {
        contenido: await generarExcel(tabla, meta),
        tipoContenido:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        nombreArchivo: `${nombreBase}.xlsx`,
      };

    case "csv":
      return {
        contenido: generarCsv(tabla),
        tipoContenido: "text/csv; charset=utf-8",
        nombreArchivo: `${nombreBase}.csv`,
      };
  }
}
