
import { Suspense } from "react";

import ConfiguracionUsuario from "@/componentes/configuracion/ConfiguracionUsuario";
import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import { protegerRuta } from "@/lib/protegerRuta";

async function ContenidoConfiguracionAdministrador() {
  const sesion = await protegerRuta("ADMINISTRADOR");

  return (
    <EstructuraDashboard
      usuario={sesion.usuario}
      rol={sesion.rol}
    >
      <ConfiguracionUsuario rol="ADMINISTRADOR" />
    </EstructuraDashboard>
  );
}

export default function PaginaConfiguracionAdministrador() {
  return (
    <Suspense fallback={<p>Cargando configuracion...</p>}>
      <ContenidoConfiguracionAdministrador />
    </Suspense>
  );
}
