import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";
import { Suspense } from "react";
import VistaAlmacenamiento from "@/componentes/nube/VistaAlmacenamiento";
import { exigirRol } from "@/lib/nube/guardia";

async function Contenido() {
  await exigirRol("ADMINISTRADOR");
  return <VistaAlmacenamiento />;
}

export default function Pagina() {
  return (
    <Suspense fallback={<CargandoDashboard />}>
      <Contenido />
    </Suspense>
  );
}
