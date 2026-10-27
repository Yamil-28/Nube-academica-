
"use client";

import { usePathname } from "next/navigation";
import Cabecera from "@/componentes/Encabezado";
import EncabezadoInstitucional from "@/componentes/EncabezadoInstitucional";

export default function CabeceraSegunRuta() {
  const ruta = usePathname();

  if (ruta === "/") {
    return <EncabezadoInstitucional />;
  }

  return <Cabecera />;
}
