
"use client";

import { useActionState, type ReactNode } from "react";

import { ESTADO_INICIAL, type EstadoFormulario } from "@/lib/academico/tipos";
import MensajeFormulario from "./MensajeFormulario";

import estilos from "./Academico.module.css";

type Propiedades = {
  accion: (
    anterior: EstadoFormulario,
    formulario: FormData
  ) => Promise<EstadoFormulario>;
  id: number;
  children: ReactNode;
  peligro?: boolean;
  confirmacion?: string;
};

// Botón de una sola acción (activar, desactivar, quitar...) que
// muestra el error junto a la fila si la operación no se permite.
export default function BotonAccion({
  accion,
  id,
  children,
  peligro,
  confirmacion,
}: Propiedades) {
  const [estado, ejecutarAccion, procesando] = useActionState(
    accion,
    ESTADO_INICIAL
  );

  return (
    <form
      action={ejecutarAccion}
      onSubmit={(evento) => {
        if (confirmacion && !window.confirm(confirmacion)) {
          evento.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />

      <button
        type="submit"
        className={`${estilos.botonTabla} ${peligro ? estilos.botonPeligro : ""}`}
        disabled={procesando}
      >
        {procesando ? "..." : children}
      </button>

      {estado.estado === "error" && (
        <MensajeFormulario estado={estado} flotante />
      )}
    </form>
  );
}
