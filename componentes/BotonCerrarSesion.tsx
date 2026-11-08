
"use client";

import { useState } from "react";
import estilos from "./BotonCerrarSesion.module.css";

export default function BotonCerrarSesion() {
  const [cerrando, establecerCerrando] = useState(false);
  const [error, establecerError] = useState("");

  async function salir() {
    if (cerrando) return;

    establecerCerrando(true);
    establecerError("");

    try {
      const respuesta = await fetch("/api/cerrar-sesion", {
        method: "POST",
        credentials: "same-origin",
      });

      if (!respuesta.ok) {
        throw new Error("No se pudo cerrar la sesión.");
      }

      // Recargar la aplicación sin conservar
      // el estado anterior de los paneles.
      window.location.replace("/iniciar-sesion");
    } catch {
      establecerError(
        "Error al cerrar sesión. Inténtalo nuevamente."
      );
      establecerCerrando(false);
    }
  }

  return (
    <div className={estilos.contenedor}>
      <button
        type="button"
        className={estilos.boton}
        onClick={salir}
        disabled={cerrando}
      >
        {cerrando ? "Cerrando sesión..." : "Cerrar sesión"}
      </button>

      {error && (
        <p className={estilos.mensaje} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
