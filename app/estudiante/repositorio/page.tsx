
import { Suspense } from "react";

import { protegerRuta } from "@/lib/protegerRuta";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import RepositorioPendiente from "@/componentes/informes/RepositorioPendiente";

import estilos from "@/componentes/informes/PaginaInforme.module.css";

async function ContenidoRepositorioEstudiante() {
  const usuario = await protegerRuta("ESTUDIANTE");

  return (
    <EstructuraDashboard usuario={usuario.usuario} rol={usuario.rol}>
      <RepositorioPendiente
        rutaInicio="/estudiante"
        descripcion="Consulta proyectos finalizados de la Carrera según tus permisos."
      />
    </EstructuraDashboard>
  );
}

export default function PaginaRepositorioEstudiante() {
  return (
    <Suspense fallback={<p className={estilos.cargando}>Cargando repositorio...</p>}>
      <ContenidoRepositorioEstudiante />
    </Suspense>
  );
}
