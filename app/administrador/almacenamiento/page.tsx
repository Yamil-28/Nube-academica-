import { Suspense } from "react";
import CargandoNube from "@/componentes/nube/CargandoNube";
import VistaAlmacenamiento from "@/componentes/nube/VistaAlmacenamiento";
import { exigirRol } from "@/lib/nube/guardia";

async function Contenido() {
  await exigirRol("ADMINISTRADOR");
  return <VistaAlmacenamiento />;
}

export default function Pagina() {
  return (
    <Suspense fallback={<CargandoNube />}>
      <Contenido />
    </Suspense>
  );
}
