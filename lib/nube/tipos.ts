// Tipos y errores compartidos (servidor Y cliente). No importar nada de servidor aquí.

export type Rol = "ADMINISTRADOR" | "DOCENTE" | "ESTUDIANTE";

/** Cómo se relaciona un usuario con un proyecto. De aquí salen los permisos. */
export type Relacion = "MIEMBRO" | "DOCENTE_RESPONSABLE" | "ADMINISTRACION";

export const ACCIONES = [
  "ver", "descargar", "subir", "crearCarpeta", "renombrar",
  "eliminar", "compartir", "verVersiones", "administrarCuota",
] as const;
export type Accion = (typeof ACCIONES)[number];
export type Permisos = Record<Accion, boolean>;

export interface UsuarioActual { id: number; rol: Rol }
export interface Contexto { usuario: UsuarioActual; ip?: string | null }

export class ErrorNube extends Error {
  constructor(public estado: number, public codigo: string, mensaje: string) {
    super(mensaje);
  }
}

/* ---------- DTOs (lo que viaja por la API) ---------- */
export interface CarpetaDTO { id: number; nombre: string; creadaEn: string }
export interface ArchivoDTO {
  id: number; nombre: string; extension: string | null; tipo: string | null;
  tamanoBytes: number; versionActual: number; propietarioId: number; actualizadoEn: string;
}
export interface MigaDTO { id: number | null; nombre: string }
export interface CuotaDTO { usoBytes: number; limiteBytes: number }
export interface ContenidoDTO {
  proyectoId: number; carpetaId: number | null; ruta: MigaDTO[];
  carpetas: CarpetaDTO[]; archivos: ArchivoDTO[]; cuota: CuotaDTO; permisos: Permisos;
}
export interface VersionDTO {
  id: number; numero: number; tamanoBytes: number; comentario: string | null;
  creadaEn: string; autor: string; esActual: boolean;
}
export type NivelPermiso = "LECTURA" | "EDICION";
export interface PermisoDTO { usuarioId: number; etiqueta: string; nivel: NivelPermiso }
export interface ResumenCuotaDTO extends CuotaDTO {
  proyectoId: number;
  materiaId: number;
  titulo: string;
  materia: string;
  limiteMateriaBytes: number | null;
}

export const RUTA_BASE: Record<Rol, string> = {
  ESTUDIANTE: "/estudiante", DOCENTE: "/docente", ADMINISTRADOR: "/administrador",
};
export interface CompartidoDTO {
  archivoId: number; nombre: string; extension: string | null; tipo: string | null;
  tamanoBytes: number; versionActual: number; proyecto: string; compartidoPor: string;
  nivel: NivelPermiso; fecha: string;
}
export interface UsuarioListaDTO { id: number; nombre: string; usuario: string; rol: Rol }

export interface ResumenCuotaMateriaDTO {
  materiaId: number;
  nombre: string;
  codigo: string | null;
  nivel: number;
  activa: boolean;
  proyectos: number;
  usoBytes: number;
  limiteBytes: number | null;
}
