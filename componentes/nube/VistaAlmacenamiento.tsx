// Pantalla "Almacenamiento" del Administrador: consumo y límites por proyecto (RF05).
import { obtenerContexto } from "@/lib/nube/contexto";
import CabeceraNube from "./CabeceraNube";
import NavegacionNube from "./NavegacionNube";
import PanelCuotas from "./PanelCuotas";
import e from "./nube.module.css";

export default async function VistaAlmacenamiento() {
  const ctx = await obtenerContexto();
  return (
    <div className={e.raiz}>
      <CabeceraNube rol={ctx.usuario.rol} titulo="Almacenamiento" subtitulo="Controla el espacio que consume cada proyecto y ajusta sus límites." />
      <NavegacionNube rol={ctx.usuario.rol} activa="almacenamiento" />
      <PanelCuotas />
    </div>
  );
}
