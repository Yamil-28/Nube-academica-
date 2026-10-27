
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type Propiedades = {
  titulo: string;
  valor: number;
  icono: LucideIcon;
  ruta: string;
  color?: "azul" | "dorado" | "verde" | "morado";
};

export default function TarjetaEstadistica({
  titulo,
  valor,
  icono: Icono,
  ruta,
  color = "azul",
}: Propiedades) {
  return (
    <Link
      href={ruta}
      className={`tarjeta-estadistica tarjeta-${color}`}
    >
      <div className="tarjeta-estadistica-superior">
        <div className="tarjeta-estadistica-icono">
          <Icono size={23} />
        </div>

        <ArrowUpRight size={18} className="tarjeta-flecha" />
      </div>

      <strong className="tarjeta-estadistica-valor">
        {valor.toLocaleString("es-BO")}
      </strong>

      <span className="tarjeta-estadistica-titulo">
        {titulo}
      </span>
    </Link>
  );
}
