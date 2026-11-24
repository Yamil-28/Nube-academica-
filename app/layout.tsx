
import "./globals.css";
import estilos from "./layout.module.css";

import { Suspense } from "react";

import CabeceraSegunRuta, { PiePublico } from "@/componentes/CabeceraSegunRuta";
import ProveedorTema from "@/componentes/tema/ProveedorTema";

export default function DisenoPrincipal({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <ProveedorTema>
          <div className={estilos.estructuraSistema}>
            <Suspense fallback={null}>
              <CabeceraSegunRuta />
            </Suspense>

            <div className={estilos.contenidoSistema}>
              {children}
            </div>

            <Suspense fallback={null}>
              <PiePublico />
            </Suspense>
          </div>
        </ProveedorTema>
      </body>
    </html>
  );
}
