
"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserRoundPen, Save } from "lucide-react";

import {
  editarNombre,
  type EstadoEditarNombre,
} from "@/app/acciones-perfil/editar-nombre";

import estilos from "./FormularioEditarNombre.module.css";

type Propiedades = {
  nombreActual: string;
};

const estadoInicial: EstadoEditarNombre = {
  error: "",
  exito: "",
};

export default function FormularioEditarNombre({
  nombreActual,
}: Propiedades) {
  const router = useRouter();

  const [estado, accion, pendiente] = useActionState(
    editarNombre,
    estadoInicial
  );

  useEffect(() => {
    if (estado.exito) {
      router.refresh();
    }
  }, [estado.exito, router]);

  return (
    <section className={estilos.tarjeta}>
      <div className={estilos.encabezado}>
        <div className={estilos.icono}>
          <UserRoundPen size={24} />
        </div>

        <div>
          <h2>Editar información personal</h2>
          <p>
            Actualiza tu nombre completo en SISCloud.
          </p>
        </div>
      </div>

      <form action={accion} className={estilos.formulario}>
        <div className={estilos.campo}>
          <label htmlFor="nombre">
            Nombre completo
          </label>

          <input
            key={nombreActual}
            id="nombre"
            name="nombre"
            type="text"
            defaultValue={nombreActual}
            placeholder="Ingresa tu nombre completo"
            minLength={3}
            maxLength={100}
            autoComplete="name"
            required
            disabled={pendiente}
          />

          <span className={estilos.ayuda}>
            El nombre debe tener entre 3 y 100 caracteres.
          </span>
        </div>

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
          className={estilos.botonGuardar}
          disabled={pendiente}
        >
          <Save size={18} />
          {pendiente ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </section>
  );
}
