import estilos from "./EstructuraDashboard.module.css";

export default function CargandoDashboard() {
  return (
    <p className={estilos.dashboardCargando} data-cargando-dashboard role="status">
      Cargando panel…
    </p>
  );
}
