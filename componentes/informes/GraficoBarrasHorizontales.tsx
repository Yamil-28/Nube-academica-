
import estilos from "./GraficoBarrasHorizontales.module.css";

export type ColorBarra = "azul" | "dorado" | "verde" | "morado";

export type DatoBarra = {
  etiqueta: string;
  valor: number;
  detalle?: string;
  color?: ColorBarra;
};

type Propiedades = {
  datos: DatoBarra[];
  descripcion: string;
};

const colores: Record<ColorBarra, string> = {
  azul: estilos.barraAzul,
  dorado: estilos.barraDorado,
  verde: estilos.barraVerde,
  morado: estilos.barraMorado,
};

export default function GraficoBarrasHorizontales({
  datos,
  descripcion,
}: Propiedades) {
  const total = datos.reduce((suma, dato) => suma + dato.valor, 0);

  if (total === 0) {
    return (
      <p className={estilos.vacio}>
        Todavía no hay datos para mostrar.
      </p>
    );
  }

  return (
    <ul className={estilos.grafico} aria-label={descripcion}>
      {datos.map((dato) => {
        const porcentaje = Math.round((dato.valor / total) * 100);

        return (
          <li key={dato.etiqueta} className={estilos.fila}>
            <div className={estilos.cabecera}>
              <strong>{dato.etiqueta}</strong>
              <span>
                {dato.valor.toLocaleString("es-BO")} · {porcentaje}%
              </span>
            </div>

            <div className={estilos.pista} aria-hidden="true">
              <div
                className={`${estilos.barra} ${
                  colores[dato.color ?? "azul"]
                }`}
                style={{ width: `${porcentaje}%` }}
              />
            </div>

            {dato.detalle && (
              <small className={estilos.detalle}>{dato.detalle}</small>
            )}
          </li>
        );
      })}
    </ul>
  );
}
