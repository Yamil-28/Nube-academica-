
"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registrarUsuario } from "../acciones";

import estilos from "./page.module.css";

const estadoInicial = { error: "" };

export default function FormularioRegistro({ puedeCrearAdministrador }: { puedeCrearAdministrador: boolean }) {
  const [estado, accion, pendiente] = useActionState(
    registrarUsuario,
    estadoInicial
  );

  return (
    <form action={accion} className={estilos.formulario}>
      <div className={estilos.campo}>
        <label htmlFor="nombre">Nombre completo</label>
        <input
          id="nombre"
          name="nombre"
          placeholder="Ej. Juan Pérez"
          maxLength={120}
          required
        />
      </div>

      <div className={estilos.campo}>
        <label htmlFor="usuario">Nombre de usuario</label>
        <input
          id="usuario"
          name="usuario"
          placeholder="Ej. juan.perez"
          minLength={3}
          maxLength={50}
          pattern="[a-zA-Z0-9._-]{3,50}"
          required
        />
      </div>

      <div className={estilos.campo}>
        <label htmlFor="rol">Rol del usuario</label>
        <select id="rol" name="rol" defaultValue="" required>
          <option value="" disabled>
            Seleccionar rol
          </option>
          {puedeCrearAdministrador && <option value="ADMINISTRADOR">Administrador</option>}
          <option value="DOCENTE">Docente</option>
          <option value="ESTUDIANTE">Estudiante</option>
        </select>
      </div>

      <div className={estilos.campo}>
        <label htmlFor="contrasena">Contraseña</label>
        <input
          id="contrasena"
          name="contrasena"
          type="password"
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
          required
        />
      </div>

      <div className={estilos.campo}>
        <label htmlFor="confirmar">Confirmar contraseña</label>
        <input
          id="confirmar"
          name="confirmar"
          type="password"
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
          required
        />
      </div>

      {estado.error && (
        <p className={estilos.error} role="alert">
          {estado.error}
        </p>
      )}

      <div className={estilos.acciones}>
        <Link
          href="/administrador/usuarios"
          className={estilos.cancelar}
        >
          Cancelar
        </Link>

        <button
          type="submit"
          disabled={pendiente}
          className={estilos.guardar}
        >
          {pendiente ? "Registrando..." : "Registrar usuario"}
        </button>
      </div>
    </form>
  );
}
