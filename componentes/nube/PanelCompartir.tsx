"use client";
// Compartir un archivo con otras personas y administrar sus permisos (RF08 / HU07).
import { useCallback, useEffect, useState } from "react";
import { ETIQUETA_ROL } from "@/lib/nube/formato";
import { nube } from "@/lib/nube/cliente";
import type { ArchivoDTO, NivelPermiso, PermisoDTO, UsuarioListaDTO } from "@/lib/nube/tipos";
import { Icono } from "./iconos";
import e from "./nube.module.css";

export default function PanelCompartir({ archivo }: { archivo: ArchivoDTO }) {
  const [permisos, setPermisos] = useState<PermisoDTO[] | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioListaDTO[]>([]);
  const [destino, setDestino] = useState("");
  const [nivel, setNivel] = useState<NivelPermiso>("LECTURA");
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const [p, u] = await Promise.all([nube.permisos(archivo.id), nube.usuarios()]);
      setPermisos(p); setUsuarios(u);
    } catch (err) { setError((err as Error).message); }
  }, [archivo.id]);
  useEffect(() => { void cargar(); }, [cargar]);

  async function accion(fn: () => Promise<unknown>) {
    setOcupado(true); setError(null);
    try { await fn(); setDestino(""); await cargar(); }
    catch (err) { setError((err as Error).message); }
    finally { setOcupado(false); }
  }

  const disponibles = usuarios.filter((u) => !permisos?.some((p) => p.usuarioId === u.id));

  return (
    <>
      {error && <p role="alert" className={e.bannerError}><Icono nombre="alerta" /> {error}</p>}
      <div className={e.compartirFila}>
        <label className={e.campo}>
          <span>Compartir con</span>
          <select value={destino} onChange={(ev) => setDestino(ev.target.value)}>
            <option value="">Selecciona una persona…</option>
            {disponibles.map((u) => (
              <option key={u.id} value={u.id}>{u.nombre} ({u.usuario}) · {ETIQUETA_ROL[u.rol]}</option>
            ))}
          </select>
        </label>
        <label className={e.campo}>
          <span>Permiso</span>
          <select value={nivel} onChange={(ev) => setNivel(ev.target.value as NivelPermiso)}>
            <option value="LECTURA">Solo lectura</option>
            <option value="EDICION">Puede editar</option>
          </select>
        </label>
        <button type="button" className={e.botonPrimario} disabled={!destino || ocupado}
          onClick={() => void accion(() => nube.compartir(archivo.id, Number(destino), nivel))}>
          <Icono nombre="compartir" /> Compartir
        </button>
      </div>
      <p className={e.suave}>“Puede editar” permite subir nuevas versiones; “Solo lectura” permite ver y descargar.</p>

      <strong>Personas con acceso</strong>
      {!permisos ? <p className={e.suave}>Cargando…</p> : permisos.length === 0 ? (
        <p className={e.suave}>Todavía no compartiste este archivo con nadie.</p>
      ) : (
        <ul className={e.personas}>
          {permisos.map((p) => (
            <li key={p.usuarioId}>
              <span>{p.etiqueta} <span className={`${e.chip} ${p.nivel === "EDICION" ? e.chipAzul : ""}`}>{p.nivel === "EDICION" ? "Puede editar" : "Solo lectura"}</span></span>
              <button type="button" className={e.botonSec} disabled={ocupado}
                onClick={() => void accion(() => nube.quitarPermiso(archivo.id, p.usuarioId))}>Quitar</button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
