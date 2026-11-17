
import { Suspense } from "react";
import { FileText } from "lucide-react";

import { protegerRuta } from "@/lib/protegerRuta";
import { obtenerCatalogo } from "@/lib/informes/catalogo";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import NavegacionInterna from "@/componentes/dashboard/NavegacionInterna";
import EncabezadoInforme from "@/componentes/informes/EncabezadoInforme";
import CatalogoReportes from "@/componentes/informes/CatalogoReportes";

import estilos from "@/componentes/informes/PaginaInforme.module.css";

async function ContenidoReportesEstudiante() {
  const usuario = await protegerRuta("ESTUDIANTE");
  const reportes = obtenerCatalogo("ESTUDIANTE");

  return (
    <EstructuraDashboard usuario={usuario.usuario} rol={usuario.rol}>
      <div className={estilos.contenedor}>
        <NavegacionInterna
          titulo="Mis reportes"
          nombreSeccion="Informes y reportes"
          rutaInicio="/estudiante"
        />

        <EncabezadoInforme
          etiqueta="INFORMES Y REPORTES"
          titulo="Mis reportes"
          descripcion="Genera el reporte de tus proyectos para presentar su estado y avance al docente."
          insignia={{ texto: "Estudiante", icono: FileText }}
        />

        <p className={estilos.aviso}>
          Estos reportes se generan a partir de tus proyectos y avances
          registrados en SISCloud. Se habilitarán cuando el módulo de
          Gestión de proyectos académicos esté integrado.
        </p>

        <section className={estilos.seccion}>
          <div className={estilos.tituloSeccion}>
            <h2>Reportes disponibles</h2>
            <p>Solo incluyen los proyectos en los que participas</p>
          </div>

          <CatalogoReportes reportes={reportes} />
        </section>
      </div>
    </EstructuraDashboard>
  );
}

export default function PaginaReportesEstudiante() {
  return (
    <Suspense
      fallback={<p className={estilos.cargando}>Cargando reportes...</p>}
    >
      <ContenidoReportesEstudiante />
    </Suspense>
  );
}
