
import { NextResponse, type NextRequest } from "next/server";

import { obtenerUsuarioAutorizado } from "@/lib/informes/autorizacion";
import { obtenerReporte } from "@/lib/informes/reportesDatos";
import {
  describirFiltros,
  leerFiltros,
  LIMITE_EXPORTACION,
} from "@/lib/informes/motor";
import {
  exportarReporte,
  FORMATOS_VALIDOS,
  type FormatoExportacion,
} from "@/lib/informes/exportadores";
import { registrarReporte } from "@/lib/informes/historial";

/* ==========================================
   EXPORTAR CUALQUIER REPORTE
   GET /api/reportes/[tipo]?formato=pdf|xlsx|csv&...
   Cada reporte solo lo puede generar el rol al que
   pertenece (RF15), verificado en el servidor.
========================================== */

export async function GET(
  solicitud: NextRequest,
  { params }: { params: Promise<{ tipo: string }> }
) {
  const { tipo } = await params;

  const usuario = await obtenerUsuarioAutorizado([
    "ADMINISTRADOR",
    "DOCENTE",
    "ESTUDIANTE",
  ]);

  const definicion = usuario ? obtenerReporte(tipo, usuario.rol) : null;

  if (!usuario || !definicion) {
    return NextResponse.json(
      { mensaje: "No tienes permiso para generar este reporte." },
      { status: 403 }
    );
  }

  const parametros = Object.fromEntries(solicitud.nextUrl.searchParams);
  const formato = parametros.formato as FormatoExportacion;

  if (!FORMATOS_VALIDOS.includes(formato)) {
    return NextResponse.json(
      { mensaje: "Formato no válido. Usa pdf, xlsx o csv." },
      { status: 400 }
    );
  }

  try {
    const { valores, opciones } = await leerFiltros(definicion, parametros, usuario);

    const { tabla, resumen } = await definicion.generar({
      usuario,
      filtros: valores,
      limite: LIMITE_EXPORTACION,
    });

    const archivo = await exportarReporte(formato, tabla, {
      titulo: definicion.titulo,
      nombreArchivo: definicion.nombreArchivo,
      generadoPor: usuario.nombre,
      generadoEn: new Date(),
      filtros: describirFiltros(definicion, valores, opciones),
      resumen,
      nota:
        tabla.filas.length >= LIMITE_EXPORTACION
          ? `Se muestran los primeros ${LIMITE_EXPORTACION.toLocaleString("es-BO")} registros. Usa filtros para acotar el resultado.`
          : undefined,
    });

    await registrarReporte({
      idUsuario: usuario.id,
      tipoReporte: definicion.id,
      formato,
    });

    return new NextResponse(archivo.contenido, {
      headers: {
        "Content-Type": archivo.tipoContenido,
        "Content-Disposition": `attachment; filename="${archivo.nombreArchivo}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(`Error al generar el reporte "${tipo}":`, error);

    return NextResponse.json(
      { mensaje: "No se pudo generar el reporte. Inténtalo nuevamente." },
      { status: 500 }
    );
  }
}
