
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import estilos from "./TarjetaEstadistica.module.css";

type Propiedades = {
  titulo: string;
  valor: number;
  icono: LucideIcon;
  ruta: string;
  color?: "azul" | "dorado" | "verde" | "morado";
};

const colores = {
  azul: estilos.tarjetaAzul,
  dorado: estilos.tarjetaDorado,
  verde: estilos.tarjetaVerde,
  morado: estilos.tarjetaMorado,
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
      className={`${estilos.tarjetaEstadistica} ${colores[color]}`}
    >
      <div className={estilos.tarjetaEstadisticaSuperior}>
        <div className={estilos.tarjetaEstadisticaIcono}>
          <Icono size={23} />
        </div>

        <ArrowUpRight
          size={18}
          className={estilos.tarjetaFlecha}
        />
      </div>

      <strong className={estilos.tarjetaEstadisticaValor}>
        {valor.toLocaleString("es-BO")}
      </strong>

      <span className={estilos.tarjetaEstadisticaTitulo}>
        {titulo}
      </span>
    </Link>
  );
}
