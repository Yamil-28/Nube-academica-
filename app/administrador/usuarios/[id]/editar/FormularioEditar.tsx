
"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  actualizarUsuario,
  type EstadoEdicion,
} from "../../editar-acciones";

import estilos from "./page.module.css";

type Cuenta = {
  id: number;
  nombre: string;
  usuario: string;
  rol: "ADMINISTRADOR" | "DOCENTE" | "ESTUDIANTE";
  activo: boolean;
};

type Propiedades = {
  cuenta: Cuenta;
  esCuentaPropia: boolean;
};

const estadoInicial: EstadoEdicion = {
  error: "",
  exito: "",
};

export default function FormularioEditar({
  cuenta,
  esCuentaPropia,
}: Propiedades) {
  const [estado, accion, pendiente] = useActionState(
    actualizarUsuario.bind(null, cuenta.id),
    estadoInicial
  );

  return (
    <form action={accion} className={estilos.formulario}>
      <div className={estilos.campo}>
        <label htmlFor="nombre">Nombre completo</label>
        <input
          id="nombre"
          name="nombre"
          defaultValue={cuenta.nombre}
          maxLength={120}
          required
        />
      </div>

      <div className={estilos.campo}>
        <label htmlFor="usuario">Nombre de usuario</label>
        <input
          id="usuario"
          name="usuario"
          defaultValue={cuenta.usuario}
          minLength={3}
          maxLength={50}
          pattern="[a-zA-Z0-9._-]{3,50}"
          readOnly={esCuentaPropia}
          required
        />
      </div>

      <div className={estilos.campo}>
        <label htmlFor="rol">Rol</label>
        <select
          id="rol"
          name="rol"
          defaultValue={cuenta.rol}
          disabled={esCuentaPropia}
          required
        >
          <option value="ADMINISTRADOR">Administrador</option>
          <option value="DOCENTE">Docente</option>
          <option value="ESTUDIANTE">Estudiante</option>
        </select>

        {esCuentaPropia && (
          <input type="hidden" name="rol" value={cuenta.rol} />
        )}
      </div>

      <div className={estilos.campo}>
        <label htmlFor="activo">Estado de la cuenta</label>
        <select
          id="activo"
          name="activo"
          defaultValue={String(cuenta.activo)}
          disabled={esCuentaPropia}
        >
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>

        {esCuentaPropia && (
          <input
            type="hidden"
            name="activo"
            value={String(cuenta.activo)}
          />
        )}
      </div>

      {esCuentaPropia && (
        <p className={estilos.aviso}>
          Por seguridad, no puedes modificar tu propio rol,
          estado o nombre de usuario desde esta pantalla.
        </p>
      )}

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

      <div className={estilos.acciones}>
        <Link
          href="/administrador/usuarios"
          className={estilos.cancelar}
        >
          Volver
        </Link>

        <button
          type="submit"
          disabled={pendiente}
          className={estilos.guardar}
        >
          {pendiente ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
