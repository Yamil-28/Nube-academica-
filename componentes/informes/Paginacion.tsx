
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import estilos from "./Paginacion.module.css";

type Propiedades = {
  paginaActual: number;
  totalPaginas: number;
  totalRegistros: number;
  // Construye el enlace de una página conservando los filtros
  crearEnlace: (pagina: number) => string;
};

export default function Paginacion({
  paginaActual,
  totalPaginas,
  totalRegistros,
  crearEnlace,
}: Propiedades) {
  if (totalPaginas <= 1) {
    return null;
  }

  const anterior = paginaActual > 1 ? paginaActual - 1 : null;
  const siguiente = paginaActual < totalPaginas ? paginaActual + 1 : null;

  return (
    <nav className={estilos.paginacion} aria-label="Paginación">
      <span className={estilos.informacion}>
        Página {paginaActual} de {totalPaginas} ·{" "}
        {totalRegistros.toLocaleString("es-BO")} registros
      </span>

      <div className={estilos.botones}>
        {anterior ? (
          <Link href={crearEnlace(anterior)} className={estilos.boton}>
            <ChevronLeft size={16} /> Anterior
          </Link>
        ) : (
          <span className={`${estilos.boton} ${estilos.deshabilitado}`}>
            <ChevronLeft size={16} /> Anterior
          </span>
        )}

        {siguiente ? (
          <Link href={crearEnlace(siguiente)} className={estilos.boton}>
            Siguiente <ChevronRight size={16} />
          </Link>
        ) : (
          <span className={`${estilos.boton} ${estilos.deshabilitado}`}>
            Siguiente <ChevronRight size={16} />
          </span>
        )}
      </div>
    </nav>
  );
}
