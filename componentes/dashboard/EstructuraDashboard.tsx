
"use client";

import { useState, type ReactNode } from "react";
import BarraLateral from "./BarraLateral";
import EncabezadoDashboard from "./EncabezadoDashboard";
import type { RolUsuario } from "@/lib/sesion";

type Propiedades = {
  usuario: string;
  rol: RolUsuario;
  children: ReactNode;
};

export default function EstructuraDashboard({
  usuario,
  rol,
  children,
}: Propiedades) {
  const [menuAbierto, establecerMenuAbierto] = useState(false);

  return (
    <div className="dashboard-estructura">
      <EncabezadoDashboard
        usuario={usuario}
        rol={rol}
        abrirMenu={() => establecerMenuAbierto(!menuAbierto)}
      />

      <BarraLateral
        rol={rol}
        abierto={menuAbierto}
        cerrar={() => establecerMenuAbierto(false)}
      />

      <main className="dashboard-contenido">
        {children}
      </main>
    </div>
  );
}
