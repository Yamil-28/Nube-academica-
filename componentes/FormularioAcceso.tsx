
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import CaptchaLetras from "./CaptchaLetras";

export default function FormularioAcceso() {
  const router = useRouter();

  const [usuario, establecerUsuario] = useState("");
  const [contrasena, establecerContrasena] = useState("");
  const [mostrarContrasena, establecerMostrarContrasena] =
    useState(false);

  const [codigoCaptcha, establecerCodigoCaptcha] = useState("");
  const [versionCaptcha, establecerVersionCaptcha] = useState(0);

  const [mensaje, establecerMensaje] = useState("");
  const [procesando, establecerProcesando] = useState(false);

  // Generar un nuevo CAPTCHA
  function actualizarCaptcha() {
    establecerCodigoCaptcha("");
    establecerVersionCaptcha((anterior) => anterior + 1);
  }

  // Iniciar sesión
  async function iniciarSesion(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!usuario.trim() || !contrasena || codigoCaptcha.length !== 5) {
      establecerMensaje(
        "Completa el usuario, la contraseña y los cinco caracteres del CAPTCHA."
      );
      return;
    }

    establecerProcesando(true);
    establecerMensaje("");

    try {
      const respuesta = await fetch("/api/iniciar-sesion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          usuario: usuario.trim(),
          contrasena,
          codigoCaptcha,
        }),
      });

      const resultado = await respuesta.json();

      if (respuesta.ok && resultado.correcto) {
        establecerMensaje("Inicio de sesión correcto. Redirigiendo...");

        // Solo permitir rutas conocidas
        const rutasPermitidas = [
          "/administrador",
          "/docente",
          "/estudiante",
        ];

        if (
          typeof resultado.ruta === "string" &&
          rutasPermitidas.includes(resultado.ruta)
        ) {
          router.replace(resultado.ruta);
          router.refresh();
          return;
        }

        establecerMensaje("El servidor devolvió una ruta no válida.");
      } else {
        establecerMensaje(
          resultado.mensaje || "No se pudo iniciar sesión."
        );
      }
    } catch {
      establecerMensaje(
        "Error de conexión. Inténtalo nuevamente."
      );
    } finally {
      establecerProcesando(false);
      actualizarCaptcha();
    }
  }

  return (
    <form className="formulario-acceso" onSubmit={iniciarSesion}>
      <div className="acceso-encabezado">
        <span className="acceso-etiqueta">
          ACCESO INSTITUCIONAL
        </span>

        <h2>Iniciar sesión</h2>

        <p>
          Ingresa tus credenciales para acceder a SISCloud.
        </p>
      </div>

      {/* USUARIO */}
      <div className="campo-formulario">
        <label htmlFor="usuario">Usuario</label>

        <input
          id="usuario"
          type="text"
          placeholder="Ingresa tu usuario"
          autoComplete="username"
          value={usuario}
          onChange={(evento) =>
            establecerUsuario(evento.target.value)
          }
          disabled={procesando}
          required
        />
      </div>

      {/* CONTRASEÑA */}
      <div className="campo-formulario">
        <label htmlFor="contrasena">Contraseña</label>

        <div className="campo-contrasena">
          <input
            id="contrasena"
            type={mostrarContrasena ? "text" : "password"}
            placeholder="Ingresa tu contraseña"
            autoComplete="current-password"
            value={contrasena}
            onChange={(evento) =>
              establecerContrasena(evento.target.value)
            }
            disabled={procesando}
            required
          />

          <button
            type="button"
            onClick={() =>
              establecerMostrarContrasena(!mostrarContrasena)
            }
            disabled={procesando}
          >
            {mostrarContrasena ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </div>

      {/* CAPTCHA */}
      <CaptchaLetras
        codigo={codigoCaptcha}
        establecerCodigo={establecerCodigoCaptcha}
        version={versionCaptcha}
        actualizar={actualizarCaptcha}
      />

      {/* MENSAJES */}
      {mensaje && (
        <p className="mensaje-acceso" role="status">
          {mensaje}
        </p>
      )}

      {/* BOTÓN DE INGRESO */}
      <button
        type="submit"
        className="boton-acceso"
        disabled={procesando || codigoCaptcha.length !== 5}
      >
        {procesando
          ? "Verificando credenciales..."
          : "Ingresar al sistema →"}
      </button>

      <p className="acceso-nota">
        Sistema de Gestión de Proyectos Académicos
      </p>
    </form>
  );
}
