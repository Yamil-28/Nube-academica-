import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";

import { Suspense } from "react";

import { protegerRuta } from "@/lib/protegerRuta";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import RepositorioPendiente from "@/componentes/informes/RepositorioPendiente";

async function ContenidoRepositorioDocente() {
  const usuario = await protegerRuta("DOCENTE");

  return (
    <EstructuraDashboard usuario={usuario.usuario} rol={usuario.rol}>
      <RepositorioPendiente
        descripcion="Busca proyectos finalizados de gestiones anteriores para usarlos como referencia."
      />
    </EstructuraDashboard>
  );
}

export default function PaginaRepositorioDocente() {
  return (
    <Suspense fallback={<CargandoDashboard />}>
      <ContenidoRepositorioDocente />
    </Suspense>
  );
}
