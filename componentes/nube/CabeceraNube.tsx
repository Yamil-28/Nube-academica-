// Cabecera visual común de las pantallas del módulo (componente de servidor).
import { ETIQUETA_ROL } from "@/lib/nube/formato";
import type { Rol } from "@/lib/nube/tipos";
import { Icono } from "./iconos";
import e from "./nube.module.css";

const MODO: Record<Rol, string> = {
  ESTUDIANTE: "Estudiante · acceso completo",
  DOCENTE: "Docente · solo lectura",
  ADMINISTRADOR: "Administrador · supervisión",
};

export default function CabeceraNube({ rol, titulo, subtitulo }: { rol: Rol; titulo: string; subtitulo: string }) {
  return (
    <header className={e.hero}>
      <span className={e.heroIcono}><Icono nombre="nube" tamano={28} /></span>
      <div className={e.heroTexto}><h1>{titulo}</h1><p>{subtitulo}</p></div>
      <span className={e.rolChip} title={`Sesión como ${ETIQUETA_ROL[rol]}`}>{MODO[rol]}</span>
    </header>
  );
}
