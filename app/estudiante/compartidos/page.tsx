import { Suspense } from "react";
import CargandoNube from "@/componentes/nube/CargandoNube";
import VistaCompartidos from "@/componentes/nube/VistaCompartidos";
import { exigirRol } from "@/lib/nube/guardia";

async function Contenido() {
  await exigirRol("ESTUDIANTE");
  return <VistaCompartidos />;
}

export default function Pagina() {
  return (
    <Suspense fallback={<CargandoNube />}>
      <Contenido />
    </Suspense>
  );
}
