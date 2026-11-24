import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";
import { Suspense } from "react";
import Link from "next/link";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import { protegerRuta } from "@/lib/protegerRuta";
import { prisma } from "@/lib/prisma";
import { obtenerMaterias } from "@/lib/proyectos/materiasSimuladas";
import { registrarProyecto } from "./acciones";
import estilos from "./page.module.css";

async function ContenidoNuevo({
  parametros,
}: {
  parametros: Promise<{ error?: string }>;
}) {
  const usuario = await protegerRuta("ESTUDIANTE");
  const { error } = await parametros;

  const materias = await obtenerMaterias();

  // Solo lectura: lista de docentes activos
  const docentes = await prisma.usuario.findMany({
    where: { rol: "DOCENTE", activo: true },
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  });

  const gestion = new Date().getFullYear();

  return (
    <EstructuraDashboard usuario={usuario.usuario} rol={usuario.rol}>
      <div className={estilos.contenedor}>
        <section>
          <span className={estilos.etiqueta}>PROYECTOS ACADÉMICOS</span>
          <h1>Crear proyecto</h1>
          <p>Registra un nuevo proyecto y asócialo a una materia y a un docente.</p>
        </section>

        {error && (
          <p className={estilos.error}>
            Revisa los datos: el título debe tener entre 5 y 120 caracteres,
            la descripción entre 10 y 1000, y debes elegir materia, docente y semestre.
          </p>
        )}

        <form action={registrarProyecto} className={estilos.formulario}>
          <label>
            Título
            <input name="titulo" type="text" maxLength={120} required />
          </label>

          <label>
            Descripción
            <textarea name="descripcion" rows={5} maxLength={1000} required />
          </label>

          <label>
            Materia
            <select name="materiaId" required defaultValue="">
              <option value="" disabled>Selecciona una materia</option>
              {materias.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.codigo} - {m.nombre}
                </option>
              ))}
            </select>
          </label>

          <label>
            Docente responsable
            <select name="docenteId" required defaultValue="">
              <option value="" disabled>Selecciona un docente</option>
              {docentes.map((d) => (
                <option key={d.id} value={d.id}>{d.nombre}</option>
              ))}
            </select>
          </label>

          <div className={estilos.fila}>
            <label>
              Gestión
              <input type="text" value={gestion} readOnly />
            </label>

            <label>
              Semestre
              <select name="semestre" required defaultValue="">
                <option value="" disabled>Selecciona</option>
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
            </label>
          </div>

          <div className={estilos.botones}>
            <Link href="/estudiante/proyectos" className={estilos.cancelar}>
              Cancelar
            </Link>
            <button type="submit" className={estilos.guardar}>
              Registrar proyecto
            </button>
          </div>
        </form>
      </div>
    </EstructuraDashboard>
  );
}

export default function PaginaNuevoProyecto({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <Suspense fallback={<CargandoDashboard />}>
      <ContenidoNuevo parametros={searchParams} />
    </Suspense>
  );
}