import { Suspense } from "react";
import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";
import VistaSeguimiento from "@/componentes/proyectos/VistaSeguimiento";

export default function Pagina() {
  return (
    <Suspense fallback={<CargandoDashboard />}>
      <VistaSeguimiento rol="ESTUDIANTE" vista="actividades" />
    </Suspense>
  );
}
