// Pantalla "Archivos" de la Nube Académica (servidor): elige proyecto y muestra el explorador.
import Link from "next/link";
import { proyectosAccesibles } from "@/lib/nube/acceso";
import { obtenerContexto } from "@/lib/nube/contexto";
import type { Rol } from "@/lib/nube/tipos";
import CabeceraNube from "./CabeceraNube";
import ExploradorArchivos from "./ExploradorArchivos";
import { Icono } from "./iconos";
import NavegacionNube from "./NavegacionNube";
import e from "./nube.module.css";

const SUBTITULO: Record<Rol, string> = {
  ESTUDIANTE: "Sube, organiza en carpetas y versiona los archivos de tus proyectos.",
  DOCENTE: "Consulta y descarga los archivos de los proyectos que supervisas.",
  ADMINISTRADOR: "Supervisa los archivos de todos los proyectos de la plataforma.",
};

export default async function VistaNube({ rutaBase, proyectoParam }: { rutaBase: string; proyectoParam?: string }) {
  const ctx = await obtenerContexto();
  const proyectos = await proyectosAccesibles(ctx.usuario);
  const elegido = proyectos.find((p) => String(p.id) === proyectoParam) ?? proyectos[0];

  return (
    <div className={e.raiz}>
      <CabeceraNube rol={ctx.usuario.rol} titulo="Nube Académica" subtitulo={SUBTITULO[ctx.usuario.rol]} />
      <NavegacionNube rol={ctx.usuario.rol} activa="archivos" />
      {!elegido ? (
        <div className={`${e.tarjeta} ${e.vacio}`}>
          <span className={e.vacioIcono}><Icono nombre="carpeta" tamano={44} /></span>
          <strong>Aún no tienes proyectos con espacio en la nube</strong>
          <span>Cuando seas integrante de un proyecto, su espacio aparecerá aquí.</span>
        </div>
      ) : (
        <>
          <div className={e.proyectoFila}>
            <h2 className={e.proyectoTitulo}><Icono nombre="carpeta" /> {elegido.titulo}</h2>
            {proyectos.length > 1 && proyectos.map((p) => (
              <Link key={p.id} href={`${rutaBase}?proyecto=${p.id}`} className={p.id === elegido.id ? e.pastillaActiva : e.pastilla}
                aria-current={p.id === elegido.id ? "page" : undefined}>{p.titulo}</Link>
            ))}
          </div>
          <ExploradorArchivos key={elegido.id} proyectoId={elegido.id} />
        </>
      )}
    </div>
  );
}
