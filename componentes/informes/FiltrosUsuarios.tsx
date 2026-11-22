
import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";

import {
  OPCIONES_ESTADO,
  OPCIONES_ROL,
  type FiltrosUsuarios as Filtros,
} from "@/lib/informes/filtrosUsuarios";

import estilos from "./Filtros.module.css";

type Propiedades = {
  filtros: Filtros;
  rutaBase: string;
};

// Formulario GET: los filtros quedan en la URL, así el reporte se
// puede recargar, compartir y exportar con los mismos criterios.
// No necesita JavaScript en el navegador.
export default function FiltrosUsuarios({ filtros, rutaBase }: Propiedades) {
  return (
    <form method="get" action={rutaBase} className={estilos.filtros}>
      <div className={estilos.campo}>
        <label htmlFor="filtro-busqueda">Buscar</label>
        <div className={estilos.campoBusqueda}>
          <Search size={16} aria-hidden="true" />
          <input
            id="filtro-busqueda"
            name="busqueda"
            type="search"
            placeholder="Nombre o usuario"
            defaultValue={filtros.busqueda}
            maxLength={60}
          />
        </div>
      </div>

      <div className={estilos.campo}>
        <label htmlFor="filtro-rol">Rol</label>
        <select id="filtro-rol" name="rol" defaultValue={filtros.rol}>
          {OPCIONES_ROL.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.texto}
            </option>
          ))}
        </select>
      </div>

      <div className={estilos.campo}>
        <label htmlFor="filtro-estado">Estado</label>
        <select
          id="filtro-estado"
          name="estado"
          defaultValue={filtros.estado}
        >
          {OPCIONES_ESTADO.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.texto}
            </option>
          ))}
        </select>
      </div>

      <div className={estilos.campo}>
        <label htmlFor="filtro-desde">Registrados desde</label>
        <input
          id="filtro-desde"
          name="desde"
          type="date"
          defaultValue={filtros.desde}
        />
      </div>

      <div className={estilos.campo}>
        <label htmlFor="filtro-hasta">Hasta</label>
        <input
          id="filtro-hasta"
          name="hasta"
          type="date"
          defaultValue={filtros.hasta}
        />
      </div>

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
