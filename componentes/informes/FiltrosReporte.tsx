
import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";

import type { FiltroReporte, OpcionFiltro } from "@/lib/informes/motor";

import estilos from "./Filtros.module.css";

type Propiedades = {
  filtros: Pick<FiltroReporte, "clave" | "etiqueta" | "textoTodos">[];
  opciones: Record<string, OpcionFiltro[]>;
  valores: Record<string, string>;
  rutaBase: string;
};

// Formulario GET: los filtros quedan en la URL y el reporte
// se puede recargar, compartir y exportar con los mismos criterios.
export default function FiltrosReporte({
  filtros,
  opciones,
  valores,
  rutaBase,
}: Propiedades) {
  return (
    <form
      method="get"
      action={rutaBase}
      className={`${estilos.filtros} ${estilos.filtrosAjustables}`}
    >
      {filtros.map((filtro) => (
        <div key={filtro.clave} className={estilos.campo}>
          <label htmlFor={`filtro-${filtro.clave}`}>{filtro.etiqueta}</label>
          <select
            id={`filtro-${filtro.clave}`}
            name={filtro.clave}
            defaultValue={valores[filtro.clave] ?? ""}
          >
            <option value="">{filtro.textoTodos}</option>
            {(opciones[filtro.clave] ?? []).map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
                {opcion.texto}
              </option>
            ))}
          </select>
        </div>
      ))}

      <div className={estilos.acciones}>
        <button type="submit" className={estilos.botonAplicar}>
          <SlidersHorizontal size={16} />
          Aplicar filtros
        </button>

        <Link href={rutaBase} className={estilos.botonLimpiar}>
          <X size={16} />
          Limpiar
        </Link>
      </div>
    </form>
  );
}
