import { Suspense } from "react";
import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";
import VistaSeguimiento from "@/componentes/proyectos/VistaSeguimiento";
import type { ParametrosListado } from "@/componentes/dashboard/FiltrosListado";

export default function Pagina({ searchParams }: { searchParams: Promise<ParametrosListado> }) {
  return (
    <Suspense fallback={<CargandoDashboard />}>
      <VistaSeguimiento rol="ESTUDIANTE" vista="actividades" searchParams={searchParams} />
    </Suspense>
  );
}
