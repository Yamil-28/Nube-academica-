import e from "./nube.module.css";

export default function CargandoNube() {
  return <div className={e.raiz}><div className={e.esqueleto} aria-busy="true" aria-label="Cargando" /></div>;
}
