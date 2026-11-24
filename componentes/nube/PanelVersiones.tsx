"use client";
// Historial de versiones de un archivo (RF09 / HU08) + subida de una nueva versión.
import { useCallback, useEffect, useRef, useState } from "react";
import { fechaHora, formatoBytes } from "@/lib/nube/formato";
import { nube } from "@/lib/nube/cliente";
import type { ArchivoDTO, VersionDTO } from "@/lib/nube/tipos";
import { Icono } from "./iconos";
import e from "./nube.module.css";

interface Props { archivo: Pick<ArchivoDTO, "id" | "nombre">; puedeDescargar: boolean; puedeSubir: boolean; onCambio: () => void }

export default function PanelVersiones({ archivo, puedeDescargar, puedeSubir, onCambio }: Props) {
  const [versiones, setVersiones] = useState<VersionDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [comentario, setComentario] = useState("");
  const entrada = useRef<HTMLInputElement>(null);

  const cargar = useCallback(async () => {
    try { setVersiones(await nube.versiones(archivo.id)); }
    catch (err) { setError((err as Error).message); }
  }, [archivo.id]);
  useEffect(() => {
    const inicio = window.setTimeout(() => void cargar(), 0);
    return () => window.clearTimeout(inicio);
  }, [cargar]);

  async function subir(f: File) {
    setOcupado(true); setError(null);
    try {
      await nube.subirVersion(archivo.id, f, comentario.trim() || undefined);
      setComentario("");
      await cargar();
      onCambio();
    } catch (err) { setError((err as Error).message); }
    finally { setOcupado(false); }
  }

  return (
    <>
      {error && <p role="alert" className={e.bannerError}><Icono nombre="alerta" /> {error}</p>}
      {!versiones ? <p className={e.suave}>Cargando versiones…</p> : (
        <ol className={e.lineaTiempo}>
          {versiones.map((v) => (
            <li key={v.id} className={v.esActual ? e.itemActual : undefined}>
              <span className={e.version}>v{v.numero}</span>
              <div className={e.vInfo}>
                <strong>{v.autor}{v.esActual ? " · versión actual" : ""}</strong>
                <small>{fechaHora(v.creadaEn)} · {formatoBytes(v.tamanoBytes)}</small>
                {v.comentario && <p>“{v.comentario}”</p>}
              </div>
              {puedeDescargar && (
                <a className={e.icono} href={nube.urlDescarga(archivo.id, v.numero)}
                  title={`Descargar v${v.numero}`} aria-label={`Descargar versión ${v.numero}`}>
                  <Icono nombre="descargar" />
                </a>
              )}
            </li>
          ))}
        </ol>
      )}
      {puedeSubir && (
        <div className={e.bloqueSubida}>
          <label className={e.campo}>
            <span>Comentario de la nueva versión (opcional)</span>
            <input value={comentario} onChange={(ev) => setComentario(ev.target.value)} maxLength={200} placeholder="Ej. Corregí la introducción" />
          </label>
          <div>
            <button type="button" className={e.botonPrimario} disabled={ocupado} onClick={() => entrada.current?.click()}>
              <Icono nombre="subir" /> {ocupado ? "Subiendo…" : "Subir nueva versión"}
            </button>
            <input ref={entrada} type="file" hidden onChange={(ev) => {
              const f = ev.target.files?.[0]; ev.target.value = "";
              if (f) void subir(f);
            }} />
          </div>
        </div>
      )}
    </>
  );
}
