import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";

import { Suspense } from "react";
import Link from "next/link";
import { BookOpen, Pencil, Search } from "lucide-react";

import { protegerRuta } from "@/lib/protegerRuta";
import {
  listarAsignaciones,
  listarMaterias,
  obtenerMateria,
  obtenerPeriodoVigente,
} from "@/lib/academico/repositorio";
import { accionCambiarEstadoMateria } from "@/lib/academico/acciones";
import { NIVEL_MAXIMO, NIVEL_MINIMO } from "@/lib/academico/validaciones";
import { etiquetaMateria } from "@/lib/academico/tipos";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import EncabezadoAcademico from "@/componentes/academico/EncabezadoAcademico";
import FormularioMateria from "@/componentes/academico/FormularioMateria";
import BotonAccion from "@/componentes/academico/BotonAccion";

import estilos from "@/componentes/academico/Academico.module.css";

const RUTA = "/administrador/materias";

type ParametrosBusqueda = Promise<Record<string, string | string[] | undefined>>;

function leer(parametros: Record<string, string | string[] | undefined>, clave: string) {
  const valor = parametros[clave];
  return (Array.isArray(valor) ? valor[0] : valor ?? "").trim();
}

async function ContenidoMaterias({ searchParams }: { searchParams: ParametrosBusqueda }) {
  const usuario = await protegerRuta("ADMINISTRADOR");
  const parametros = await searchParams;

  // Filtros de la lista
  const busqueda = leer(parametros, "busqueda").slice(0, 60);
  const nivelNumero = Number.parseInt(leer(parametros, "nivel"), 10);
  const nivel =
    nivelNumero >= NIVEL_MINIMO && nivelNumero <= NIVEL_MAXIMO ? nivelNumero : undefined;

  // Modo edición (?editar=ID)
  const idEditar = Number.parseInt(leer(parametros, "editar"), 10);
  const materiaEditar = Number.isSafeInteger(idEditar)
    ? await obtenerMateria(idEditar)
    : null;

  const guardado = leer(parametros, "guardado") === "1";

  const [materias, vigente] = await Promise.all([
    listarMaterias({ busqueda, nivel }),
    obtenerPeriodoVigente(),
  ]);

  // Docentes de cada materia en el periodo vigente
  const asignaciones = vigente ? await listarAsignaciones({ idPeriodo: vigente.id }) : [];
  const docentesPorMateria = new Map<number, string[]>();
  for (const asignacion of asignaciones) {
    const lista = docentesPorMateria.get(asignacion.materia.id) ?? [];
    lista.push(asignacion.docente.nombre);
    docentesPorMateria.set(asignacion.materia.id, lista);
  }

  const activas = materias.filter((materia) => materia.activa).length;

  return (
    <EstructuraDashboard usuario={usuario.usuario} rol={usuario.rol}>
      <div className={estilos.contenedor}>
        <EncabezadoAcademico
          etiqueta="GESTIÓN ACADÉMICA"
          titulo="Materias"
          descripcion="Registra y administra las asignaturas de la Carrera de Ingeniería de Sistemas."
          insignia={{ texto: `${activas} materias activas`, icono: BookOpen }}
        />

        {guardado && (
          <p className={`${estilos.mensaje} ${estilos.mensajeExito}`} role="status">
            Los cambios de la materia se guardaron correctamente.
          </p>
        )}

        <div className={estilos.columnas}>
          {/* REGISTRO / EDICIÓN */}
          <section className={estilos.panel}>
            <div className={estilos.panelCabecera}>
              <div>
                <h2>{materiaEditar ? "Editar materia" : "Nueva materia"}</h2>
                <p>
                  {materiaEditar
                    ? `Modificando "${etiquetaMateria(materiaEditar)}"`
                    : "Datos de la asignatura"}
                </p>
              </div>
            </div>
            <div className={estilos.panelCuerpo}>
              {/* La clave fuerza un formulario nuevo al cambiar de materia */}
              <FormularioMateria
                key={materiaEditar?.id ?? "nueva"}
                materia={materiaEditar ?? undefined}
                rutaCancelar={RUTA}
              />
            </div>
          </section>

          {/* LISTA */}
          <section className={estilos.panel}>
            <div className={estilos.panelCabecera}>
              <form method="get" action={RUTA} className={estilos.filtrosLinea}>
                <div className={estilos.campo}>
                  <label htmlFor="materias-busqueda">Buscar</label>
                  <input
                    id="materias-busqueda"
                    name="busqueda"
                    type="search"
                    placeholder="Código o nombre"
                    defaultValue={busqueda}
                    maxLength={60}
                  />
                </div>

                <div className={estilos.campo}>
                  <label htmlFor="materias-nivel">Semestre</label>
                  <select id="materias-nivel" name="nivel" defaultValue={nivel ?? ""}>
                    <option value="">Todos</option>
                    {Array.from({ length: NIVEL_MAXIMO }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}.° semestre
                      </option>
                    ))}
                  </select>
                </div>

                <button type="submit" className={`${estilos.boton} ${estilos.botonSecundario}`}>
                  <Search size={16} />
                  Filtrar
                </button>
              </form>
            </div>

            {materias.length === 0 ? (
              <p className={estilos.vacio}>
                No se encontraron materias
                {busqueda || nivel ? " con esos filtros" : ""}.
              </p>
            ) : (
              <div className={estilos.tablaContenedor}>
                <table className={estilos.tabla}>
                  <thead>
                    <tr>
                      <th scope="col">Código</th>
                      <th scope="col">Materia</th>
                      <th scope="col">Semestre</th>
                      <th scope="col">Estado</th>
                      <th scope="col">
                        <span className={estilos.oculto}>Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {materias.map((materia) => {
                      const docentes = docentesPorMateria.get(materia.id);

                      return (
                        <tr
                          key={materia.id}
                          className={materia.activa ? undefined : estilos.filaInactiva}
                        >
                          <td className={estilos.codigo}>{materia.codigo ?? "—"}</td>
                          <td>
                            {materia.nombre}
                            {materia.descripcion && (
                              <span className={estilos.secundario}>{materia.descripcion}</span>
                            )}
                            <span className={estilos.secundario}>
                              {docentes
                                ? `Docente: ${docentes.join(", ")}`
                                : "Sin docente en el periodo vigente"}
                            </span>
                          </td>
                          <td>{materia.nivel}.°</td>
                          <td>
                            <span
                              className={`${estilos.insignia} ${
                                materia.activa ? estilos.insigniaActiva : estilos.insigniaInactiva
                              }`}
                            >
                              {materia.activa ? "Activa" : "Inactiva"}
                            </span>
                          </td>
                          <td>
                            <div className={estilos.accionesTabla}>
                              <Link
                                href={`${RUTA}?editar=${materia.id}`}
                                className={estilos.botonTabla}
                              >
                                <Pencil size={13} />
                                Editar
                              </Link>

                              <BotonAccion
                                accion={accionCambiarEstadoMateria}
                                id={materia.id}
                                peligro={materia.activa}
                              >
                                {materia.activa ? "Desactivar" : "Activar"}
                              </BotonAccion>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </EstructuraDashboard>
  );
}

export default function PaginaMaterias({ searchParams }: { searchParams: ParametrosBusqueda }) {
  return (
    <Suspense fallback={<CargandoDashboard />}>
      <ContenidoMaterias searchParams={searchParams} />
    </Suspense>
  );
}
