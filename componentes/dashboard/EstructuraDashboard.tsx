"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import PiePagina from "@/componentes/PiePagina";
import NavegacionInterna from "./NavegacionInterna";
import BarraLateral from "./BarraLateral";
import EncabezadoDashboard from "./EncabezadoDashboard";

import type { RolUsuario } from "@/lib/sesion";
import estilos from "./EstructuraDashboard.module.css";

const DashboardContext = createContext(false);

type Propiedades = {
  usuario: string;
  rol: RolUsuario;
  fotoRevision?: string;
  children: ReactNode;
};

export default function EstructuraDashboard({
  usuario,
  rol,
  fotoRevision,
  children,
}: Propiedades) {
  const dashboardExistente = useContext(DashboardContext);
  const [menuAbierto, establecerMenuAbierto] = useState(false);

  if (dashboardExistente) return <>{children}</>;

  return (
    <DashboardContext.Provider value={true}>
      <div
        className={estilos.dashboardEstructura}
        data-dashboard="siscloud"
      >
        <EncabezadoDashboard
          usuario={usuario}
          rol={rol}
          fotoRevision={fotoRevision}
          abrirMenu={() => establecerMenuAbierto(!menuAbierto)}
        />

        <BarraLateral
          rol={rol}
          abierto={menuAbierto}
          cerrar={() => establecerMenuAbierto(false)}
        />

        <main className={estilos.dashboardContenido}>
          <NavegacionInterna rol={rol} />
          {children}
        </main>

        <div className={estilos.dashboardPie}>
          <PiePagina mostrarEnlaces />
        </div>
      </div>
    </DashboardContext.Provider>
  );
}
