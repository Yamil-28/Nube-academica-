
import type { LucideIcon } from "lucide-react";

import estilos from "./EncabezadoInforme.module.css";

type Propiedades = {
  etiqueta: string;
  titulo: string;
  descripcion: string;
  insignia?: {
    texto: string;
    icono: LucideIcon;
  };
};

export default function EncabezadoInforme({
  etiqueta,
  titulo,
  descripcion,
  insignia,
}: Propiedades) {
  const IconoInsignia = insignia?.icono;

  return (
    <div className={estilos.encabezado}>
      <div>
        <span className={estilos.etiqueta}>{etiqueta}</span>
        <h1>{titulo}</h1>
        <p>{descripcion}</p>
      </div>

      {insignia && IconoInsignia && (
        <div className={estilos.insignia}>
          <IconoInsignia size={20} />
          <span>{insignia.texto}</span>
        </div>
      )}
    </div>
  );
}
