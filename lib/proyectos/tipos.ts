// Estados por los que pasa un proyecto académico
export const ESTADOS_PROYECTO = [
  "REGISTRADO",
  "EN_DESARROLLO",
  "EN_REVISION",
  "FINALIZADO",
] as const;

export type EstadoProyecto = (typeof ESTADOS_PROYECTO)[number];

export const ETIQUETA_ESTADO: Record<EstadoProyecto, string> = {
  REGISTRADO: "Registrado",
  EN_DESARROLLO: "En desarrollo",
  EN_REVISION: "En revisión",
  FINALIZADO: "Finalizado",
};

// Forma acordada de una materia (la entregará Gestión académica)
export type Materia = {
  id: number;
  codigo: string;
  nombre: string;
};

export type Proyecto = {
  id: number;
  titulo: string;
  descripcion: string;
  materiaId: number;
  docenteId: number;
  creadoPorId: number;
  gestion: number; // año, por ejemplo 2026
  semestre: 1 | 2;
  estado: EstadoProyecto;
  fechaInicio: Date;
  fechaCierre: Date | null;
};
export type Avance = {
  id: number;
  proyectoId: number;
  autorId: number;
  descripcion: string;
  fecha: Date;
};
export type Observacion = {
  id: number;
  proyectoId: number;
  docenteId: number;
  texto: string;
  fecha: Date;
};

// Cambios de estado que puede hacer el docente
export const TRANSICIONES_DOCENTE: Record<EstadoProyecto, EstadoProyecto[]> = {
  REGISTRADO: [],
  EN_DESARROLLO: ["EN_REVISION"],
  EN_REVISION: ["FINALIZADO", "EN_DESARROLLO"],
  FINALIZADO: [],
};