
import "./globals.css";
import estilos from "./layout.module.css";

import CabeceraSegunRuta from "@/componentes/CabeceraSegunRuta";
import PiePagina from "@/componentes/PiePagina";

export default function DisenoPrincipal({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <div className={estilos.estructuraSistema}>
          <CabeceraSegunRuta />

          <main className={estilos.contenidoSistema}>
            {children}
          </main>

          <PiePagina />
        </div>
      </body>
    </html>
  );
}
