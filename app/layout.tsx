
import type { Metadata } from "next";
import Encabezado from "@/componentes/Encabezado";
import PiePagina from "@/componentes/PiePagina";
import "./globals.css";

export const metadata: Metadata = {
  title: "SISCloud | Gestión de Proyectos Académicos",
  description:
    "Plataforma de gestión, organización y seguimiento de proyectos académicos.",
};

export default function DisenoPrincipal({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">
        <Encabezado />

        <main className="flex-1">{children}</main>

        <PiePagina />
      </body>
    </html>
  );
}
