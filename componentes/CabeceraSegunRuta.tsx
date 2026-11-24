"use client";

import { usePathname } from "next/navigation";
import Cabecera from "@/componentes/Encabezado";
import EncabezadoInstitucional from "@/componentes/EncabezadoInstitucional";
import PiePagina from "@/componentes/PiePagina";

export default function CabeceraSegunRuta() {
  const ruta = usePathname();

  if (ruta === "/") {
    return <EncabezadoInstitucional />;
  }

  return ruta === "/iniciar-sesion" ? <Cabecera /> : null;
}

export function PiePublico() {
  const ruta = usePathname();
  return ruta === "/iniciar-sesion" ? <PiePagina /> : null;
}
