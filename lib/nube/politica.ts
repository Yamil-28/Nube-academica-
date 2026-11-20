// POLÍTICA DE PERMISOS (módulo 3 · Nube Académica) — fuente única de verdad.
// Refleja los roles del Cap. 3 (RF05–RF09, HU05–HU08) y la decisión D-06 (el Administrador supervisa, no edita proyectos).
// Para cambiar qué puede hacer un actor, edita SOLO esta tabla.
import { ACCIONES, type Accion, type Permisos, type Relacion } from "./tipos";

const LECTURA: Accion[] = ["ver", "descargar", "verVersiones"];

export const PERMISOS_POR_RELACION: Record<Relacion, readonly Accion[]> = {
  // Estudiante integrante: sube, descarga, organiza en carpetas, comparte y consulta versiones (RF06–RF09, HU05–HU08)
  MIEMBRO: ["ver", "descargar", "subir", "crearCarpeta", "renombrar", "eliminar", "compartir", "verVersiones"],
  // Docente: consulta y descarga los documentos de los proyectos de sus materias (rol Docente, Cap. 3)
  // ⚠ El diagrama de casos de uso no dibuja Docente–Nube Académica; si el docente de la materia lo confirma, déjalo así
  //   y actualiza el diagrama. Para quitarle el acceso: pon [] en esta línea.
  DOCENTE_RESPONSABLE: LECTURA,
  // Administrador: supervisa todo y administra el espacio de almacenamiento (RF05); no sube ni edita
  ADMINISTRACION: [...LECTURA, "administrarCuota"],
};

export function puede(relacion: Relacion | null, accion: Accion): boolean {
  return !!relacion && PERMISOS_POR_RELACION[relacion].includes(accion);
}

export function permisosDe(relacion: Relacion | null): Permisos {
  return Object.fromEntries(ACCIONES.map((a) => [a, puede(relacion, a)])) as Permisos;
}
