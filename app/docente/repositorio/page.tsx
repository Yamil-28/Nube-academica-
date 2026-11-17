
import { Suspense } from "react";

import { protegerRuta } from "@/lib/protegerRuta";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import RepositorioPendiente from "@/componentes/informes/RepositorioPendiente";

import estilos from "@/componentes/informes/PaginaInforme.module.css";

async function ContenidoRepositorioDocente() {
  const usuario = await protegerRuta("DOCENTE");

  return (
    <EstructuraDashboard usuario={usuario.usuario} rol={usuario.rol}>
      <RepositorioPendiente
        rutaInicio="/docente"
        descripcion="Busca proyectos finalizados de gestiones anteriores para usarlos como referencia."
      />
    </EstructuraDashboard>
  );
}

export default function PaginaRepositorioDocente() {
  return (
    <Suspense fallback={<p className={estilos.cargando}>Cargando repositorio...</p>}>
      <ContenidoRepositorioDocente />
    </Suspense>
  );
}
