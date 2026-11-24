import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";
import { Suspense } from "react";
import { MessageSquareText } from "lucide-react";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import { protegerRuta } from "@/lib/protegerRuta";
import {
  listarObservacionesDeProyectos,
  listarProyectosDeDocente,
} from "@/lib/proyectos/servicio";

import estilos from "./page.module.css";

async function ContenidoObservaciones() {
  const usuario = await protegerRuta("DOCENTE");

  const proyectos = await listarProyectosDeDocente(usuario.id);
  const observaciones = await listarObservacionesDeProyectos(
    proyectos.map((p) => p.id)
  );

  const titulos = new Map(proyectos.map((p) => [p.id, p.titulo]));

  return (
    <EstructuraDashboard usuario={usuario.usuario} rol={usuario.rol}>
      <div className={estilos.contenedor}>
        <section>
          <span className={estilos.etiqueta}>PROYECTOS ACADÉMICOS</span>
          <h1>Observaciones</h1>
          <p>Historial de las observaciones que registraste en tus proyectos.</p>
        </section>

        <section className={estilos.panel}>
          {observaciones.length === 0 ? (
            <div className={estilos.vacio}>
              <MessageSquareText size={35} />
              <h3>Aún no registraste observaciones</h3>
              <p>Las que escribas en «Revisión de avances» aparecerán aquí.</p>
            </div>
          ) : (
            <ul className={estilos.lista}>
              {observaciones.map((o) => (
                <li key={o.id} className={estilos.item}>
                  <div className={estilos.itemCabecera}>
                    <strong>{titulos.get(o.proyectoId) ?? "Proyecto"}</strong>
                    <span>{o.fecha.toLocaleString("es-BO")}</span>
                  </div>
                  <p>{o.texto}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </EstructuraDashboard>
  );
}

export default function PaginaObservaciones() {
  return (
    <Suspense fallback={<CargandoDashboard />}>
      <ContenidoObservaciones />
    </Suspense>
  );
}