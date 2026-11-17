
"use client";

import { useActionState } from "react";
import { UserPlus } from "lucide-react";

import { accionAsignarDocente } from "@/lib/academico/acciones";
import {
  ESTADO_INICIAL,
  etiquetaMateria,
  nombrePeriodo,
  type Docente,
  type Materia,
  type PeriodoAcademico,
} from "@/lib/academico/tipos";
import MensajeFormulario from "./MensajeFormulario";

import estilos from "./Academico.module.css";

type Propiedades = {
  docentes: Docente[];
  materias: Materia[];
  periodos: PeriodoAcademico[];
  idPeriodoSeleccionado?: number;
};

export default function FormularioAsignacion({
  docentes,
  materias,
  periodos,
  idPeriodoSeleccionado,
}: Propiedades) {
  const [estado, enviar, procesando] = useActionState(
    accionAsignarDocente,
    ESTADO_INICIAL
  );

  const error = estado.errores ?? {};

  if (docentes.length === 0) {
    return (
      <p className={estilos.vacio}>
        No hay docentes activos. Registra un usuario con rol Docente en
        Gestión de usuarios.
      </p>
    );
  }

  return (
    <form key={estado.marca ?? 0} action={enviar} className={estilos.formulario}>
      <div className={`${estilos.campo} ${error.idPeriodo ? estilos.campoConError : ""}`}>
        <label htmlFor="asignacion-periodo">Periodo académico</label>
        <select
          id="asignacion-periodo"
          name="idPeriodo"
          defaultValue={idPeriodoSeleccionado ?? ""}
          required
        >
          <option value="" disabled>
            Selecciona un periodo
          </option>
          {periodos.map((periodo) => (
            <option key={periodo.id} value={periodo.id}>
              {nombrePeriodo(periodo)}
              {periodo.vigente ? " (vigente)" : ""}
            </option>
          ))}
        </select>
        {error.idPeriodo && <span className={estilos.errorCampo}>{error.idPeriodo}</span>}
      </div>

      <div className={`${estilos.campo} ${error.idMateria ? estilos.campoConError : ""}`}>
        <label htmlFor="asignacion-materia">Materia</label>
        <select id="asignacion-materia" name="idMateria" defaultValue="" required>
          <option value="" disabled>
            Selecciona una materia
          </option>
          {materias.map((materia) => (
            <option key={materia.id} value={materia.id}>
              {etiquetaMateria(materia)}
            </option>
          ))}
        </select>
        {error.idMateria && <span className={estilos.errorCampo}>{error.idMateria}</span>}
      </div>

      <div className={`${estilos.campo} ${error.idDocente ? estilos.campoConError : ""}`}>
        <label htmlFor="asignacion-docente">Docente</label>
        <select id="asignacion-docente" name="idDocente" defaultValue="" required>
          <option value="" disabled>
            Selecciona un docente
          </option>
          {docentes.map((docente) => (
            <option key={docente.id} value={docente.id}>
              {docente.nombre} (@{docente.usuario})
            </option>
          ))}
        </select>
        {error.idDocente && <span className={estilos.errorCampo}>{error.idDocente}</span>}
      </div>

      <MensajeFormulario estado={estado} />

      <div className={estilos.botonesFormulario}>
        <button
          type="submit"
          className={`${estilos.boton} ${estilos.botonPrincipal}`}
          disabled={procesando}
        >
          <UserPlus size={16} />
          {procesando ? "Asignando..." : "Asignar docente"}
        </button>
      </div>
    </form>
  );
}
