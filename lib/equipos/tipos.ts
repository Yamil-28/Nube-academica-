export type RolEquipo = "LIDER" | "INTEGRANTE";

export type Miembro = {
  id: number;
  usuarioId: number;
  rolEquipo: RolEquipo;
  fechaIngreso: Date;
};

export type Equipo = {
  id: number;
  nombre: string;
  proyectoId: number;
  creadoPorId: number;
  creadoEn: Date;
  miembros: Miembro[];
};

export type ErrorEquipo =
  | "proyecto_invalido"
  | "proyecto_finalizado"
  | "ya_tiene_equipo"
  | "sin_permiso"
  | "estudiante_invalido"
  | "ya_es_miembro"
  | "ultimo_lider"
  | "no_encontrado";

export type Resultado<T = null> =
  | { ok: true; datos: T }
  | { ok: false; error: ErrorEquipo };

// Textos para mostrar al usuario
export const MENSAJE_ERROR: Record<ErrorEquipo, string> = {
  proyecto_invalido: "Elige uno de tus proyectos.",
  proyecto_finalizado: "El proyecto está finalizado y el equipo ya no se puede modificar.",
  ya_tiene_equipo: "Ese proyecto ya tiene un equipo.",
  sin_permiso: "Solo el líder del equipo puede hacer este cambio.",
  estudiante_invalido: "Elige un estudiante activo.",
  ya_es_miembro: "Esa persona ya forma parte del equipo.",
  ultimo_lider: "El equipo debe tener al menos un líder. Asigna otro líder primero.",
  no_encontrado: "No se encontró el equipo o el integrante.",
};

export const ETIQUETA_ROL_EQUIPO: Record<RolEquipo, string> = {
  LIDER: "Líder",
  INTEGRANTE: "Integrante",
};