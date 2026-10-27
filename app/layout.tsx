
import "./globals.css";
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
        <div className="estructura-sistema">
          <CabeceraSegunRuta />

          <main className="contenido-sistema">
            {children}
          </main>

          <PiePagina />
        </div>
      </body>
    </html>
  );
}
