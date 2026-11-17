
import { NextResponse, type NextRequest } from "next/server";

import { obtenerUsuarioAutorizado } from "@/lib/informes/autorizacion";
import {
  describirFiltrosUsuarios,
  leerFiltrosUsuarios,
} from "@/lib/informes/filtrosUsuarios";
import {
  LIMITE_EXPORTACION,
  obtenerUsuariosParaExportar,
} from "@/lib/informes/reporteUsuarios";
import {
  exportarReporte,
  FORMATOS_VALIDOS,
  type FormatoExportacion,
} from "@/lib/informes/exportadores";
import { pluralizar } from "@/lib/informes/formato";
import { registrarReporte } from "@/lib/informes/historial";

/* ==========================================
   EXPORTAR INFORME DE USUARIOS
   GET /api/reportes/usuarios?formato=pdf|xlsx|csv&rol=&estado=...
   Solo administradores (Tabla 6, Módulo 7).
========================================== */

export async function GET(solicitud: NextRequest) {
  // 1. Verificar sesión y rol en el servidor
  const usuario = await obtenerUsuarioAutorizado(["ADMINISTRADOR"]);

  if (!usuario) {
    return NextResponse.json(
      { mensaje: "No tienes permiso para generar este reporte." },
      { status: 403 }
    );
  }

  // 2. Validar formato y filtros
  const parametros = Object.fromEntries(solicitud.nextUrl.searchParams);
  const formato = parametros.formato as FormatoExportacion;

  if (!FORMATOS_VALIDOS.includes(formato)) {
    return NextResponse.json(
      { mensaje: "Formato no válido. Usa pdf, xlsx o csv." },
      { status: 400 }
    );
  }

  const { filtros } = leerFiltrosUsuarios(parametros);

  try {
    // 3. Consultar los datos
    const { resumen, truncado, tabla } =
      await obtenerUsuariosParaExportar(filtros);

    // 4. Generar el archivo
    const archivo = await exportarReporte(formato, tabla, {
      titulo: "Informe de usuarios",
      nombreArchivo: "informe-usuarios",
      generadoPor: usuario.nombre,
      generadoEn: new Date(),
      filtros: describirFiltrosUsuarios(filtros),
      resumen: [
        {
          etiqueta: "Total",
          valor: pluralizar(resumen.total, "usuario", "usuarios"),
        },
        {
          etiqueta: "Activos",
          valor: resumen.activos.toLocaleString("es-BO"),
        },
        {
          etiqueta: "Inactivos",
          valor: resumen.inactivos.toLocaleString("es-BO"),
        },
      ],
      nota: truncado
        ? `El resultado supera ${LIMITE_EXPORTACION.toLocaleString(
            "es-BO"
          )} registros: solo se incluyen los primeros. Usa filtros para acotarlo.`
        : undefined,
    });

    await registrarReporte({
      idUsuario: usuario.id,
      tipoReporte: "usuarios",
      formato,
    });

    return new NextResponse(archivo.contenido, {
      status: 200,
      headers: {
        "Content-Type": archivo.tipoContenido,
        "Content-Disposition": `attachment; filename="${archivo.nombreArchivo}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error al generar el informe de usuarios:", error);

    return NextResponse.json(
      { mensaje: "No se pudo generar el reporte. Inténtalo nuevamente." },
      { status: 500 }
    );
  }
}
