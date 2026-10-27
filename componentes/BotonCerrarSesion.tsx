
"use client";

import { useState } from "react";

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
      establecerError("Error al cerrar sesión. Inténtalo nuevamente.");
      establecerCerrando(false);
    }
  }

  return (
    <div className="contenedor-cerrar-sesion">
      <button
        type="button"
        className="boton-cerrar-sesion"
        onClick={salir}
        disabled={cerrando}
      >
        {cerrando ? "Cerrando sesión..." : "Cerrar sesión"}
      </button>

      {error && (
        <p className="mensaje-cerrar-sesion" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
