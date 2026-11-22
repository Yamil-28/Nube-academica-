
import type { LucideIcon } from "lucide-react";
import { TriangleAlert } from "lucide-react";

import { USANDO_DATOS_DE_PRUEBA } from "@/lib/academico/repositorio";

import estilos from "./Academico.module.css";

type Propiedades = {
  etiqueta: string;
  titulo: string;
  descripcion: string;
  insignia?: { texto: string; icono: LucideIcon };
};

export default function EncabezadoAcademico({
  etiqueta,
  titulo,
  descripcion,
  insignia,
}: Propiedades) {
  const IconoInsignia = insignia?.icono;

  return (
    <>
      <div className={estilos.encabezado}>
        <div>
          <span className={estilos.etiqueta}>{etiqueta}</span>
          <h1>{titulo}</h1>
          <p>{descripcion}</p>
        </div>

        {insignia && IconoInsignia && (
          <div className={estilos.insigniaEncabezado}>
            <IconoInsignia size={20} />
            <span>{insignia.texto}</span>
          </div>
        )}
      </div>

      {/* Se quita automáticamente al conectar las tablas de Neon */}
      {USANDO_DATOS_DE_PRUEBA && (
        <p className={estilos.avisoPrueba} role="note">
          <TriangleAlert size={16} />
          <span>
            <strong>Almacenamiento provisional:</strong> periodos, materias y
            asignaciones se guardan en un archivo local hasta crear sus tablas
            en la base de datos. Los docentes sí provienen de la base de datos.
          </span>
        </p>
      )}
    </>
  );
}
