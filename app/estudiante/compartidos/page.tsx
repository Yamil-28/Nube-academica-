import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";
import { Suspense } from "react";
import VistaCompartidos from "@/componentes/nube/VistaCompartidos";
import { exigirRol } from "@/lib/nube/guardia";

async function Contenido() {
  await exigirRol("ESTUDIANTE");
  return <VistaCompartidos />;
}

export default function Pagina() {
  return (
    <Suspense fallback={<CargandoDashboard />}>
      <Contenido />
    </Suspense>
  );
}
