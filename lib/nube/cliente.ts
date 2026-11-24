// Cliente fetch tipado para usar desde componentes "use client".
import type { CompartidoDTO, ContenidoDTO, NivelPermiso, PermisoDTO, ResumenCuotaDTO, ResumenCuotaMateriaDTO, UsuarioListaDTO, VersionDTO } from "./tipos";

async function pedir<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, { cache: "no-store", ...init });
  if (!r.ok) {
    const e = await r.json().catch(() => null);
    throw new Error(e?.error?.mensaje ?? `Error ${r.status}`);
  }
  return (await r.json()) as T;
}
const JSON_H = { "Content-Type": "application/json" };
const enviar = (metodo: string, cuerpo: unknown): RequestInit => ({ method: metodo, headers: JSON_H, body: JSON.stringify(cuerpo) });
function formData(archivo: File, extra: Record<string, string | number | null | undefined> = {}) {
  const f = new FormData();
  f.append("file", archivo);
  for (const [k, v] of Object.entries(extra)) if (v !== null && v !== undefined) f.append(k, String(v));
  return f;
}

export const nube = {
  contenido: (proyectoId: number, carpetaId: number | null) =>
    pedir<ContenidoDTO>(`/api/nube/proyectos/${proyectoId}/contenido${carpetaId ? `?carpetaId=${carpetaId}` : ""}`),
  crearCarpeta: (proyectoId: number, nombre: string, carpetaPadreId: number | null) =>
    pedir(`/api/nube/proyectos/${proyectoId}/carpetas`, enviar("POST", { nombre, carpetaPadreId })),
  renombrarCarpeta: (id: number, nombre: string) => pedir(`/api/nube/carpetas/${id}`, enviar("PATCH", { nombre })),
  eliminarCarpeta: (id: number) => pedir(`/api/nube/carpetas/${id}`, { method: "DELETE" }),
  subir: (proyectoId: number, archivo: File, carpetaId: number | null, comentario?: string) =>
    pedir(`/api/nube/proyectos/${proyectoId}/archivos`, { method: "POST", body: formData(archivo, { carpetaId, comentario }) }),
  renombrarArchivo: (id: number, nombre: string) => pedir(`/api/nube/archivos/${id}`, enviar("PATCH", { nombre })),
  eliminarArchivo: (id: number) => pedir(`/api/nube/archivos/${id}`, { method: "DELETE" }),
  urlDescarga: (id: number, version?: number) => `/api/nube/archivos/${id}${version ? `?version=${version}` : ""}`,
  versiones: (id: number) => pedir<VersionDTO[]>(`/api/nube/archivos/${id}/versiones`),
  subirVersion: (id: number, archivo: File, comentario?: string) =>
    pedir(`/api/nube/archivos/${id}/versiones`, { method: "POST", body: formData(archivo, { comentario }) }),
  permisos: (id: number) => pedir<PermisoDTO[]>(`/api/nube/archivos/${id}/permisos`),
  compartir: (id: number, usuarioId: number, nivel: NivelPermiso) => pedir(`/api/nube/archivos/${id}/permisos`, enviar("POST", { usuarioId, nivel })),
  quitarPermiso: (id: number, usuarioId: number) => pedir(`/api/nube/archivos/${id}/permisos`, enviar("DELETE", { usuarioId })),
  compartidos: () => pedir<CompartidoDTO[]>("/api/nube/compartidos"),
  usuarios: () => pedir<UsuarioListaDTO[]>("/api/nube/usuarios"),
  cuotasMaterias: () => pedir<ResumenCuotaMateriaDTO[]>("/api/nube/cuotas/materias"),
  fijarCuotaMateria: (materiaId: number, limiteBytes: number | null) => pedir("/api/nube/cuotas/materias", enviar("PUT", { materiaId, limiteBytes })),
  cuotas: () => pedir<ResumenCuotaDTO[]>("/api/nube/cuotas"),
  fijarCuota: (proyectoId: number, limiteBytes: number) => pedir("/api/nube/cuotas", enviar("PUT", { proyectoId, limiteBytes })),
};

export { formatoBytes } from "./formato";
