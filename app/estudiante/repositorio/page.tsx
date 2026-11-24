import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";

import { Suspense } from "react";

import { protegerRuta } from "@/lib/protegerRuta";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import RepositorioPendiente from "@/componentes/informes/RepositorioPendiente";

async function ContenidoRepositorioEstudiante() {
  const usuario = await protegerRuta("ESTUDIANTE");

  return (
    <EstructuraDashboard usuario={usuario.usuario} rol={usuario.rol}>
      <RepositorioPendiente
        descripcion="Consulta proyectos finalizados de la Carrera según tus permisos."
      />
    </EstructuraDashboard>
  );
}

export default function PaginaRepositorioEstudiante() {
  return (
    <Suspense fallback={<CargandoDashboard />}>
      <ContenidoRepositorioEstudiante />
    </Suspense>
  );
}
