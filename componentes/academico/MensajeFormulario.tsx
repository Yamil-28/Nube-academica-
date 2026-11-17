
import type { EstadoFormulario } from "@/lib/academico/tipos";

import estilos from "./Academico.module.css";

type Propiedades = {
  estado: EstadoFormulario;
  flotante?: boolean;
};

export default function MensajeFormulario({ estado, flotante }: Propiedades) {
  if (estado.estado === "inicial" || !estado.mensaje) {
    return null;
  }

  const clase =
    estado.estado === "exito" ? estilos.mensajeExito : estilos.mensajeError;

  return (
    <p
      className={`${estilos.mensaje} ${clase} ${
        flotante ? estilos.mensajeFlotante : ""
      }`}
      role={estado.estado === "error" ? "alert" : "status"}
    >
      {estado.mensaje}
    </p>
  );
}
