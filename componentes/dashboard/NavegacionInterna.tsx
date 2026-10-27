
"use client";

import Link from "next/link";
import {
  ArrowLeft,
  House,
  ChevronRight,
} from "lucide-react";

type Propiedades = {
  titulo: string;
  rutaInicio: string;
  rutaVolver?: string;
  nombreSeccion?: string;
};

export default function NavegacionInterna({
  titulo,
  rutaInicio,
  rutaVolver,
  nombreSeccion,
}: Propiedades) {
  return (
    <div className="dashboard-navegacion-interna">
      <div className="dashboard-migas">
        <Link href={rutaInicio}>
          <House size={16} />
          Inicio
        </Link>

        {nombreSeccion && (
          <>
            <ChevronRight size={15} />
            <span>{nombreSeccion}</span>
          </>
        )}

        <ChevronRight size={15} />
        <strong>{titulo}</strong>
      </div>

      <div className="dashboard-acciones-navegacion">
        <Link
          href={rutaVolver ?? rutaInicio}
          className="dashboard-boton-volver"
        >
          <ArrowLeft size={17} />
          Volver
        </Link>

        <Link
          href={rutaInicio}
          className="dashboard-boton-inicio"
        >
          <House size={17} />
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
