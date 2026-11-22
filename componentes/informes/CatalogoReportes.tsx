
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  Cloud,
  FolderKanban,
  History,
  Users,
} from "lucide-react";

import type {
  DefinicionReporte,
  IconoReporte,
} from "@/lib/informes/catalogo";

import estilos from "./CatalogoReportes.module.css";

const iconos: Record<IconoReporte, typeof Users> = {
  usuarios: Users,
  proyectos: FolderKanban,
  avances: ClipboardCheck,
  actividad: History,
  nube: Cloud,
  academico: BookOpen,
};

type Propiedades = {
  reportes: DefinicionReporte[];
};

export default function CatalogoReportes({ reportes }: Propiedades) {
  return (
    <div className={estilos.catalogo}>
      {reportes.map((reporte) => {
        const Icono = iconos[reporte.icono];
        const disponible = Boolean(reporte.ruta);

        const contenido = (
          <>
            <div className={estilos.superior}>
              <span className={estilos.icono}>
                <Icono size={21} />
              </span>

              <span
                className={`${estilos.estado} ${
                  disponible ? estilos.disponible : estilos.pendiente
                }`}
              >
                {disponible ? "Disponible" : "Pendiente"}
              </span>
            </div>

            <div className={estilos.textos}>
              <strong>{reporte.titulo}</strong>
              <p>{reporte.descripcion}</p>
            </div>

            <div className={estilos.inferior}>
              {disponible ? (
                <span className={estilos.accion}>
                  Generar reporte <ArrowRight size={15} />
                </span>
              ) : (
                <span className={estilos.requisito}>
                  Requiere el módulo: {reporte.moduloRequerido}
                </span>
              )}

              <small className={estilos.referencia}>
                {reporte.referencia}
              </small>
            </div>
          </>
        );

        return disponible && reporte.ruta ? (
          <Link
            key={reporte.id}
            href={reporte.ruta}
            className={estilos.tarjeta}
          >
            {contenido}
          </Link>
        ) : (
          <article
            key={reporte.id}
            className={`${estilos.tarjeta} ${estilos.tarjetaPendiente}`}
          >
            {contenido}
          </article>
        );
      })}
    </div>
  );
}
