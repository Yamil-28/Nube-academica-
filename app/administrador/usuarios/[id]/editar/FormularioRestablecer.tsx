
"use client";

import { useActionState, useState } from "react";
import { KeyRound, Eye, EyeOff } from "lucide-react";

import {
  restablecerContrasena,
  type EstadoRestablecimiento,
} from "../../restablecer-acciones";

import estilos from "./page.module.css";

const estadoInicial: EstadoRestablecimiento = {
  error: "",
  exito: "",
};

export default function FormularioRestablecer({
  idUsuario,
}: {
  idUsuario: number;
}) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const [estado, accion, pendiente] = useActionState(
    restablecerContrasena.bind(null, idUsuario),
    estadoInicial
  );

  return (
    <div className={estilos.seccionContrasena}>
      <div className={estilos.cabeceraContrasena}>
        <div>
          <h2>Seguridad de la cuenta</h2>
          <p>
            Restablece la contraseña de este usuario.
          </p>
        </div>

        <button
          type="button"
          className={estilos.botonRestablecer}
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          <KeyRound size={17} />
          {mostrarFormulario ? "Cancelar" : "Restablecer contraseña"}
        </button>
      </div>

      {mostrarFormulario && (
        <form action={accion} className={estilos.formularioContrasena}>
          <div className={estilos.campo}>
            <label htmlFor="nuevaContrasena">
              Nueva contraseña
            </label>

            <div className={estilos.entradaContrasena}>
              <input
                id="nuevaContrasena"
                name="nuevaContrasena"
                type={mostrarContrasena ? "text" : "password"}
                minLength={8}
                maxLength={72}
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                onClick={() => setMostrarContrasena(!mostrarContrasena)}
                aria-label={
                  mostrarContrasena
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
              >
                {mostrarContrasena ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          <div className={estilos.campo}>
            <label htmlFor="confirmarContrasena">
              Confirmar contraseña
            </label>

            <input
              id="confirmarContrasena"
              name="confirmarContrasena"
              type={mostrarContrasena ? "text" : "password"}
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
              required
            />
          </div>

          <p className={estilos.ayudaContrasena}>
            Utiliza entre 8 y 72 caracteres, incluyendo letras y números.
          </p>

          {estado.error && (
            <p className={estilos.error} role="alert">
              {estado.error}
            </p>
          )}

          {estado.exito && (
            <p className={estilos.exito} role="status">
              {estado.exito}
            </p>
          )}

          <button
            type="submit"
            disabled={pendiente}
            className={estilos.guardar}
          >
            {pendiente
              ? "Restableciendo..."
              : "Guardar nueva contraseña"}
          </button>
        </form>
      )}
    </div>
  );
}
