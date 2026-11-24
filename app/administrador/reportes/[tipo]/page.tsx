import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";

import { Suspense } from "react";

import VistaReporte from "@/componentes/informes/VistaReporte";


type Propiedades = {
  params: Promise<{ tipo: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Reportes del rol Administrador (la definición se elige por [tipo])
export default function PaginaReporteAdministrador({ params, searchParams }: Propiedades) {
  return (
    <Suspense fallback={<CargandoDashboard />}>
      <VistaReporte rol="ADMINISTRADOR" parametros={params} busqueda={searchParams} />
    </Suspense>
  );
}
