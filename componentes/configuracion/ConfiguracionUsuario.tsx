
"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Settings,
  Sun,
  Moon,
  Check,
  Palette,
} from "lucide-react";

import type { RolUsuario } from "@/lib/sesion";
import { usarTema } from "@/componentes/tema/ProveedorTema";

import estilos from "./ConfiguracionUsuario.module.css";

type Propiedades = {
  rol: RolUsuario;
};

const nombresRoles: Record<RolUsuario, string> = {
  ADMINISTRADOR: "Administrador",
  DOCENTE: "Docente",
  ESTUDIANTE: "Estudiante",
};

export default function ConfiguracionUsuario({
  rol,
}: Propiedades) {
  const { tema, cambiarTema } = usarTema();

  const rutaInicio =
    rol === "ADMINISTRADOR"
      ? "/administrador"
      : rol === "DOCENTE"
        ? "/docente"
        : "/estudiante";

  return (
    <div className={estilos.pagina}>
      {/* VOLVER AL DASHBOARD */}
      <Link href={rutaInicio} className={estilos.volver}>
        <ArrowLeft size={18} />
        Volver al Dashboard
      </Link>

      {/* ENCABEZADO */}
      <div className={estilos.encabezado}>
        <span className={estilos.etiqueta}>
          PREFERENCIAS DEL SISTEMA
        </span>

        <div className={estilos.titulo}>
          <Settings size={28} />
          <h1>Configuración</h1>
        </div>

        <p>
          Personaliza la apariencia de SISCloud según tus
          preferencias.
        </p>
      </div>

      {/* TARJETA DE APARIENCIA */}
      <section className={estilos.tarjeta}>
        <div className={estilos.tarjetaEncabezado}>
          <div className={estilos.iconoSeccion}>
            <Palette size={24} />
          </div>

          <div>
            <h2>Apariencia</h2>
            <p>
              Selecciona el tema visual que deseas utilizar.
            </p>
          </div>
        </div>

        {/* OPCIONES DE TEMA */}
        <div
          className={estilos.opciones}
          role="group"
          aria-label="Seleccionar tema de apariencia"
        >
          {/* MODO CLARO */}
          <button
            type="button"
            onClick={() => cambiarTema("claro")}
            aria-pressed={tema === "claro"}
            className={`${estilos.opcion} ${
              tema === "claro" ? estilos.seleccionada : ""
            }`}
          >
            <div className={estilos.vistaClaro}>
              <div className={estilos.vistaBarraClaro} />
              <div className={estilos.vistaContenidoClaro}>
                <span />
                <span />
                <span />
              </div>
            </div>

            <div className={estilos.opcionInferior}>
              <div className={estilos.opcionTexto}>
                <Sun size={20} />
                <span>Modo claro</span>
              </div>

              {tema === "claro" && (
                <Check size={20} className={estilos.marca} />
              )}
            </div>
          </button>

          {/* MODO OSCURO */}
          <button
            type="button"
            onClick={() => cambiarTema("oscuro")}
            aria-pressed={tema === "oscuro"}
            className={`${estilos.opcion} ${
              tema === "oscuro" ? estilos.seleccionada : ""
            }`}
          >
            <div className={estilos.vistaOscuro}>
              <div className={estilos.vistaBarraOscuro} />
              <div className={estilos.vistaContenidoOscuro}>
                <span />
                <span />
                <span />
              </div>
            </div>

            <div className={estilos.opcionInferior}>
              <div className={estilos.opcionTexto}>
                <Moon size={20} />
                <span>Modo oscuro</span>
              </div>

              {tema === "oscuro" && (
                <Check size={20} className={estilos.marca} />
              )}
            </div>
          </button>
        </div>

        <p className={estilos.nota}>
          El tema seleccionado se guarda automáticamente
          en este navegador.
        </p>
      </section>

      {/* INFORMACIÓN */}
      <section className={estilos.informacion}>
        <strong>Configuración personal</strong>
        <p>
          Estas preferencias están disponibles para el rol
          {" "}{nombresRoles[rol]}. Por ahora se guardan
          en el navegador y no modifican los permisos
          de tu cuenta.
        </p>
      </section>
    </div>
  );
}
