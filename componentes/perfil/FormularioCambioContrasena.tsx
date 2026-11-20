
"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Eye, EyeOff, Save } from "lucide-react";

import estilos from "./PerfilUsuario.module.css";

import {
  cambiarContrasena,
  type EstadoCambioContrasena,
} from "@/app/acciones-perfil/cambiar-contrasena";

const estadoInicial: EstadoCambioContrasena = {
  error: "",
  exito: "",
};

export default function FormularioCambioContrasena() {
  const router = useRouter();

  const [estado, accion, pendiente] = useActionState(
    cambiarContrasena,
    estadoInicial
  );

  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] =
    useState(false);

  useEffect(() => {
    if (estado.exito) {
      router.replace("/iniciar-sesion");
      router.refresh();
    }
  }, [estado.exito, router]);

  return (
    <section className={estilos.formularioContrasena}>
      <div className={estilos.formularioEncabezado}>
        <KeyRound size={24} />

        <div>
          <h2>Cambiar contraseña</h2>
          <p>
            Actualiza tu contraseña para mantener segura tu cuenta.
          </p>
        </div>
      </div>

      <form action={accion} className={estilos.formularioCampos}>
        {/* CONTRASEÑA ACTUAL */}
        <div className={estilos.formularioCampo}>
          <label htmlFor="contrasenaActual">
            Contraseña actual
          </label>

          <div className={estilos.formularioEntrada}>
            <input
              id="contrasenaActual"
              name="contrasenaActual"
              type={mostrarActual ? "text" : "password"}
              autoComplete="current-password"
              required
            />

            <button
              type="button"
              onClick={() => setMostrarActual(!mostrarActual)}
              aria-label={
                mostrarActual
                  ? "Ocultar contraseña actual"
                  : "Mostrar contraseña actual"
              }
            >
              {mostrarActual ? (
                <EyeOff size={19} />
              ) : (
                <Eye size={19} />
              )}
            </button>
          </div>
        </div>

        {/* NUEVA CONTRASEÑA */}
        <div className={estilos.formularioCampo}>
          <label htmlFor="nuevaContrasena">
            Nueva contraseña
          </label>

          <div className={estilos.formularioEntrada}>
            <input
              id="nuevaContrasena"
              name="nuevaContrasena"
              type={mostrarNueva ? "text" : "password"}
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              required
            />

            <button
              type="button"
              onClick={() => setMostrarNueva(!mostrarNueva)}
              aria-label={
                mostrarNueva
                  ? "Ocultar nueva contraseña"
                  : "Mostrar nueva contraseña"
              }
            >
              {mostrarNueva ? (
                <EyeOff size={19} />
              ) : (
                <Eye size={19} />
              )}
            </button>
          </div>
        </div>

        {/* CONFIRMAR CONTRASEÑA */}
        <div className={estilos.formularioCampo}>
          <label htmlFor="confirmarContrasena">
            Confirmar nueva contraseña
          </label>

          <div className={estilos.formularioEntrada}>
            <input
              id="confirmarContrasena"
              name="confirmarContrasena"
              type={mostrarConfirmacion ? "text" : "password"}
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              required
            />

            <button
              type="button"
              onClick={() =>
                setMostrarConfirmacion(!mostrarConfirmacion)
              }
              aria-label={
                mostrarConfirmacion
                  ? "Ocultar confirmación"
                  : "Mostrar confirmación"
              }
            >
              {mostrarConfirmacion ? (
                <EyeOff size={19} />
              ) : (
                <Eye size={19} />
              )}
            </button>
          </div>
        </div>

        {/* INDICACIONES */}
        <p className={estilos.formularioAyuda}>
          La contraseña debe tener entre 8 y 72 caracteres
          e incluir letras y números.
        </p>

        {/* MENSAJES */}
        {estado.error && (
          <p className={estilos.formularioError} role="alert">
            {estado.error}
          </p>
        )}

        {estado.exito && (
          <p className={estilos.formularioExito} role="status">
            {estado.exito}
          </p>
        )}

        {/* BOTÓN GUARDAR */}
        <button
          type="submit"
          disabled={pendiente || Boolean(estado.exito)}
          className={estilos.formularioGuardar}
        >
          <Save size={18} />
          {pendiente ? "Guardando..." : "Cambiar contraseña"}
        </button>
      </form>
    </section>
  );
}
