// Pantalla "Almacenamiento" del Administrador: consumo y límites por proyecto (RF05).
import { obtenerContexto } from "@/lib/nube/contexto";
import CabeceraNube from "./CabeceraNube";
import NavegacionNube from "./NavegacionNube";
import { resumenCuotasMaterias } from "@/lib/nube/servicio";
import PanelAlmacenamiento from "./PanelAlmacenamiento";
import e from "./nube.module.css";

export default async function VistaAlmacenamiento() {
  const ctx = await obtenerContexto();
  const materias = await resumenCuotasMaterias(ctx);
  const capacidadConfigurada = Number(process.env.NUBE_CAPACIDAD_TOTAL_BYTES);
  const capacidadBytes = Number.isSafeInteger(capacidadConfigurada) && capacidadConfigurada > 0
    ? capacidadConfigurada : 1_000_000_000;
  return (
    <div className={e.raiz}>
      <CabeceraNube rol={ctx.usuario.rol} titulo="Almacenamiento" subtitulo="Consulta el uso y ajusta los límites por materia y por proyecto." />
      <NavegacionNube rol={ctx.usuario.rol} activa="almacenamiento" />
      <PanelAlmacenamiento materias={materias} capacidadBytes={capacidadBytes} />
    </div>
  );
}
