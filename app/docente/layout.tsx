
import { Suspense, type ReactNode } from "react";

import { protegerRuta } from "@/lib/protegerRuta";
import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";
import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";

type Propiedades = {
  children: ReactNode;
};

async function ContenidoLayout({
  children,
}: Propiedades) {
  const sesion = await protegerRuta("DOCENTE");

  return (
    <EstructuraDashboard
      usuario={sesion.usuario}
      rol={sesion.rol}
      fotoRevision={sesion.fotoPerfil?.revision}
    >
      {children}
    </EstructuraDashboard>
  );
}

export default function LayoutDocente({
  children,
}: Propiedades) {
  return (
    <Suspense fallback={<CargandoDashboard />}>
      <ContenidoLayout>
        {children}
      </ContenidoLayout>
    </Suspense>
  );
}
