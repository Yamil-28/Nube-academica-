
import "./globals.css";
import estilos from "./layout.module.css";

import { Suspense } from "react";

import CabeceraSegunRuta from "@/componentes/CabeceraSegunRuta";
import PiePagina from "@/componentes/PiePagina";
import ProveedorTema from "@/componentes/tema/ProveedorTema";

export default function DisenoPrincipal({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ProveedorTema>
          <div className={estilos.estructuraSistema}>
            <Suspense fallback={null}>
              <CabeceraSegunRuta />
            </Suspense>

            <main className={estilos.contenidoSistema}>
              {children}
            </main>

            <PiePagina />
          </div>
        </ProveedorTema>
      </body>
    </html>
  );
}
