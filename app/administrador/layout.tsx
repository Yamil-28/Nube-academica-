
import { Suspense, type ReactNode } from "react";

import { protegerRuta } from "@/lib/protegerRuta";
import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";

type Propiedades = {
  children: ReactNode;
};

async function ContenidoLayout({
  children,
}: Propiedades) {
  const sesion = await protegerRuta("ADMINISTRADOR");

  return (
    <EstructuraDashboard
      usuario={sesion.usuario}
      rol={sesion.rol}
    >
      {children}
    </EstructuraDashboard>
  );
}

export default function LayoutAdministrador({
  children,
}: Propiedades) {
  return (
    <Suspense fallback={null}>
      <ContenidoLayout>
        {children}
      </ContenidoLayout>
    </Suspense>
  );
}
