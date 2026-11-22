
import { Archive, BookOpen, CalendarDays, Search } from "lucide-react";

import NavegacionInterna from "@/componentes/dashboard/NavegacionInterna";
import EncabezadoInforme from "@/componentes/informes/EncabezadoInforme";

import estilos from "@/componentes/informes/PaginaInforme.module.css";
import estilosCatalogo from "@/componentes/informes/CatalogoReportes.module.css";

/* ==========================================
   REPOSITORIO ACADÉMICO (DOCENTE Y ESTUDIANTE)
   Según el documento, el repositorio de proyectos
   finalizados forma parte del módulo de Gestión de
   proyectos académicos (Tabla 6, Módulo 5; HU-10 y
   HU-16). Desde Informes se consulta cuando ese
   módulo esté integrado.
========================================== */

type Propiedades = {
  rutaInicio: string;
  descripcion: string;
};

const funciones = [
  {
    icono: Search,
    titulo: "Buscar proyectos finalizados",
    texto: "Por título, palabras clave o resumen, para usarlos como referencia.",
  },
  {
    icono: CalendarDays,
    titulo: "Clasificación por gestión y semestre",
    texto: "Proyectos archivados organizados por periodo académico.",
  },
  {
    icono: BookOpen,
    titulo: "Clasificación por materia",
    texto: "Proyectos agrupados por la asignatura en la que se desarrollaron.",
  },
];

export default function RepositorioPendiente({ rutaInicio, descripcion }: Propiedades) {
  return (
    <div className={estilos.contenedor}>
      <NavegacionInterna
        titulo="Repositorio académico"
        nombreSeccion="Informes y reportes"
        rutaInicio={rutaInicio}
      />

      <EncabezadoInforme
        etiqueta="INFORMES Y REPORTES"
        titulo="Repositorio académico"
        descripcion={descripcion}
        insignia={{ texto: "Proyectos finalizados", icono: Archive }}
      />

      <p className={estilos.aviso}>
        El repositorio muestra los proyectos finalizados que archiva el
        administrador. Sus datos provienen del módulo de Gestión de proyectos
        académicos y se mostrarán aquí cuando ese módulo esté integrado.
      </p>

      <section className={estilos.seccion}>
        <div className={estilos.tituloSeccion}>
          <h2>Funciones del repositorio</h2>
          <p>Consulta disponible según los permisos de tu rol</p>
        </div>

        <div className={estilosCatalogo.catalogo}>
          {funciones.map(({ icono: Icono, titulo, texto }) => (
            <article
              key={titulo}
              className={`${estilosCatalogo.tarjeta} ${estilosCatalogo.tarjetaPendiente}`}
            >
              <div className={estilosCatalogo.superior}>
                <span className={estilosCatalogo.icono}>
                  <Icono size={21} />
                </span>
                <span className={`${estilosCatalogo.estado} ${estilosCatalogo.pendiente}`}>
                  Pendiente
                </span>
              </div>

              <div className={estilosCatalogo.textos}>
                <strong>{titulo}</strong>
                <p>{texto}</p>
              </div>

              <div className={estilosCatalogo.inferior}>
                <span className={estilosCatalogo.requisito}>
                  Requiere el módulo: Gestión de proyectos académicos
                </span>
                <small className={estilosCatalogo.referencia}>HU-10 · HU-16</small>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
