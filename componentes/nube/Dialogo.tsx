"use client";
// Diálogo modal reutilizable (usa el elemento nativo <dialog>: accesible y con foco atrapado).
// Sirve para: pedir un texto, confirmar una acción peligrosa o mostrar contenido propio (children).
import { useEffect, useRef, type ReactNode } from "react";
import { Icono } from "./iconos";
import e from "./nube.module.css";

export interface CampoDialogo { etiqueta: string; valor?: string; placeholder?: string; tipo?: "text" | "number"; min?: number }

interface Props {
  abierto: boolean;
  titulo: string;
  descripcion?: string;
  campo?: CampoDialogo;
  confirmar?: string;
  peligro?: boolean;
  ocupado?: boolean;
  error?: string | null;
  /** Solo muestra "Cerrar" (para paneles informativos como versiones o compartir). */
  soloCerrar?: boolean;
  amplio?: boolean;
  onConfirmar?: (valor: string) => void;
  onCerrar: () => void;
  children?: ReactNode;
}

export default function Dialogo({
  abierto, titulo, descripcion, campo, confirmar = "Aceptar", peligro, ocupado, error,
  soloCerrar, amplio, onConfirmar, onCerrar, children,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (abierto && !d.open) d.showModal();
    if (!abierto && d.open) d.close();
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      className={`${e.dialogo} ${amplio ? e.dialogoAmplio : ""}`}
      onClose={onCerrar}
      onClick={(ev) => { if (ev.target === ref.current) onCerrar(); }}
    >
      {abierto && (
        <form
          onSubmit={(ev) => {
            ev.preventDefault();
            if (soloCerrar || !onConfirmar) return;
            onConfirmar(String(new FormData(ev.currentTarget).get("valor") ?? "").trim());
          }}
        >
          <header className={e.dialogoCab}>
            <h3>{titulo}</h3>
            <button type="button" className={e.icono} onClick={onCerrar} aria-label="Cerrar"><Icono nombre="cerrar" /></button>
          </header>
          <div className={e.dialogoCuerpo}>
            {descripcion && <p className={e.suave}>{descripcion}</p>}
            {campo && (
              <label className={e.campo}>
                <span>{campo.etiqueta}</span>
                <input name="valor" type={campo.tipo ?? "text"} min={campo.min} defaultValue={campo.valor}
                  placeholder={campo.placeholder} autoFocus required />
              </label>
            )}
            {children}
            {error && <p role="alert" className={e.bannerError}><Icono nombre="alerta" /> {error}</p>}
          </div>
          <footer className={e.dialogoPie}>
            <button type="button" className={e.botonSec} onClick={onCerrar}>{soloCerrar ? "Cerrar" : "Cancelar"}</button>
            {!soloCerrar && (
              <button type="submit" className={peligro ? e.botonPeligro : e.botonPrimario} disabled={ocupado}>
                {ocupado ? "Procesando…" : confirmar}
              </button>
            )}
          </footer>
        </form>
      )}
    </dialog>
  );
}
