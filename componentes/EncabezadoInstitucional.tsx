
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

export default function EncabezadoInstitucional() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [serviciosAbierto, setServiciosAbierto] = useState(false);
  const [estudiantesAbierto, setEstudiantesAbierto] = useState(false);

  return (
    <header className="emi-encabezado">
      <div className="emi-navegacion">
        <div className="emi-marca">
          <Image
            src="/imagenes/emi.jpg"
            alt="Escudo de la Escuela Militar de Ingeniería"
            width={65}
            height={65}
          />
          <div className="emi-marca-texto">
            <strong>EMI</strong>
            <span>Escuela Militar de Ingeniería</span>
          </div>
        </div>

        <button
          type="button"
          className="emi-menu-movil"
          aria-label="Abrir menú"
          aria-expanded={menuAbierto}
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          {menuAbierto ? <X /> : <Menu />}
        </button>

        <nav className={`emi-enlaces ${menuAbierto ? "emi-enlaces-abiertos" : ""}`}>
          <span className="emi-enlace-inactivo">
            ACADÉMICA <ChevronDown size={17} />
          </span>

          <span className="emi-enlace-inactivo">
            INVESTIGACIÓN <ChevronDown size={17} />
          </span>

          <span className="emi-enlace-inactivo">
            INTERACCIÓN SOCIAL <ChevronDown size={17} />
          </span>

          <div className="emi-menu-servicios">
            <button
              type="button"
              className={`emi-boton-servicios ${
                serviciosAbierto ? "emi-boton-activo" : ""
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
              <div className="emi-desplegable">
                <span className="emi-opcion">
                  Estudiantes Nuevos <ChevronRight size={17} />
                </span>

                <button
                  type="button"
                  className={`emi-opcion emi-opcion-boton ${
                    estudiantesAbierto ? "emi-opcion-activa" : ""
                  }`}
                  onClick={() => setEstudiantesAbierto(!estudiantesAbierto)}
                  aria-expanded={estudiantesAbierto}
                >
                  Estudiantes Regulares
                  <ChevronRight size={17} />
                </button>

                {estudiantesAbierto && (
                  <div className="emi-submenu">
                    <span>Inscripciones</span>
                    <span>Calendario Académico</span>
                    <span>Notas</span>
                    <span>Trabajos de Grado</span>

                    <Link
                      href="/iniciar-sesion"
                      className="emi-enlace-siscloud"
                    >
                      SISCloud
                      <ChevronRight size={18} />
                    </Link>
                  </div>
                )}

                <span className="emi-opcion">Posgraduantes</span>
                <span className="emi-opcion">Docentes</span>
                <span className="emi-opcion">Personal Administrativo</span>
                <span className="emi-opcion">Correo Institucional</span>
                <span className="emi-opcion">Ver Trámite</span>
                <span className="emi-opcion">Buzón de Sugerencias</span>
                <span className="emi-opcion">Preguntas Frecuentes</span>
                <span className="emi-opcion">Modalidades de Pago</span>
                <span className="emi-opcion">Residencia Universitaria</span>
                <span className="emi-opcion">Apostilla EMI</span>
                <span className="emi-opcion">Biblioteca Virtual</span>
              </div>
            )}
          </div>

          <span className="emi-enlace-inactivo">
            NOSOTROS <ChevronDown size={17} />
          </span>
        </nav>

        <div className="emi-redes" aria-label="Redes sociales">
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
