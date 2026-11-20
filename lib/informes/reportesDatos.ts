import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import { etiquetaMateria, nombrePeriodo } from "@/lib/academico/tipos";
import { formatearFecha, pluralizar } from "@/lib/informes/formato";
import type { RolUsuario } from "@/lib/sesion";
import {
  idFiltro,
  type DefinicionReporteDatos,
  type FiltroReporte,
  type OpcionFiltro,
} from "@/lib/informes/motor";

/* ==========================================
   REPORTES DE GESTIÓN ACADÉMICA Y PROYECTOS
   Documento: HU-11, HU-17, HU-18, RF14, RF15
   y Tabla 6 (Módulo 7).
========================================== */

/* ==========================================
   TEXTOS DE LOS ESTADOS
========================================== */

const ESTADOS_PROYECTO: OpcionFiltro[] = [
  { valor: "REGISTRADO", texto: "Registrado" },
  { valor: "EN_DESARROLLO", texto: "En desarrollo" },
  { valor: "EN_REVISION", texto: "En revisión" },
  { valor: "FINALIZADO", texto: "Finalizado" },
];

const ESTADOS_REVISION: OpcionFiltro[] = [
  { valor: "PENDIENTE", texto: "Pendiente" },
  { valor: "APROBADO", texto: "Aprobado" },
  { valor: "OBSERVADO", texto: "Observado" },
];

function texto(lista: OpcionFiltro[], valor: string) {
  return lista.find((opcion) => opcion.valor === valor)?.texto ?? valor;
}

/* ==========================================
   FILTROS REUTILIZABLES
========================================== */

const filtroPeriodo: FiltroReporte = {
  clave: "periodo",
  etiqueta: "Periodo",
  textoTodos: "Todos los periodos",
  opciones: async () =>
    (
      await prisma.periodoAcademico.findMany({
        orderBy: [{ gestion: "desc" }, { semestre: "desc" }],
      })
    ).map((p) => ({
      valor: String(p.id),
      texto: `${nombrePeriodo(p)}${p.vigente ? " (vigente)" : ""}`,
    })),
};

const filtroMateria: FiltroReporte = {
  clave: "materia",
  etiqueta: "Materia",
  textoTodos: "Todas las materias",
  opciones: async () =>
    (await prisma.materia.findMany({ orderBy: { nombre: "asc" } })).map((m) => ({
      valor: String(m.id),
      texto: etiquetaMateria(m),
    })),
};

const filtroDocente: FiltroReporte = {
  clave: "docente",
  etiqueta: "Docente",
  textoTodos: "Todos los docentes",
  opciones: async () =>
    (
      await prisma.usuario.findMany({
        where: { rol: "DOCENTE" },
        orderBy: { nombre: "asc" },
      })
    ).map((d) => ({ valor: String(d.id), texto: d.nombre })),
};

const filtroEstadoProyecto: FiltroReporte = {
  clave: "estado",
  etiqueta: "Estado",
  textoTodos: "Todos los estados",
  opciones: () => ESTADOS_PROYECTO,
};

const filtroRevision: FiltroReporte = {
  clave: "revision",
  etiqueta: "Revisión",
  textoTodos: "Todas las revisiones",
  opciones: () => ESTADOS_REVISION,
};

/* ==========================================
   PROYECTOS (consulta común)
========================================== */

const incluirProyecto = {
  materia: true,
  periodo: true,
  docente: { select: { nombre: true } },
  equipo: { include: { miembros: { include: { usuario: { select: { id: true, nombre: true } } } } } },
  hitos: { select: { estado: true } },
} satisfies Prisma.ProyectoInclude;

type ProyectoCompleto = Prisma.ProyectoGetPayload<{ include: typeof incluirProyecto }>;

// Avance = porcentaje de hitos completados (tarjeta CRC "Proyecto")
function porcentajeAvance(proyecto: ProyectoCompleto) {
  if (proyecto.hitos.length === 0) return 0;
  const completados = proyecto.hitos.filter((h) => h.estado === "COMPLETADO").length;
  return Math.round((completados / proyecto.hitos.length) * 100);
}

