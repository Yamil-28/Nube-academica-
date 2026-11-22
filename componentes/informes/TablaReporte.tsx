
import estilos from "./TablaReporte.module.css";

export type ColumnaTabla = {
  titulo: string;
  alineacion?: "izquierda" | "centro" | "derecha";
};

type Propiedades = {
  columnas: ColumnaTabla[];
  filas: (string | number)[][];
  descripcion: string;
  mensajeVacio?: string;
};

const alineaciones = {
  izquierda: undefined,
  centro: estilos.centro,
  derecha: estilos.derecha,
};

export default function TablaReporte({
  columnas,
  filas,
  descripcion,
  mensajeVacio = "No se encontraron registros con los filtros seleccionados.",
}: Propiedades) {
  if (filas.length === 0) {
    return <p className={estilos.vacio}>{mensajeVacio}</p>;
  }

  return (
    <div className={estilos.contenedor}>
      <table className={estilos.tabla}>
        <caption className={estilos.oculto}>{descripcion}</caption>

        <thead>
          <tr>
            {columnas.map((columna) => (
              <th
                key={columna.titulo}
                scope="col"
                className={alineaciones[columna.alineacion ?? "izquierda"]}
              >
                {columna.titulo}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {filas.map((fila, indiceFila) => (
            <tr key={indiceFila}>
              {fila.map((celda, indiceCelda) => (
                <td
                  key={indiceCelda}
                  className={
                    alineaciones[
                      columnas[indiceCelda]?.alineacion ?? "izquierda"
                    ]
                  }
                >
                  {celda}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
