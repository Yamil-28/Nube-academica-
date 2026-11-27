"use client";

import { useState } from "react";
import Link from "next/link";
import type { ResumenCuotaMateriaDTO } from "@/lib/nube/tipos";
import PanelCuotasMaterias from "./PanelCuotasMaterias";
import PanelCuotas from "./PanelCuotas";
import estilos from "./nube.module.css";

export default function PanelAlmacenamiento({ materias, capacidadBytes }: {
  materias: ResumenCuotaMateriaDTO[];
  capacidadBytes: number;
}) {
  const [revision, setRevision] = useState(0);
  return (
    <>
      <Link className={estilos.botonSec} href="#almacenamiento-materias">Ver almacenamiento por materia</Link>
      <PanelCuotas revision={revision} capacidadBytes={capacidadBytes} />
      <PanelCuotasMaterias iniciales={materias} onCambio={() => setRevision((actual) => actual + 1)} />
    </>
  );
}
