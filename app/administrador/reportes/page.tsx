
import { Suspense } from "react";
import { FileText } from "lucide-react";

import { protegerRuta } from "@/lib/protegerRuta";
import { obtenerCatalogo } from "@/lib/informes/catalogo";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import NavegacionInterna from "@/componentes/dashboard/NavegacionInterna";
import EncabezadoInforme from "@/componentes/informes/EncabezadoInforme";
import CatalogoReportes from "@/componentes/informes/CatalogoReportes";

import estilos from "@/componentes/informes/PaginaInforme.module.css";

async function ContenidoReportes() {
  const usuario = await protegerRuta("ADMINISTRADOR");
  const reportes = obtenerCatalogo("ADMINISTRADOR");
  const disponibles = reportes.filter((reporte) => reporte.ruta).length;

  return (
    <EstructuraDashboard usuario={usuario.usuario} rol={usuario.rol}>
      <div className={estilos.contenedor}>
        <NavegacionInterna
          titulo="Reportes"
          nombreSeccion="Informes y reportes"
          rutaInicio="/administrador"
        />

        <EncabezadoInforme
          etiqueta="INFORMES Y REPORTES"
          titulo="Reportes generales"
          descripcion="Genera informes de proyectos, usuarios y actividad de SISCloud en PDF, Excel o CSV."
          insignia={{
            texto: `${disponibles} de ${reportes.length} disponibles`,
            icono: FileText,
          }}
        />

        <section className={estilos.seccion}>
          <div className={estilos.tituloSeccion}>
            <h2>Catálogo de reportes</h2>
            <p>
              Los reportes marcados como pendientes se habilitarán al
              integrarse el módulo del que obtienen sus datos
            </p>
          </div>

          <CatalogoReportes reportes={reportes} />
        </section>
      </div>
    </EstructuraDashboard>
  );
}

export default function PaginaReportes() {
  return (
    <Suspense
      fallback={<p className={estilos.cargando}>Cargando reportes...</p>}
    >
      <ContenidoReportes />
    </Suspense>
  );
}
