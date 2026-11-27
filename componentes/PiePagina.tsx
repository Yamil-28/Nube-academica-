
import { ExternalLink } from "lucide-react";
import estilos from "./PiePagina.module.css";

const enlacesInstitucionales = [
  { texto: "Facebook", href: "https://www.facebook.com/EMI.UALP" },
  { texto: "Página web", href: "https://www.emi.edu.bo/" },
  { texto: "WhatsApp", href: "https://wa.me/59171223204" },
];

export default function PiePagina({ mostrarEnlaces = false }: { mostrarEnlaces?: boolean }) {
  return (
    <footer className={estilos.piePagina}>
      <div className={estilos.contenedor}>
        <div className={estilos.informacion}>
          <p className={estilos.titulo}>SISCloud</p>
          <p className={estilos.descripcion}>
            Sistema de Gestión de Proyectos Académicos
          </p>
        </div>

        <div className={estilos.institucion}>
          <p>Escuela Militar de Ingeniería</p>
          <p>Ingeniería de Sistemas · Unidad Académica La Paz</p>
          {mostrarEnlaces && (
            <nav className={estilos.enlaces} aria-label="Enlaces de la Escuela Militar de Ingeniería">
              {enlacesInstitucionales.map(({ texto, href }) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                  aria-label={`${texto} (abre en una pestaña nueva)`}>
                  {texto} <ExternalLink size={13} aria-hidden="true" />
                </a>
              ))}
            </nav>
          )}
        </div>
      </div>
    </footer>
  );
}
