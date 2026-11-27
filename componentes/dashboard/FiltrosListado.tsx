import { FilterX, Search } from "lucide-react";
import Link from "next/link";
import estilos from "@/app/administrador/usuarios/page.module.css";

export type ParametrosListado = Record<string, string | string[] | undefined>;

export function parametro(filtros: ParametrosListado, clave: string) {
  const valor = filtros[clave];
  return typeof valor === "string" ? valor.trim().slice(0, 120) : "";
}

export function coincide(busqueda: string, ...valores: (string | number | null | undefined)[]) {
  const normalizar = (texto: string) => texto.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("es");
  const texto = normalizar(busqueda);
  return !texto || valores.some((valor) => normalizar(String(valor ?? "")).includes(texto));
}

type Selector = { nombre: string; todos: string; opciones: { valor: string; etiqueta: string }[] };

export default function FiltrosListado({ ruta, filtros, etiqueta, selectores = [] }: {
  ruta: string;
  filtros: ParametrosListado;
  etiqueta: string;
  selectores?: Selector[];
}) {
  return (
    <form action={ruta} method="get" className={estilos.contenedorFiltros} aria-label="Filtros del listado">
      <label className={estilos.campoBusqueda}>
        <Search size={19} aria-hidden />
        <input type="search" name="q" placeholder={etiqueta} aria-label={etiqueta}
          defaultValue={parametro(filtros, "q")} maxLength={120} />
      </label>
      {selectores.map(({ nombre, todos, opciones }) => (
        <select key={nombre} name={nombre} aria-label={todos} className={estilos.selectorFiltro}
          defaultValue={parametro(filtros, nombre)}>
          <option value="">{todos}</option>
          {opciones.map(({ valor, etiqueta }) => <option key={valor} value={valor}>{etiqueta}</option>)}
        </select>
      ))}
      <button className={estilos.selectorFiltro} type="submit">Filtrar</button>
      <Link className={estilos.botonLimpiar} href={ruta}><FilterX size={16} /> Limpiar</Link>
    </form>
  );
}
