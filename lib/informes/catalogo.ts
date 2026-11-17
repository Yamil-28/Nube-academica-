
import type { RolUsuario } from "@/lib/sesion";

/* ==========================================
   CATÁLOGO DE REPORTES POR ROL
   Documento SISCloud, Tabla 6 (Módulo 7) y
   HU-11, HU-17, HU-18, RF14, RF15.
========================================== */

export type IconoReporte =
  | "usuarios"
  | "proyectos"
  | "avances"
  | "actividad"
  | "nube"
  | "academico";

export type DefinicionReporte = {
  id: string;
  titulo: string;
  descripcion: string;
  icono: IconoReporte;
  // Ruta de la vista previa. Si no existe, el reporte
  // depende de un módulo que aún no está integrado.
  ruta?: string;
  moduloRequerido?: string;
  referencia: string;
};

const MODULO_PROYECTOS = "Gestión de proyectos académicos";
const MODULO_ACADEMICO = "Gestión académica";
const MODULO_AUDITORIA = "Auditoría, seguridad y control";
const MODULO_NUBE = "Administración del espacio en la nube";

const catalogo: Record<RolUsuario, DefinicionReporte[]> = {
  ADMINISTRADOR: [
    {
      id: "usuarios",
      titulo: "Informe de usuarios",
      descripcion:
        "Cuentas registradas por rol, estado y fecha de registro.",
      icono: "usuarios",
      ruta: "/administrador/reportes/usuarios",
      referencia: "HU-18 · RF14",
    },
    {
      id: "proyectos",
      titulo: "Informe general de proyectos",
      descripcion:
        "Proyectos por periodo, materia, docente y estado, con su avance.",
      icono: "proyectos",
      moduloRequerido: MODULO_PROYECTOS,
      referencia: "HU-18 · RF14",
    },
    {
      id: "avances",
      titulo: "Informe de avances y revisiones",
      descripcion:
        "Avances enviados por proyecto e hito y su estado de revisión.",
      icono: "avances",
      moduloRequerido: MODULO_PROYECTOS,
      referencia: "RF14",
    },
    {
      id: "academico",
      titulo: "Informe de materias y asignaciones",
      descripcion:
        "Materias de la Carrera y docentes asignados por periodo académico.",
      icono: "academico",
      moduloRequerido: MODULO_ACADEMICO,
      referencia: "RF03 · RF14",
    },
    {
      id: "actividad",
      titulo: "Informe de actividad del sistema",
      descripcion:
        "Acciones registradas por usuario, tipo y rango de fechas.",
      icono: "actividad",
      moduloRequerido: MODULO_AUDITORIA,
      referencia: "HU-18 · HU15 · RF14",
    },
    {
      id: "nube",
      titulo: "Informe de uso del almacenamiento",
      descripcion:
        "Espacio utilizado por proyecto frente a su cuota asignada.",
      icono: "nube",
      moduloRequerido: MODULO_NUBE,
      referencia: "Proceso 6",
    },
  ],

  DOCENTE: [
    {
      id: "avance-proyectos",
      titulo: "Reporte de avance de proyectos",
      descripcion:
        "Estado y avance de los proyectos de mis materias, para presentarlo a la Carrera.",
      icono: "proyectos",
      moduloRequerido: MODULO_PROYECTOS,
      referencia: "HU-11 · HU14",
    },
    {
      id: "revisiones",
      titulo: "Reporte de revisiones y observaciones",
      descripcion:
        "Avances revisados, pendientes y observados en mis materias.",
      icono: "avances",
      moduloRequerido: MODULO_PROYECTOS,
      referencia: "RF13 · RF14",
    },
  ],

  ESTUDIANTE: [
    {
      id: "mis-proyectos",
      titulo: "Reporte de mis proyectos",
      descripcion:
        "Estado y avance de mis proyectos para presentarlo al docente.",
      icono: "proyectos",
      moduloRequerido: MODULO_PROYECTOS,
      referencia: "HU-17",
    },
    {
      id: "mis-avances",
      titulo: "Historial de mis avances",
      descripcion:
        "Avances enviados, su revisión y las observaciones del docente.",
      icono: "avances",
      moduloRequerido: MODULO_PROYECTOS,
      referencia: "RF13 · RF14",
    },
  ],
};

export function obtenerCatalogo(rol: RolUsuario): DefinicionReporte[] {
  return catalogo[rol];
}
