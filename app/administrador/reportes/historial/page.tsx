import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";

import { Suspense } from "react";
import { History } from "lucide-react";

import { protegerRuta } from "@/lib/protegerRuta";
import { listarHistorial } from "@/lib/informes/historial";
import { obtenerCatalogo } from "@/lib/informes/catalogo";
import { formatearFechaHora } from "@/lib/informes/formato";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import EncabezadoInforme from "@/componentes/informes/EncabezadoInforme";
import TablaReporte from "@/componentes/informes/TablaReporte";

import estilos from "@/componentes/informes/PaginaInforme.module.css";

const NOMBRE_ROL = {
  ADMINISTRADOR: "Administrador",
  DOCENTE: "Docente",
  ESTUDIANTE: "Estudiante",
} as const;

// Títulos de todos los reportes del sistema, por su identificador
const TITULOS = new Map(
  (["ADMINISTRADOR", "DOCENTE", "ESTUDIANTE"] as const)
    .flatMap((rol) => obtenerCatalogo(rol))
    .map((reporte) => [reporte.id, reporte.titulo])
);

async function ContenidoHistorial() {
  const usuario = await protegerRuta("ADMINISTRADOR");
  const historial = await listarHistorial(100);

  return (
    <EstructuraDashboard usuario={usuario.usuario} rol={usuario.rol}>
      <div className={estilos.contenedor}>
        <EncabezadoInforme
          etiqueta="INFORMES Y REPORTES"
          titulo="Historial de reportes generados"
          descripcion="Registro de quién generó cada reporte, en qué formato y cuándo. El contenido de los reportes no se almacena."
          insignia={{ texto: `${historial.length} registros recientes`, icono: History }}
        />

        <section className={estilos.panel}>
          <div className={estilos.panelCabecera}>
            <div>
              <h2>Últimos 100 reportes</h2>
              <p>Trazabilidad de la generación de reportes (tabla reportes)</p>
            </div>
          </div>

          <TablaReporte
            descripcion="Historial de reportes generados"
            mensajeVacio="Todavía no se generó ningún reporte."
            columnas={[
              { titulo: "Fecha y hora", alineacion: "centro" },
              { titulo: "Reporte" },
              { titulo: "Formato", alineacion: "centro" },
              { titulo: "Generado por" },
              { titulo: "Rol", alineacion: "centro" },
            ]}
            filas={historial.map((registro) => [
              formatearFechaHora(registro.fechaGeneracion),
              TITULOS.get(registro.tipoReporte) ?? registro.tipoReporte,
              registro.formato.toUpperCase(),
              `${registro.usuario.nombre} (@${registro.usuario.usuario})`,
              NOMBRE_ROL[registro.usuario.rol],
            ])}
          />
        </section>
      </div>
    </EstructuraDashboard>
  );
}

export default function PaginaHistorialReportes() {
  return (
    <Suspense fallback={<CargandoDashboard />}>
      <ContenidoHistorial />
    </Suspense>
  );
}
