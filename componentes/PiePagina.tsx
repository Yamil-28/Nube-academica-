
import estilos from "./PiePagina.module.css";

export default function PiePagina() {
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
        </div>
      </div>
    </footer>
  );
}
