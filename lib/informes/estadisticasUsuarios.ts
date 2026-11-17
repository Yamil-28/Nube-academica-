
import "server-only";

import { prisma } from "@/lib/prisma";
import type { RolUsuario } from "@/lib/sesion";
import { ZONA_HORARIA } from "@/lib/informes/formato";

/* ==========================================
   CONFIGURACIÓN
========================================== */

const MESES_HISTORIAL = 12;
const DIAS_USUARIOS_NUEVOS = 30;

const ROLES: RolUsuario[] = ["ADMINISTRADOR", "DOCENTE", "ESTUDIANTE"];

export const NOMBRES_ROLES: Record<RolUsuario, string> = {
  ADMINISTRADOR: "Administradores",
  DOCENTE: "Docentes",
  ESTUDIANTE: "Estudiantes",
};

/* ==========================================
   TIPOS
========================================== */

export type ResumenRol = {
  rol: RolUsuario;
  nombre: string;
  total: number;
  activos: number;
  inactivos: number;
};

export type RegistroMensual = {
  clave: string; // "2026-11"
  etiqueta: string; // "nov 26"
  total: number;
};

export type EstadisticasUsuarios = {
  total: number;
  activos: number;
  inactivos: number;
  nuevosRecientes: number;
  diasUsuariosNuevos: number;
  porRol: ResumenRol[];
  registrosPorMes: RegistroMensual[];
  generadoEn: Date;
};

/* ==========================================
   UTILIDADES DE FECHA
========================================== */

// Devuelve [año, mes 1-12] de una fecha en la hora de Bolivia.
function obtenerAnioMesLocal(fecha: Date): [number, number] {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_HORARIA,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(fecha);

  const anio = Number(partes.find((p) => p.type === "year")?.value);
  const mes = Number(partes.find((p) => p.type === "month")?.value);

  return [anio, mes];
}

// Lista de los últimos N meses, del más antiguo al actual.
function generarUltimosMeses(ahora: Date, cantidad: number) {
  const [anioActual, mesActual] = obtenerAnioMesLocal(ahora);

  const formatoEtiqueta = new Intl.DateTimeFormat("es-BO", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  });

  return Array.from({ length: cantidad }, (_, indice) => {
    const desplazamiento = cantidad - 1 - indice;
    const fecha = new Date(
      Date.UTC(anioActual, mesActual - 1 - desplazamiento, 15)
    );

    const anio = fecha.getUTCFullYear();
    const mes = fecha.getUTCMonth() + 1;

    return {
      clave: `${anio}-${String(mes).padStart(2, "0")}`,
      etiqueta: formatoEtiqueta.format(fecha).replace(".", ""),
      inicioUtc: new Date(Date.UTC(anio, mes - 1, 1)),
    };
  });
}

/* ==========================================
   CONSULTA PRINCIPAL
========================================== */

export async function obtenerEstadisticasUsuarios(): Promise<EstadisticasUsuarios> {
  const ahora = new Date();

  const limiteNuevos = new Date(
    ahora.getTime() - DIAS_USUARIOS_NUEVOS * 24 * 60 * 60 * 1000
  );

  const meses = generarUltimosMeses(ahora, MESES_HISTORIAL);

  // Se toma desde las 00:00 UTC del primer mes. Las pocas horas que
  // caen en el mes anterior (hora de Bolivia) se descartan al agrupar.
  const limiteHistorial = meses[0].inicioUtc;

  // Las tres consultas son independientes: se ejecutan en paralelo
  // y los conteos se resuelven en PostgreSQL, no en JavaScript.
  const [conteosRolEstado, nuevosRecientes, filasMensuales] =
    await Promise.all([
      prisma.usuario.groupBy({
        by: ["rol", "activo"],
        _count: { _all: true },
      }),

      prisma.usuario.count({
        where: { creadoEn: { gte: limiteNuevos } },
      }),

      prisma.$queryRaw<{ mes: string; total: number }[]>`
        SELECT
          to_char(
            ("creadoEn" AT TIME ZONE 'UTC') AT TIME ZONE 'America/La_Paz',
            'YYYY-MM'
          ) AS mes,
          COUNT(*)::int AS total
        FROM "usuarios"
        WHERE "creadoEn" >= ${limiteHistorial}
        GROUP BY 1
        ORDER BY 1
      `,
    ]);

  // Resumen por rol (incluye roles sin usuarios, con 0)
  const porRol: ResumenRol[] = ROLES.map((rol) => {
    const activos =
      conteosRolEstado.find((c) => c.rol === rol && c.activo)?._count
        ._all ?? 0;

    const inactivos =
      conteosRolEstado.find((c) => c.rol === rol && !c.activo)?._count
        ._all ?? 0;

    return {
      rol,
      nombre: NOMBRES_ROLES[rol],
      total: activos + inactivos,
      activos,
      inactivos,
    };
  });

  const activos = porRol.reduce((suma, r) => suma + r.activos, 0);
  const inactivos = porRol.reduce((suma, r) => suma + r.inactivos, 0);

  // Registros por mes (incluye meses sin registros, con 0)
  const totalesPorMes = new Map(
    filasMensuales.map((fila) => [fila.mes, Number(fila.total)])
  );

  const registrosPorMes: RegistroMensual[] = meses.map((mes) => ({
    clave: mes.clave,
    etiqueta: mes.etiqueta,
    total: totalesPorMes.get(mes.clave) ?? 0,
  }));

  return {
    total: activos + inactivos,
    activos,
    inactivos,
    nuevosRecientes,
    diasUsuariosNuevos: DIAS_USUARIOS_NUEVOS,
    porRol,
    registrosPorMes,
    generadoEn: ahora,
  };
}
