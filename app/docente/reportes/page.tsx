
import { Suspense } from "react";
import { FileText } from "lucide-react";

import { protegerRuta } from "@/lib/protegerRuta";
import { obtenerCatalogo } from "@/lib/informes/catalogo";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import NavegacionInterna from "@/componentes/dashboard/NavegacionInterna";
import EncabezadoInforme from "@/componentes/informes/EncabezadoInforme";
import CatalogoReportes from "@/componentes/informes/CatalogoReportes";

import estilos from "@/componentes/informes/PaginaInforme.module.css";

async function ContenidoReportesDocente() {
  const usuario = await protegerRuta("DOCENTE");
  const reportes = obtenerCatalogo("DOCENTE");

  return (
    <EstructuraDashboard usuario={usuario.usuario} rol={usuario.rol}>
      <div className={estilos.contenedor}>
        <NavegacionInterna
          titulo="Reportes de avance"
          nombreSeccion="Informes y reportes"
          rutaInicio="/docente"
        />

        <EncabezadoInforme
          etiqueta="INFORMES Y REPORTES"
          titulo="Reportes de avance"
          descripcion="Genera reportes del estado y avance de los proyectos de tus materias para presentarlos a la Carrera."
          insignia={{ texto: "Docente", icono: FileText }}
        />

        <p className={estilos.aviso}>
          Estos reportes se generan a partir de los proyectos, hitos y
          avances registrados en SISCloud. Se habilitarán cuando el módulo
          de Gestión de proyectos académicos esté integrado.
        </p>

        <section className={estilos.seccion}>
          <div className={estilos.tituloSeccion}>
            <h2>Mis reportes</h2>
            <p>Solo incluyen los proyectos de las materias que tienes asignadas</p>
          </div>

          <CatalogoReportes reportes={reportes} />
        </section>
      </div>
    </EstructuraDashboard>
  );
}

export default function PaginaReportesDocente() {
  return (
    <Suspense
      fallback={<p className={estilos.cargando}>Cargando reportes...</p>}
    >
      <ContenidoReportesDocente />
    </Suspense>
  );
}
