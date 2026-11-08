
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

import estilos from "./EncabezadoInstitucional.module.css";

export default function EncabezadoInstitucional() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [serviciosAbierto, setServiciosAbierto] = useState(false);
  const [estudiantesAbierto, setEstudiantesAbierto] = useState(false);

  return (
    <header className={estilos.encabezado}>
      <div className={estilos.navegacion}>
        <div className={estilos.marca}>
          <Image
            src="/imagenes/emi.jpg"
            alt="Escudo de la Escuela Militar de Ingeniería"
            width={65}
            height={65}
          />

          <div className={estilos.marcaTexto}>
            <strong>EMI</strong>
            <span>Escuela Militar de Ingeniería</span>
          </div>
        </div>

        <button
          type="button"
          className={estilos.menuMovil}
          aria-label="Abrir menú"
          aria-expanded={menuAbierto}
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          {menuAbierto ? <X /> : <Menu />}
        </button>

        <nav
          className={`${estilos.enlaces} ${
            menuAbierto ? estilos.enlacesAbiertos : ""
          }`}
        >
          <span className={estilos.enlaceInactivo}>
            ACADÉMICA <ChevronDown size={17} />
          </span>

          <span className={estilos.enlaceInactivo}>
            INVESTIGACIÓN <ChevronDown size={17} />
          </span>

          <span className={estilos.enlaceInactivo}>
            INTERACCIÓN SOCIAL <ChevronDown size={17} />
          </span>

          <div className={estilos.menuServicios}>
            <button
              type="button"
              className={`${estilos.botonServicios} ${
                serviciosAbierto ? estilos.botonActivo : ""
              }`}
              onClick={() => {
                setServiciosAbierto(!serviciosAbierto);
                setEstudiantesAbierto(false);
              }}
              aria-expanded={serviciosAbierto}
            >
              SERVICIOS <ChevronDown size={18} />
            </button>

            {serviciosAbierto && (
              <div className={estilos.desplegable}>
                <span className={estilos.opcion}>
                  Estudiantes Nuevos <ChevronRight size={17} />
                </span>

                <button
                  type="button"
                  className={`${estilos.opcion} ${estilos.opcionBoton} ${
                    estudiantesAbierto ? estilos.opcionActiva : ""
                  }`}
                  onClick={() =>
                    setEstudiantesAbierto(!estudiantesAbierto)
                  }
                  aria-expanded={estudiantesAbierto}
                >
                  Estudiantes Regulares
                  <ChevronRight size={17} />
                </button>

                {estudiantesAbierto && (
                  <div className={estilos.submenu}>
                    <span>Inscripciones</span>
                    <span>Calendario Académico</span>
                    <span>Notas</span>
                    <span>Trabajos de Grado</span>

                    <Link
                      href="/iniciar-sesion"
                      className={estilos.enlaceSiscloud}
                    >
                      SISCloud
                      <ChevronRight size={18} />
                    </Link>
                  </div>
                )}

                <span className={estilos.opcion}>Posgraduantes</span>
                <span className={estilos.opcion}>Docentes</span>
                <span className={estilos.opcion}>
                  Personal Administrativo
                </span>
                <span className={estilos.opcion}>
                  Correo Institucional
                </span>
                <span className={estilos.opcion}>Ver Trámite</span>
                <span className={estilos.opcion}>
                  Buzón de Sugerencias
                </span>
                <span className={estilos.opcion}>
                  Preguntas Frecuentes
                </span>
                <span className={estilos.opcion}>
                  Modalidades de Pago
                </span>
                <span className={estilos.opcion}>
                  Residencia Universitaria
                </span>
                <span className={estilos.opcion}>Apostilla EMI</span>
                <span className={estilos.opcion}>
                  Biblioteca Virtual
                </span>
              </div>
            )}
          </div>

          <span className={estilos.enlaceInactivo}>
            NOSOTROS <ChevronDown size={17} />
          </span>
        </nav>

        <div className={estilos.redes} aria-label="Redes sociales">
          <span title="Facebook">f</span>
          <span title="X">𝕏</span>
          <span title="YouTube">▶</span>
          <span title="LinkedIn">in</span>
          <span title="Instagram">◎</span>
        </div>
      </div>
    </header>
  );
}
