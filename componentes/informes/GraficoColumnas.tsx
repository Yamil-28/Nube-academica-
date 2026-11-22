
import estilos from "./GraficoColumnas.module.css";

export type DatoColumna = {
  clave: string;
  etiqueta: string;
  valor: number;
};

type Propiedades = {
  datos: DatoColumna[];
  descripcion: string;
  unidad?: string;
};

export default function GraficoColumnas({
  datos,
  descripcion,
  unidad = "registros",
}: Propiedades) {
  const maximo = Math.max(...datos.map((dato) => dato.valor), 0);

  if (maximo === 0) {
    return (
      <p className={estilos.vacio}>
        No hay {unidad} en este periodo.
      </p>
    );
  }

  return (
    <ol className={estilos.grafico} aria-label={descripcion}>
      {datos.map((dato) => {
        const altura = (dato.valor / maximo) * 100;

        return (
          <li
            key={dato.clave}
            className={estilos.columna}
            aria-label={`${dato.etiqueta}: ${dato.valor} ${unidad}`}
            title={`${dato.etiqueta}: ${dato.valor} ${unidad}`}
          >
            <div className={estilos.area} aria-hidden="true">
              {dato.valor > 0 && (
                <span className={estilos.valor}>{dato.valor}</span>
              )}

              <div
                className={`${estilos.barra} ${
                  dato.valor === 0 ? estilos.barraVacia : ""
                }`}
                style={{ height: `${dato.valor === 0 ? 0 : altura}%` }}
              />
            </div>

            <span className={estilos.etiqueta} aria-hidden="true">
              {dato.etiqueta}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
