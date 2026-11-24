import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";
import { Suspense } from "react";
import { ClipboardCheck } from "lucide-react";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import { protegerRuta } from "@/lib/protegerRuta";
import { prisma } from "@/lib/prisma";
import {
  listarAvancesDeProyectos,
  listarProyectosDeDocente,
} from "@/lib/proyectos/servicio";
import { obtenerMaterias } from "@/lib/proyectos/materiasSimuladas";
import {
  ETIQUETA_ESTADO,
  TRANSICIONES_DOCENTE,
  type EstadoProyecto,
} from "@/lib/proyectos/tipos";

import { actualizarEstado, guardarObservacion } from "./acciones";
import estilos from "./page.module.css";

type Parametros = { observacion?: string; estado?: string; error?: string };

const ETIQUETA_ACCION: Record<EstadoProyecto, string> = {
  REGISTRADO: "Volver a registrado",
  EN_DESARROLLO: "Devolver a desarrollo",
  EN_REVISION: "Pasar a revisión",
  FINALIZADO: "Finalizar proyecto",
};

async function ContenidoRevisiones({
  parametros,
}: {
  parametros: Promise<Parametros>;
}) {
  const usuario = await protegerRuta("DOCENTE");
  const { observacion, estado, error } = await parametros;

  const proyectos = await listarProyectosDeDocente(usuario.id);
  const materias = await obtenerMaterias();
  const avances = await listarAvancesDeProyectos(proyectos.map((p) => p.id));

  // Solo lectura: nombres de los estudiantes
  const autores = await prisma.usuario.findMany({
    where: { id: { in: proyectos.map((p) => p.creadoPorId) } },
    select: { id: true, nombre: true },
  });

  const nombreMateria = new Map(materias.map((m) => [m.id, m.nombre]));
  const nombreAutor = new Map(autores.map((a) => [a.id, a.nombre]));

  return (
    <EstructuraDashboard usuario={usuario.usuario} rol={usuario.rol}>
      <div className={estilos.contenedor}>
        <section>
          <span className={estilos.etiqueta}>PROYECTOS ACADÉMICOS</span>
          <h1>Revisión de avances</h1>
          <p>Revisa el progreso de cada equipo, escribe observaciones y actualiza el estado.</p>
        </section>

        {observacion === "1" && (
          <p className={estilos.aviso}>Observación registrada correctamente.</p>
        )}
        {estado === "1" && (
          <p className={estilos.aviso}>Estado del proyecto actualizado.</p>
        )}
        {error && (
          <p className={estilos.error}>
            No se pudo completar la acción. La observación debe tener entre 5 y 500
            caracteres y el cambio de estado debe estar permitido.
          </p>
        )}

        {proyectos.length === 0 ? (
          <section className={estilos.panel}>
            <div className={estilos.vacio}>
              <ClipboardCheck size={35} />
              <h3>No tienes proyectos para revisar</h3>
              <p>Cuando un estudiante te asigne un proyecto, aparecerá aquí.</p>
            </div>
          </section>
        ) : (
          proyectos.map((p) => {
            const susAvances = avances.filter((a) => a.proyectoId === p.id);
            const acciones = TRANSICIONES_DOCENTE[p.estado];

            return (
              <article key={p.id} className={estilos.tarjeta}>
                <header className={estilos.tarjetaCabecera}>
                  <div>
                    <h2>{p.titulo}</h2>
                    <p>
                      {nombreMateria.get(p.materiaId) ?? "—"} ·{" "}
                      {nombreAutor.get(p.creadoPorId) ?? "—"} · {p.gestion}-{p.semestre}
                    </p>
                  </div>
                  <span className={estilos.estado}>{ETIQUETA_ESTADO[p.estado]}</span>
                </header>

                <h3 className={estilos.subtitulo}>Avances del equipo</h3>
                {susAvances.length === 0 ? (
                  <p className={estilos.textoSuave}>El equipo aún no registró avances.</p>
                ) : (
                  <ul className={estilos.lista}>
                    {susAvances.map((a) => (
                      <li key={a.id} className={estilos.item}>
                        <span>{a.fecha.toLocaleString("es-BO")}</span>
                        <p>{a.descripcion}</p>
                      </li>
                    ))}
                  </ul>
                )}

                {p.estado !== "FINALIZADO" && (
                  <form action={guardarObservacion} className={estilos.formulario}>
                    <input type="hidden" name="proyectoId" value={p.id} />
                    <label>
                      Observación para el equipo
                      <textarea name="texto" rows={3} maxLength={500} required />
                    </label>
                    <div className={estilos.botones}>
                      <button type="submit" className={estilos.guardar}>
                        Registrar observación
                      </button>
                    </div>
                  </form>
                )}

                {acciones.length > 0 && (
                  <div className={estilos.acciones}>
                    {acciones.map((e) => (
                      <form key={e} action={actualizarEstado}>
                        <input type="hidden" name="proyectoId" value={p.id} />
                        <input type="hidden" name="estado" value={e} />
                        <button type="submit" className={estilos.secundario}>
                          {ETIQUETA_ACCION[e]}
                        </button>
                      </form>
                    ))}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </EstructuraDashboard>
  );
}

export default function PaginaRevisionAvances({
  searchParams,
}: {
  searchParams: Promise<Parametros>;
}) {
  return (
    <Suspense fallback={<CargandoDashboard />}>
      <ContenidoRevisiones parametros={searchParams} />
    </Suspense>
  );
}