function condicionProyectos(filtros: Record<string, string>): Prisma.ProyectoWhereInput {
  return {
    ...(idFiltro(filtros.periodo) ? { idPeriodo: idFiltro(filtros.periodo) } : {}),
    ...(idFiltro(filtros.materia) ? { materiaId: idFiltro(filtros.materia) } : {}),
    ...(idFiltro(filtros.docente) ? { docenteId: idFiltro(filtros.docente) } : {}),
    ...(filtros.estado
      ? { estado: filtros.estado as Prisma.ProyectoWhereInput["estado"] }
      : {}),
  };
}

function resumenProyectos(proyectos: ProyectoCompleto[]) {
  const total = proyectos.length;
  const promedio =
    total === 0
      ? 0
      : Math.round(proyectos.reduce((suma, p) => suma + porcentajeAvance(p), 0) / total);

  const porEstado = ESTADOS_PROYECTO.map((estado) => ({
    etiqueta: estado.texto,
    valor: String(proyectos.filter((p) => p.estado === estado.valor).length),
  })).filter((dato) => dato.valor !== "0");

  return [
    { etiqueta: "Total", valor: pluralizar(total, "proyecto", "proyectos") },
    { etiqueta: "Avance promedio", valor: `${promedio}%` },
    ...porEstado,
  ];
}

async function consultarProyectos(where: Prisma.ProyectoWhereInput, limite: number) {
  return prisma.proyecto.findMany({
    where,
    include: incluirProyecto,
    orderBy: [{ periodo: { gestion: "desc" } }, { periodo: { semestre: "desc" } }, { titulo: "asc" }],
    take: limite,
  });
}

/* ==========================================
   AVANCES (consulta común)
========================================== */

async function consultarAvances(where: Prisma.AvanceProyectoWhereInput, limite: number) {
  return prisma.avanceProyecto.findMany({
    where,
    include: {
      proyecto: { select: { titulo: true } },
      hito: { select: { titulo: true } },
      autor: { select: { nombre: true } },
    },
    orderBy: { fecha: "desc" },
    take: limite,
  });
}

type AvanceCompleto = Awaited<ReturnType<typeof consultarAvances>>[number];

function condicionAvances(filtros: Record<string, string>): Prisma.AvanceProyectoWhereInput {
  return {
    ...(filtros.revision
      ? { revisionEstado: filtros.revision as Prisma.AvanceProyectoWhereInput["revisionEstado"] }
      : {}),
    proyecto: {
      ...(idFiltro(filtros.periodo) ? { idPeriodo: idFiltro(filtros.periodo) } : {}),
      ...(idFiltro(filtros.materia) ? { materiaId: idFiltro(filtros.materia) } : {}),
    },
  };
}

function resumenAvances(avances: AvanceCompleto[]) {
  const calificados = avances.filter((a) => a.calificacion !== null);
  const promedio =
    calificados.length === 0
      ? "—"
      : String(
          Math.round(
            calificados.reduce((suma, a) => suma + (a.calificacion ?? 0), 0) / calificados.length
          )
        );

  return [
    { etiqueta: "Total", valor: pluralizar(avances.length, "avance", "avances") },
    ...ESTADOS_REVISION.map((estado) => ({
      etiqueta: estado.texto,
      valor: String(avances.filter((a) => a.revisionEstado === estado.valor).length),
    })),
    { etiqueta: "Calificación promedio", valor: promedio },
  ];
}

const COLUMNAS_AVANCES = [
  { titulo: "N°", ancho: 6, alineacion: "centro" as const },
  { titulo: "Fecha", ancho: 12, alineacion: "centro" as const },
  { titulo: "Proyecto", ancho: 34 },
  { titulo: "Avance", ancho: 30 },
  { titulo: "Hito", ancho: 26 },
  { titulo: "Autor", ancho: 20 },
  { titulo: "Revisión", ancho: 12, alineacion: "centro" as const },
  { titulo: "Nota", ancho: 8, alineacion: "centro" as const },
];

