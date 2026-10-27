
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  ChevronDown,
  Cloud,
  LogOut,
  Menu,
  Settings,
  UserRound,
} from "lucide-react";

import type { RolUsuario } from "@/lib/sesion";

type Propiedades = {
  usuario: string;
  rol: RolUsuario;
  abrirMenu: () => void;
};

const nombresRoles: Record<RolUsuario, string> = {
  ADMINISTRADOR: "Administrador",
  DOCENTE: "Docente",
  ESTUDIANTE: "Estudiante",
};

export default function EncabezadoDashboard({
  usuario,
  rol,
  abrirMenu,
}: Propiedades) {
  const [perfilAbierto, establecerPerfilAbierto] = useState(false);
  const [cerrando, establecerCerrando] = useState(false);

  const rutaBase =
    rol === "ADMINISTRADOR"
      ? "/administrador"
      : rol === "DOCENTE"
        ? "/docente"
        : "/estudiante";

  async function cerrarSesion() {
    if (cerrando) return;

    establecerCerrando(true);

    try {
      const respuesta = await fetch("/api/cerrar-sesion", {
        method: "POST",
        credentials: "same-origin",
      });

      if (!respuesta.ok) {
        throw new Error("No se pudo cerrar sesión");
      }

      window.location.replace("/iniciar-sesion");
    } catch {
      alert("No se pudo cerrar sesión. Inténtalo nuevamente.");
      establecerCerrando(false);
    }
  }

  return (
    <header className="dashboard-encabezado">
      <div className="dashboard-encabezado-izquierda">
        <button
          type="button"
          className="dashboard-boton-icono"
          onClick={abrirMenu}
          aria-label="Abrir menú lateral"
        >
          <Menu size={22} />
        </button>

        <Link href={rutaBase} className="dashboard-marca">
          <div className="dashboard-marca-icono">
            <Cloud size={23} />
          </div>

          <div>
            <strong>SISCloud</strong>
            <small>Nube académica EMI</small>
          </div>
        </Link>
      </div>

      <div className="dashboard-encabezado-derecha">
        <button
          type="button"
          className="dashboard-boton-icono"
          aria-label="Notificaciones"
          title="Notificaciones"
        >
          <Bell size={20} />
        </button>

        <div className="dashboard-perfil-contenedor">
          <button
            type="button"
            className="dashboard-perfil-boton"
            onClick={() => establecerPerfilAbierto(!perfilAbierto)}
            aria-expanded={perfilAbierto}
          >
            <span className="dashboard-avatar">
              <UserRound size={21} />
            </span>

            <span className="dashboard-perfil-datos">
              <strong>Hola, {usuario}</strong>
              <small>{nombresRoles[rol]}</small>
            </span>

            <ChevronDown size={16} />
          </button>

          {perfilAbierto && (
            <div className="dashboard-perfil-menu">
              <div className="dashboard-perfil-menu-info">
                <strong>{usuario}</strong>
                <span>{nombresRoles[rol]}</span>
              </div>

              <Link
                href={`${rutaBase}/perfil`}
                onClick={() => establecerPerfilAbierto(false)}
              >
                <UserRound size={17} />
                Mi perfil
              </Link>

              <Link
                href={`${rutaBase}/configuracion`}
                onClick={() => establecerPerfilAbierto(false)}
              >
                <Settings size={17} />
                Configuración
              </Link>

              <button
                type="button"
                onClick={cerrarSesion}
                disabled={cerrando}
                className="dashboard-opcion-salir"
              >
                <LogOut size={17} />
                {cerrando ? "Cerrando..." : "Cerrar sesión"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
