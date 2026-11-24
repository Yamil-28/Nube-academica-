"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Dialogo from "./Dialogo";
import { Icono } from "./iconos";
import PanelVersiones from "./PanelVersiones";
import e from "./nube.module.css";

export default function VersionesCompartidas({ id, nombre, puedeSubir }: {
  id: number;
  nombre: string;
  puedeSubir: boolean;
}) {
  const [abierto, setAbierto] = useState(false);
  const router = useRouter();

  return (
    <>
      <button type="button" className={e.icono} title="Versiones" aria-label={`Versiones de ${nombre}`} onClick={() => setAbierto(true)}>
        <Icono nombre="versiones" />
      </button>
      <Dialogo abierto={abierto} titulo={`Versiones · ${nombre}`} amplio soloCerrar onCerrar={() => setAbierto(false)}>
        {abierto && <PanelVersiones archivo={{ id, nombre }} puedeDescargar puedeSubir={puedeSubir} onCambio={() => router.refresh()} />}
      </Dialogo>
    </>
  );
}
