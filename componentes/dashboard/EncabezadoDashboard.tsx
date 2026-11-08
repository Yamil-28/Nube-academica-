
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
import estilos from "./EncabezadoDashboard.module.css";

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
    <header className={estilos.dashboardEncabezado}>
      <div className={estilos.dashboardEncabezadoIzquierda}>
        <button
          type="button"
          className={estilos.dashboardBotonIcono}
          onClick={abrirMenu}
          aria-label="Abrir menú lateral"
        >
          <Menu size={22} />
        </button>

        <Link href={rutaBase} className={estilos.dashboardMarca}>
          <div className={estilos.dashboardMarcaIcono}>
            <Cloud size={23} />
          </div>

          <div>
            <strong>SISCloud</strong>
            <small>Nube académica EMI</small>
          </div>
        </Link>
      </div>

      <div className={estilos.dashboardEncabezadoDerecha}>
        <button
          type="button"
          className={estilos.dashboardBotonIcono}
          aria-label="Notificaciones"
          title="Notificaciones"
        >
          <Bell size={20} />
        </button>

        <div className={estilos.dashboardPerfilContenedor}>
          <button
            type="button"
            className={estilos.dashboardPerfilBoton}
            onClick={() => establecerPerfilAbierto(!perfilAbierto)}
            aria-expanded={perfilAbierto}
          >
            <span className={estilos.dashboardAvatar}>
              <UserRound size={21} />
            </span>

            <span className={estilos.dashboardPerfilDatos}>
              <strong>Hola, {usuario}</strong>
              <small>{nombresRoles[rol]}</small>
            </span>

            <ChevronDown size={16} />
          </button>

          {perfilAbierto && (
            <div className={estilos.dashboardPerfilMenu}>
              <div className={estilos.dashboardPerfilMenuInfo}>
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
                className={estilos.dashboardOpcionSalir}
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
