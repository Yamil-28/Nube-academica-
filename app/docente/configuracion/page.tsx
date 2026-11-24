import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";

import { Suspense } from "react";

import ConfiguracionUsuario from "@/componentes/configuracion/ConfiguracionUsuario";
import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import { protegerRuta } from "@/lib/protegerRuta";

async function ContenidoConfiguracionDocente() {
  const sesion = await protegerRuta("DOCENTE");

  return (
    <EstructuraDashboard
      usuario={sesion.usuario}
      rol={sesion.rol}
    >
      <ConfiguracionUsuario rol="DOCENTE" />
    </EstructuraDashboard>
  );
}

export default function PaginaConfiguracionDocente() {
  return (
    <Suspense fallback={<CargandoDashboard />}>
      <ContenidoConfiguracionDocente />
    </Suspense>
  );
}
