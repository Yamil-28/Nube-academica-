
import { Suspense } from "react";

import VistaReporte from "@/componentes/informes/VistaReporte";

import estilos from "@/componentes/informes/PaginaInforme.module.css";

type Propiedades = {
  params: Promise<{ tipo: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Reportes del rol Docente (la definición se elige por [tipo])
export default function PaginaReporteDocente({ params, searchParams }: Propiedades) {
  return (
    <Suspense fallback={<p className={estilos.cargando}>Generando reporte...</p>}>
      <VistaReporte rol="DOCENTE" parametros={params} busqueda={searchParams} />
    </Suspense>
  );
}