function filasAvances(avances: AvanceCompleto[]) {
  return avances.map((a, i) => [
    i + 1,
    formatearFecha(a.fecha),
    a.proyecto.titulo,
    a.titulo,
    a.hito?.titulo ?? "—",
    a.autor.nombre,
    texto(ESTADOS_REVISION, a.revisionEstado),
    a.calificacion ?? "—",
  ]);
}

/* ==========================================
   DEFINICIONES DE LOS REPORTES
========================================== */

const reportes: DefinicionReporteDatos[] = [
  /* ---------- ADMINISTRADOR ---------- */
  {
    id: "proyectos",
    titulo: "Informe general de proyectos",
    descripcion: "Proyectos por periodo, materia, docente y estado, con su avance.",
    nombreArchivo: "informe-proyectos",
    roles: ["ADMINISTRADOR"],
    filtros: [filtroPeriodo, filtroMateria, filtroDocente, filtroEstadoProyecto],
    async generar({ filtros, limite }) {
      const proyectos = await consultarProyectos(condicionProyectos(filtros), limite);

      return {
        resumen: resumenProyectos(proyectos),
        tabla: {
          columnas: [
            { titulo: "N°", ancho: 6, alineacion: "centro" },
            { titulo: "Proyecto", ancho: 38 },
            { titulo: "Materia", ancho: 30 },
            { titulo: "Periodo", ancho: 10, alineacion: "centro" },
            { titulo: "Docente", ancho: 20 },
            { titulo: "Integrantes", ancho: 30 },
            { titulo: "Estado", ancho: 14, alineacion: "centro" },
            { titulo: "Avance", ancho: 10, alineacion: "centro" },
          ],
          filas: proyectos.map((p, i) => [
            i + 1,
            p.titulo,
            p.materia ? etiquetaMateria(p.materia) : "—",
            p.periodo ? nombrePeriodo(p.periodo) : "—",
            p.docente.nombre,
            (p.equipo?.miembros ?? []).map((m) => m.usuario.nombre).join(", "),
            texto(ESTADOS_PROYECTO, p.estado),
            `${porcentajeAvance(p)}%`,
          ]),
        },
      };
    },
  },
  {
    id: "avances",
    titulo: "Informe de avances y revisiones",
    descripcion: "Avances enviados por los estudiantes y su estado de revisión.",
    nombreArchivo: "informe-avances",
    roles: ["ADMINISTRADOR"],
    filtros: [filtroPeriodo, filtroMateria, filtroRevision],
    async generar({ filtros, limite }) {
      const avances = await consultarAvances(condicionAvances(filtros), limite);

      return {
        resumen: resumenAvances(avances),
        tabla: { columnas: COLUMNAS_AVANCES, filas: filasAvances(avances) },
      };
    },
  },
  {
    id: "academico",
    titulo: "Informe de materias y asignaciones",
    descripcion: "Materias de la Carrera y docentes asignados por periodo académico.",
    nombreArchivo: "informe-asignaciones",
    roles: ["ADMINISTRADOR"],
    filtros: [filtroPeriodo, filtroDocente],
    async generar({ filtros, limite }) {
      const asignaciones = await prisma.asignacionDocente.findMany({
        where: {
          ...(idFiltro(filtros.periodo) ? { idPeriodo: idFiltro(filtros.periodo) } : {}),
          ...(idFiltro(filtros.docente) ? { idDocente: idFiltro(filtros.docente) } : {}),
        },
        include: { materia: true, periodo: true, docente: { select: { nombre: true } } },
        orderBy: [
          { periodo: { gestion: "desc" } },
          { periodo: { semestre: "desc" } },
          { materia: { nombre: "asc" } },
        ],
        take: limite,
      });

      // Proyectos por materia y periodo
      const conteos = await prisma.proyecto.groupBy({
        by: ["materiaId", "idPeriodo"],
        _count: { _all: true },
      });

      const proyectosDe = (idMateria: number, idPeriodo: number) =>
        conteos.find((c) => c.materiaId === idMateria && c.idPeriodo === idPeriodo)?._count
          ._all ?? 0;

      return {
        resumen: [
          { etiqueta: "Asignaciones", valor: String(asignaciones.length) },
          {
            etiqueta: "Materias",
            valor: String(new Set(asignaciones.map((a) => a.idMateria)).size),
          },
          {
            etiqueta: "Docentes",
            valor: String(new Set(asignaciones.map((a) => a.idDocente)).size),
          },
        ],
        tabla: {
          columnas: [
            { titulo: "N°", ancho: 6, alineacion: "centro" },
            { titulo: "Periodo", ancho: 10, alineacion: "centro" },
            { titulo: "Materia", ancho: 36 },
            { titulo: "Semestre", ancho: 10, alineacion: "centro" },
            { titulo: "Docente", ancho: 24 },
            { titulo: "Proyectos", ancho: 10, alineacion: "centro" },
          ],
          filas: asignaciones.map((a, i) => [
            i + 1,
            nombrePeriodo(a.periodo),
            etiquetaMateria(a.materia),
            `${a.materia.nivel}.°`,
            a.docente.nombre,
            proyectosDe(a.idMateria, a.idPeriodo),
          ]),
        },
      };
    },
  },

  /* ---------- DOCENTE ---------- */
  {
    id: "avance-proyectos",
    titulo: "Reporte de avance de proyectos",
    descripcion: "Estado y avance de los proyectos que diriges, para presentarlo a la Carrera.",
    nombreArchivo: "reporte-avance-proyectos",
    roles: ["DOCENTE"],
    filtros: [filtroPeriodo, filtroEstadoProyecto],
    async generar({ usuario, filtros, limite }) {
      // Solo los proyectos del docente que genera el reporte
      const proyectos = await consultarProyectos(
        { ...condicionProyectos(filtros), docenteId: usuario.id },
        limite
      );

      return {
        resumen: resumenProyectos(proyectos),
        tabla: {
          columnas: [
            { titulo: "N°", ancho: 6, alineacion: "centro" },
            { titulo: "Proyecto", ancho: 38 },
            { titulo: "Materia", ancho: 30 },
            { titulo: "Periodo", ancho: 10, alineacion: "centro" },
            { titulo: "Integrantes", ancho: 30 },
            { titulo: "Estado", ancho: 14, alineacion: "centro" },
            { titulo: "Avance", ancho: 10, alineacion: "centro" },
          ],
          filas: proyectos.map((p, i) => [
            i + 1,
            p.titulo,
            p.materia ? etiquetaMateria(p.materia) : "—",
            p.periodo ? nombrePeriodo(p.periodo) : "—",
            (p.equipo?.miembros ?? []).map((m) => m.usuario.nombre).join(", "),
            texto(ESTADOS_PROYECTO, p.estado),
            `${porcentajeAvance(p)}%`,
          ]),
        },
      };
    },
  },
  {
    id: "revisiones",
    titulo: "Reporte de revisiones y observaciones",
    descripcion: "Avances de tus proyectos: revisados, pendientes y observados.",
    nombreArchivo: "reporte-revisiones",
    roles: ["DOCENTE"],
    filtros: [filtroPeriodo, filtroRevision],
    async generar({ usuario, filtros, limite }) {
      const condicion = condicionAvances(filtros);
      const avances = await consultarAvances(
        {
          ...condicion,
          proyecto: { ...(condicion.proyecto as Prisma.ProyectoWhereInput), docenteId: usuario.id },
        },
        limite
      );

      return {
        resumen: resumenAvances(avances),
        tabla: { columnas: COLUMNAS_AVANCES, filas: filasAvances(avances) },
      };
    },
  },

  /* ---------- ESTUDIANTE ---------- */
  {
    id: "mis-proyectos",
    titulo: "Reporte de mis proyectos",
    descripcion: "Estado y avance de tus proyectos para presentarlo al docente.",
    nombreArchivo: "reporte-mis-proyectos",
    roles: ["ESTUDIANTE"],
    filtros: [filtroPeriodo, filtroEstadoProyecto],
    async generar({ usuario, filtros, limite }) {
      // Solo los proyectos en los que participa el estudiante
      const proyectos = await consultarProyectos(
        { ...condicionProyectos(filtros), OR: [{ creadoPorId: usuario.id }, { equipo: { is: { miembros: { some: { usuarioId: usuario.id } } } } }] },
        limite
      );

      return {
        resumen: resumenProyectos(proyectos),
        tabla: {
          columnas: [
            { titulo: "N°", ancho: 6, alineacion: "centro" },
            { titulo: "Proyecto", ancho: 38 },
            { titulo: "Materia", ancho: 30 },
            { titulo: "Periodo", ancho: 10, alineacion: "centro" },
            { titulo: "Docente", ancho: 20 },
            { titulo: "Mi rol", ancho: 12, alineacion: "centro" },
            { titulo: "Estado", ancho: 14, alineacion: "centro" },
            { titulo: "Avance", ancho: 10, alineacion: "centro" },
          ],
          filas: proyectos.map((p, i) => [
            i + 1,
            p.titulo,
            p.materia ? etiquetaMateria(p.materia) : "—",
            p.periodo ? nombrePeriodo(p.periodo) : "—",
            p.docente.nombre,
            (p.equipo?.miembros ?? []).find((m) => m.usuario.id === usuario.id)?.rolEquipo ?? "—",
            texto(ESTADOS_PROYECTO, p.estado),
            `${porcentajeAvance(p)}%`,
          ]),
        },
      };
    },
  },
  {
    id: "mis-avances",
    titulo: "Historial de mis avances",
    descripcion: "Avances que enviaste, su revisión y las observaciones del docente.",
    nombreArchivo: "historial-mis-avances",
    roles: ["ESTUDIANTE"],
    filtros: [filtroPeriodo, filtroRevision],
    async generar({ usuario, filtros, limite }) {
      const avances = await prisma.avanceProyecto.findMany({
        where: { ...condicionAvances(filtros), autorId: usuario.id },
        include: { proyecto: { select: { titulo: true } }, hito: { select: { titulo: true } } },
        orderBy: { fecha: "desc" },
        take: limite,
      });

      return {
        resumen: [
          { etiqueta: "Total", valor: pluralizar(avances.length, "avance", "avances") },
          ...ESTADOS_REVISION.map((estado) => ({
            etiqueta: estado.texto,
            valor: String(avances.filter((a) => a.revisionEstado === estado.valor).length),
          })),
        ],
        tabla: {
          columnas: [
            { titulo: "N°", ancho: 6, alineacion: "centro" },
            { titulo: "Fecha", ancho: 12, alineacion: "centro" },
            { titulo: "Proyecto", ancho: 32 },
            { titulo: "Avance", ancho: 28 },
            { titulo: "Revisión", ancho: 12, alineacion: "centro" },
            { titulo: "Nota", ancho: 8, alineacion: "centro" },
            { titulo: "Observación del docente", ancho: 40 },
          ],
          filas: avances.map((a, i) => [
            i + 1,
            formatearFecha(a.fecha),
            a.proyecto.titulo,
            a.titulo,
            texto(ESTADOS_REVISION, a.revisionEstado),
            a.calificacion ?? "—",
            a.retroalimentacion ?? "—",
          ]),
        },
      };
    },
  },
];

export function obtenerReporte(id: string, rol: RolUsuario) {
  const reporte = reportes.find((r) => r.id === id);
  return reporte && reporte.roles.includes(rol) ? reporte : null;
}
