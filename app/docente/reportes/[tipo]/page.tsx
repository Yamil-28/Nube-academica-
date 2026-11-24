import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";

import { Suspense } from "react";

import VistaReporte from "@/componentes/informes/VistaReporte";


type Propiedades = {
  params: Promise<{ tipo: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Reportes del rol Docente (la definición se elige por [tipo])
export default function PaginaReporteDocente({ params, searchParams }: Propiedades) {
  return (
    <Suspense fallback={<CargandoDashboard />}>
      <VistaReporte rol="DOCENTE" parametros={params} busqueda={searchParams} />
    </Suspense>
  );
}
