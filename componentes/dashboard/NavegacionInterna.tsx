
"use client";

import Link from "next/link";
import {
  ArrowLeft,
  House,
  ChevronRight,
} from "lucide-react";

import estilos from "./NavegacionInterna.module.css";

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
    <div className={estilos.dashboardNavegacionInterna}>
      <div className={estilos.dashboardMigas}>
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

      <div className={estilos.dashboardAccionesNavegacion}>
        <Link
          href={rutaVolver ?? rutaInicio}
          className={estilos.dashboardBotonVolver}
        >
          <ArrowLeft size={17} />
          Volver
        </Link>

        <Link
          href={rutaInicio}
          className={estilos.dashboardBotonInicio}
        >
          <House size={17} />
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
