
"use client";

import { useActionState } from "react";
import { CalendarPlus } from "lucide-react";

import { accionCrearPeriodo } from "@/lib/academico/acciones";
import { ESTADO_INICIAL } from "@/lib/academico/tipos";
import MensajeFormulario from "./MensajeFormulario";

import estilos from "./Academico.module.css";

type Propiedades = {
  gestionSugerida: number;
};

export default function FormularioPeriodo({ gestionSugerida }: Propiedades) {
  const [estado, enviar, procesando] = useActionState(
    accionCrearPeriodo,
    ESTADO_INICIAL
  );

  const error = estado.errores ?? {};

  return (
    // La clave cambia tras cada registro exitoso y limpia el formulario
    <form key={estado.marca ?? 0} action={enviar} className={estilos.formulario}>
      <div className={estilos.filaCampos}>
        <div className={`${estilos.campo} ${error.gestion ? estilos.campoConError : ""}`}>
          <label htmlFor="periodo-gestion">Gestión</label>
          <input
            id="periodo-gestion"
            name="gestion"
            type="number"
            min={2020}
            max={2040}
            defaultValue={gestionSugerida}
            required
          />
          {error.gestion && <span className={estilos.errorCampo}>{error.gestion}</span>}
        </div>

        <div className={`${estilos.campo} ${error.semestre ? estilos.campoConError : ""}`}>
          <label htmlFor="periodo-semestre">Semestre</label>
          <select id="periodo-semestre" name="semestre" defaultValue="I" required>
            <option value="I">I (primer semestre)</option>
            <option value="II">II (segundo semestre)</option>
          </select>
          {error.semestre && <span className={estilos.errorCampo}>{error.semestre}</span>}
        </div>
      </div>

      <MensajeFormulario estado={estado} />

      <div className={estilos.botonesFormulario}>
        <button
          type="submit"
          className={`${estilos.boton} ${estilos.botonPrincipal}`}
          disabled={procesando}
        >
          <CalendarPlus size={16} />
          {procesando ? "Registrando..." : "Registrar periodo"}
        </button>
      </div>
    </form>
  );
}
