"use client";

import { useRef, type ReactNode } from "react";
import { ClipboardList, X } from "lucide-react";
import estilos from "./DetallesListado.module.css";

export default function DetallesListado({ titulo, children }: { titulo: string; children: ReactNode }) {
  const dialogo = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" className={estilos.boton} onClick={() => dialogo.current?.showModal()}>
        Detalles
      </button>
      <dialog ref={dialogo} className={estilos.dialogo} aria-label={titulo}>
        <header className={estilos.cabecera}>
          <ClipboardList size={22} aria-hidden="true" />
          <h2>{titulo}</h2>
        </header>
        <div className={estilos.contenido}>{children}</div>
        <form method="dialog" className={estilos.pie}>
          <button className={estilos.boton} autoFocus><X size={15} aria-hidden="true" /> Cerrar</button>
        </form>
      </dialog>
    </>
  );
}
