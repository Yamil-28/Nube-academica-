
"use client";

import { useActionState } from "react";
import Link from "next/link";
import { BookPlus, Save, X } from "lucide-react";

import {
  accionActualizarMateria,
  accionCrearMateria,
} from "@/lib/academico/acciones";
import { ESTADO_INICIAL, type Materia } from "@/lib/academico/tipos";
import MensajeFormulario from "./MensajeFormulario";

import estilos from "./Academico.module.css";

type Propiedades = {
  // Si llega una materia, el formulario está en modo edición
  materia?: Pick<Materia, "id" | "codigo" | "nombre" | "nivel" | "descripcion">;
  rutaCancelar: string;
};

const NIVELES = Array.from({ length: 10 }, (_, indice) => indice + 1);

export default function FormularioMateria({ materia, rutaCancelar }: Propiedades) {
  const editando = Boolean(materia);

  const [estado, enviar, procesando] = useActionState(
    editando ? accionActualizarMateria : accionCrearMateria,
    ESTADO_INICIAL
  );

  const error = estado.errores ?? {};

  return (
    <form key={estado.marca ?? 0} action={enviar} className={estilos.formulario}>
      {materia && <input type="hidden" name="id" value={materia.id} />}

      <div className={`${estilos.campo} ${error.codigo ? estilos.campoConError : ""}`}>
        <label htmlFor="materia-codigo">Código (opcional)</label>
        <input
          id="materia-codigo"
          name="codigo"
          type="text"
          placeholder="SIS-332"
          defaultValue={materia?.codigo ?? ""}
          maxLength={8}
          autoComplete="off"
        />
        {error.codigo ? (
          <span className={estilos.errorCampo}>{error.codigo}</span>
        ) : (
          <span className={estilos.ayuda}>Sigla y número, por ejemplo SIS-332</span>
        )}
      </div>

      <div className={`${estilos.campo} ${error.nombre ? estilos.campoConError : ""}`}>
        <label htmlFor="materia-nombre">Nombre</label>
        <input
          id="materia-nombre"
          name="nombre"
          type="text"
          placeholder="Sistemas de Información II"
          defaultValue={materia?.nombre}
          maxLength={120}
          required
        />
        {error.nombre && <span className={estilos.errorCampo}>{error.nombre}</span>}
      </div>

      <div className={`${estilos.campo} ${error.nivel ? estilos.campoConError : ""}`}>
        <label htmlFor="materia-nivel">Semestre de la carrera</label>
        <select
          id="materia-nivel"
          name="nivel"
          defaultValue={materia?.nivel ?? 1}
          required
        >
          {NIVELES.map((nivel) => (
            <option key={nivel} value={nivel}>
              {nivel}.° semestre
            </option>
          ))}
        </select>
        {error.nivel && <span className={estilos.errorCampo}>{error.nivel}</span>}
      </div>

      <div className={`${estilos.campo} ${error.descripcion ? estilos.campoConError : ""}`}>
        <label htmlFor="materia-descripcion">Descripción (opcional)</label>
        <textarea
          id="materia-descripcion"
          name="descripcion"
          rows={3}
          placeholder="Materia de la carrera"
          defaultValue={materia?.descripcion}
          maxLength={300}
        />
        {error.descripcion && (
          <span className={estilos.errorCampo}>{error.descripcion}</span>
        )}
      </div>

      <MensajeFormulario estado={estado} />

      <div className={estilos.botonesFormulario}>
        <button
          type="submit"
          className={`${estilos.boton} ${estilos.botonPrincipal}`}
          disabled={procesando}
        >
          {editando ? <Save size={16} /> : <BookPlus size={16} />}
          {procesando
            ? "Guardando..."
            : editando
              ? "Guardar cambios"
              : "Registrar materia"}
        </button>

        {editando && (
          <Link href={rutaCancelar} className={`${estilos.boton} ${estilos.botonSecundario}`}>
            <X size={16} />
            Cancelar
          </Link>
        )}
      </div>
    </form>
  );
}
