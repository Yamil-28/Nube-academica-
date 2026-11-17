
import "server-only";

import { prisma } from "@/lib/prisma";
import type { RolUsuario } from "@/lib/sesion";
import {
  construirCondicionUsuarios,
  type FiltrosUsuarios,
} from "@/lib/informes/filtrosUsuarios";
import { formatearFecha } from "@/lib/informes/formato";
import type { TablaExportable } from "@/lib/informes/exportadores";

/* ==========================================
   INFORME DE USUARIOS (HU-18, RF14)
========================================== */

export const FILAS_POR_PAGINA = 20;
export const LIMITE_EXPORTACION = 5000;

const NOMBRE_ROL: Record<RolUsuario, string> = {
  ADMINISTRADOR: "Administrador",
  DOCENTE: "Docente",
  ESTUDIANTE: "Estudiante",
};

const CAMPOS = {
  id: true,
  nombre: true,
  usuario: true,
  rol: true,
  activo: true,
  creadoEn: true,
} as const;

type FilaUsuario = {
  id: number;
  nombre: string;
  usuario: string;
  rol: RolUsuario;
  activo: boolean;
  creadoEn: Date;
};

export const COLUMNAS_USUARIOS: TablaExportable["columnas"] = [
  { titulo: "N°", ancho: 6, alineacion: "centro" },
  { titulo: "Nombre", ancho: 32 },
  { titulo: "Usuario", ancho: 20 },
  { titulo: "Rol", ancho: 16 },
  { titulo: "Estado", ancho: 12, alineacion: "centro" },
  { titulo: "Fecha de registro", ancho: 18, alineacion: "centro" },
];

function convertirFilas(
  usuarios: FilaUsuario[],
  numeroInicial: number
): (string | number)[][] {
  return usuarios.map((usuario, indice) => [
    numeroInicial + indice,
    usuario.nombre,
    `@${usuario.usuario}`,
    NOMBRE_ROL[usuario.rol],
    usuario.activo ? "Activo" : "Inactivo",
    formatearFecha(usuario.creadoEn),
  ]);
}

// Totales del resultado filtrado (no solo de la página visible)
async function obtenerResumen(filtros: FiltrosUsuarios) {
  const conteos = await prisma.usuario.groupBy({
    by: ["activo"],
    where: construirCondicionUsuarios(filtros),
    _count: { _all: true },
  });

  const activos = conteos.find((c) => c.activo)?._count._all ?? 0;
  const inactivos = conteos.find((c) => !c.activo)?._count._all ?? 0;

  return { total: activos + inactivos, activos, inactivos };
}

/* ==========================================
   VISTA PREVIA PAGINADA
========================================== */

export async function obtenerVistaPreviaUsuarios(filtros: FiltrosUsuarios) {
  const resumen = await obtenerResumen(filtros);

  const totalPaginas = Math.max(
    1,
    Math.ceil(resumen.total / FILAS_POR_PAGINA)
  );

  // Si la página pedida no existe, se muestra la última
  const pagina = Math.min(filtros.pagina, totalPaginas);
  const desplazamiento = (pagina - 1) * FILAS_POR_PAGINA;

  const usuarios = await prisma.usuario.findMany({
    where: construirCondicionUsuarios(filtros),
    orderBy: [{ nombre: "asc" }, { id: "asc" }],
    skip: desplazamiento,
    take: FILAS_POR_PAGINA,
    select: CAMPOS,
  });

  return {
    resumen,
    pagina,
    totalPaginas,
    filas: convertirFilas(usuarios, desplazamiento + 1),
  };
}

/* ==========================================
   DATOS COMPLETOS PARA EXPORTAR
========================================== */

export async function obtenerUsuariosParaExportar(filtros: FiltrosUsuarios) {
  const [resumen, usuarios] = await Promise.all([
    obtenerResumen(filtros),
    prisma.usuario.findMany({
      where: construirCondicionUsuarios(filtros),
      orderBy: [{ nombre: "asc" }, { id: "asc" }],
      take: LIMITE_EXPORTACION,
      select: CAMPOS,
    }),
  ]);

  return {
    resumen,
    truncado: resumen.total > LIMITE_EXPORTACION,
    tabla: {
      columnas: COLUMNAS_USUARIOS,
      filas: convertirFilas(usuarios, 1),
    } satisfies TablaExportable,
  };
}
