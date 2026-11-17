
import "server-only";

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { prisma } from "@/lib/prisma";
import {
  etiquetaMateria,
  nombrePeriodo,
  type AsignacionDetallada,
  type AsignacionDocente,
  type DatosMateria,
  type Docente,
  type Materia,
  type PeriodoAcademico,
  type Semestre,
} from "@/lib/academico/tipos";

/* ==========================================
   GESTIÓN ACADÉMICA - REPOSITORIO DE DATOS
   ------------------------------------------
   ÚNICO archivo que accede a los datos del módulo.
   Las pantallas y acciones solo usan estas funciones.

   ⚠ PROVISIONAL: periodos, materias y asignaciones se
   guardan en el archivo datos-locales/gestion-academica.json
   (persisten al reiniciar el servidor) hasta crear sus
   tablas en PostgreSQL (Neon) sin afectar la base del
   equipo. Al migrar, solo se reemplaza el cuerpo de estas
   funciones por consultas Prisma; las firmas no cambian.

   Los docentes SÍ se leen de la tabla real `usuarios`.
========================================== */

export const USANDO_DATOS_DE_PRUEBA = true;

// Error de regla de negocio: su mensaje se muestra al usuario
export class ErrorNegocio extends Error {}

const ARCHIVO = path.join(process.cwd(), "datos-locales", "gestion-academica.json");

type Almacen = {
  periodos: PeriodoAcademico[];
  materias: Materia[];
  asignaciones: AsignacionDocente[];
  siguienteId: number;
  asignacionesIniciales: boolean;
};

/* ==========================================
   ALMACENAMIENTO EN ARCHIVO
========================================== */

// Registros iniciales del documento (Figura 6: tabla materias)
const MATERIAS_INICIALES = [
  "Sistemas de Información II",
  "Redes Avanzadas",
  "Ingeniería de Sistemas II",
  "Big Data",
  "Desarrollo de Aplicaciones Móviles",
];

function crearAlmacen(): Almacen {
  const ahora = new Date();
  let id = 1;

  const periodos: PeriodoAcademico[] = [
    { id: id++, gestion: 2026, semestre: "I", vigente: false, activo: true, creadoEn: ahora },
    { id: id++, gestion: 2026, semestre: "II", vigente: true, activo: true, creadoEn: ahora },
  ];

  const materias: Materia[] = MATERIAS_INICIALES.map((nombre) => ({
    id: id++,
    codigo: null,
    nombre,
    nivel: 6,
    descripcion: "Materia de la carrera",
    activa: true,
    creadoEn: ahora,
  }));

  return {
    periodos,
    materias,
    asignaciones: [],
    siguienteId: id,
    asignacionesIniciales: false,
  };
}

// Convierte las fechas del JSON (texto) en objetos Date
function revivirFechas(_clave: string, valor: unknown) {
  return _clave === "creadoEn" && typeof valor === "string" ? new Date(valor) : valor;
}

function guardar(datos: Almacen) {
  mkdirSync(path.dirname(ARCHIVO), { recursive: true });
  writeFileSync(ARCHIVO, JSON.stringify(datos, null, 2), "utf-8");
}

function almacen(): Almacen {
  if (existsSync(ARCHIVO)) {
    try {
      return JSON.parse(readFileSync(ARCHIVO, "utf-8"), revivirFechas) as Almacen;
    } catch (error) {
      console.error("No se pudo leer gestion-academica.json; se recrea.", error);
    }
  }

  const nuevo = crearAlmacen();
  guardar(nuevo);
  return nuevo;
}

// Ejecuta un cambio sobre los datos y lo guarda en el archivo
async function modificar<T>(cambio: (datos: Almacen) => T | Promise<T>): Promise<T> {
  const datos = almacen();
  const resultado = await cambio(datos);
  guardar(datos);
  return resultado;
}

function nuevoId(datos: Almacen): number {
  return datos.siguienteId++;
}

/* ==========================================
   DOCENTES (TABLA REAL `usuarios`)
========================================== */

export async function listarDocentes(soloActivos = false): Promise<Docente[]> {
  return prisma.usuario.findMany({
    where: {
      rol: "DOCENTE",
      ...(soloActivos ? { activo: true } : {}),
    },
    orderBy: { nombre: "asc" },
    select: { id: true, nombre: true, usuario: true, activo: true },
  });
}

// La primera vez asigna dos materias al primer docente activo,
// para que el panel del docente no aparezca vacío en la demostración.
async function prepararAsignacionesIniciales() {
  if (almacen().asignacionesIniciales) return;

  const docente = await prisma.usuario.findFirst({
    where: { rol: "DOCENTE", activo: true },
    orderBy: { id: "asc" },
    select: { id: true },
  });

  await modificar((datos) => {
    datos.asignacionesIniciales = true;

    const vigente = datos.periodos.find((periodo) => periodo.vigente);
    if (!docente || !vigente) return;

    for (const nombre of ["Sistemas de Información II", "Ingeniería de Sistemas II"]) {
      const materia = datos.materias.find((m) => m.nombre === nombre);

      if (materia) {
        datos.asignaciones.push({
          id: nuevoId(datos),
          idDocente: docente.id,
          idMateria: materia.id,
          idPeriodo: vigente.id,
          creadoEn: new Date(),
        });
      }
    }
  });
}

/* ==========================================
   PERIODOS ACADÉMICOS
========================================== */

function ordenarPeriodos(a: PeriodoAcademico, b: PeriodoAcademico) {
  return b.gestion - a.gestion || b.semestre.localeCompare(a.semestre);
}

export async function listarPeriodos(soloActivos = false) {
  return almacen()
    .periodos.filter((periodo) => !soloActivos || periodo.activo)
    .sort(ordenarPeriodos);
}

export async function obtenerPeriodoVigente() {
  return almacen().periodos.find((p) => p.vigente) ?? null;
}

export async function crearPeriodo(datos: { gestion: number; semestre: Semestre }) {
  return modificar((almacenDatos) => {
    const { periodos } = almacenDatos;

    if (periodos.some((p) => p.gestion === datos.gestion && p.semestre === datos.semestre)) {
      throw new ErrorNegocio(`El periodo ${nombrePeriodo(datos)} ya está registrado.`);
    }

    const periodo: PeriodoAcademico = {
      id: nuevoId(almacenDatos),
      ...datos,
      // Si no hay periodo vigente, el nuevo pasa a serlo
      vigente: !periodos.some((p) => p.vigente),
      activo: true,
      creadoEn: new Date(),
    };

    periodos.push(periodo);
    return periodo;
  });
}

export async function establecerPeriodoVigente(id: number) {
  await modificar(({ periodos }) => {
    const periodo = periodos.find((p) => p.id === id);

    if (!periodo) throw new ErrorNegocio("El periodo no existe.");
    if (!periodo.activo) {
      throw new ErrorNegocio("Activa el periodo antes de marcarlo como vigente.");
    }

    // Solo un periodo vigente a la vez
    for (const p of periodos) p.vigente = p.id === id;
  });
}

export async function cambiarEstadoPeriodo(id: number) {
  await modificar(({ periodos }) => {
    const periodo = periodos.find((p) => p.id === id);

    if (!periodo) throw new ErrorNegocio("El periodo no existe.");
    if (periodo.vigente && periodo.activo) {
      throw new ErrorNegocio(
        "No puedes desactivar el periodo vigente. Marca otro como vigente primero."
      );
    }

    periodo.activo = !periodo.activo;
  });
}

/* ==========================================
   MATERIAS
========================================== */

export async function listarMaterias(
  filtros: { busqueda?: string; nivel?: number; soloActivas?: boolean } = {}
) {
  const busqueda = filtros.busqueda?.toLowerCase() ?? "";

  return almacen()
    .materias.filter(
      (materia) =>
        (!filtros.soloActivas || materia.activa) &&
        (!filtros.nivel || materia.nivel === filtros.nivel) &&
        (!busqueda ||
          materia.nombre.toLowerCase().includes(busqueda) ||
          (materia.codigo ?? "").toLowerCase().includes(busqueda))
    )
    .sort((a, b) => a.nivel - b.nivel || a.nombre.localeCompare(b.nombre, "es"));
}

export async function obtenerMateria(id: number) {
  return almacen().materias.find((m) => m.id === id) ?? null;
}

// Código y nombre no se repiten (el código solo si se indicó)
function verificarMateriaUnica(datos: Almacen, materia: DatosMateria, idActual?: number) {
  for (const otra of datos.materias) {
    if (otra.id === idActual) continue;

    if (materia.codigo && otra.codigo === materia.codigo) {
      throw new ErrorNegocio(`El código ${materia.codigo} ya pertenece a "${otra.nombre}".`);
    }

    if (otra.nombre.toLowerCase() === materia.nombre.toLowerCase()) {
      throw new ErrorNegocio(`La materia "${otra.nombre}" ya está registrada.`);
    }
  }
}

export async function crearMateria(materia: DatosMateria) {
  return modificar((datos) => {
    verificarMateriaUnica(datos, materia);

    const nueva: Materia = {
      id: nuevoId(datos),
      ...materia,
      activa: true,
      creadoEn: new Date(),
    };

    datos.materias.push(nueva);
    return nueva;
  });
}

export async function actualizarMateria(id: number, materia: DatosMateria) {
  await modificar((datos) => {
    const actual = datos.materias.find((m) => m.id === id);

    if (!actual) throw new ErrorNegocio("La materia no existe.");

    verificarMateriaUnica(datos, materia, id);
    Object.assign(actual, materia);
  });
}

export async function cambiarEstadoMateria(id: number) {
  await modificar(({ materias }) => {
    const materia = materias.find((m) => m.id === id);

    if (!materia) throw new ErrorNegocio("La materia no existe.");
    materia.activa = !materia.activa;
  });
}

/* ==========================================
   ASIGNACIONES DOCENTE - MATERIA - PERIODO
========================================== */

export async function listarAsignaciones(
  filtros: { idPeriodo?: number; idDocente?: number } = {}
): Promise<AsignacionDetallada[]> {
  await prepararAsignacionesIniciales();

  const datos = almacen();
  const docentes = await listarDocentes();

  const resultado: AsignacionDetallada[] = [];

  for (const asignacion of datos.asignaciones) {
    if (filtros.idPeriodo && asignacion.idPeriodo !== filtros.idPeriodo) continue;
    if (filtros.idDocente && asignacion.idDocente !== filtros.idDocente) continue;

    const periodo = datos.periodos.find((p) => p.id === asignacion.idPeriodo);
    const materia = datos.materias.find((m) => m.id === asignacion.idMateria);
    const docente = docentes.find((d) => d.id === asignacion.idDocente);

    // Si el docente ya no existe en `usuarios`, la asignación se omite
    if (periodo && materia && docente) {
      resultado.push({ id: asignacion.id, periodo, materia, docente });
    }
  }

  return resultado.sort(
    (a, b) =>
      ordenarPeriodos(a.periodo, b.periodo) ||
      a.materia.nivel - b.materia.nivel ||
      a.materia.nombre.localeCompare(b.materia.nombre, "es")
  );
}

export async function asignarDocente(datos: {
  idDocente: number;
  idMateria: number;
  idPeriodo: number;
}) {
  await prepararAsignacionesIniciales();

  const docente = await prisma.usuario.findFirst({
    where: { id: datos.idDocente, rol: "DOCENTE" },
    select: { activo: true },
  });
  if (!docente) throw new ErrorNegocio("El docente seleccionado no existe.");
  if (!docente.activo) throw new ErrorNegocio("El docente seleccionado está inactivo.");

  await modificar((almacenDatos) => {
    const materia = almacenDatos.materias.find((m) => m.id === datos.idMateria);
    if (!materia) throw new ErrorNegocio("La materia seleccionada no existe.");
    if (!materia.activa) throw new ErrorNegocio("La materia seleccionada está inactiva.");

    const periodo = almacenDatos.periodos.find((p) => p.id === datos.idPeriodo);
    if (!periodo) throw new ErrorNegocio("El periodo seleccionado no existe.");
    if (!periodo.activo) throw new ErrorNegocio("El periodo seleccionado está inactivo.");

    const repetida = almacenDatos.asignaciones.some(
      (a) =>
        a.idDocente === datos.idDocente &&
        a.idMateria === datos.idMateria &&
        a.idPeriodo === datos.idPeriodo
    );

    if (repetida) {
      throw new ErrorNegocio(
        `Ese docente ya tiene asignada "${etiquetaMateria(materia)}" en ${nombrePeriodo(periodo)}.`
      );
    }

    almacenDatos.asignaciones.push({
      id: nuevoId(almacenDatos),
      ...datos,
      creadoEn: new Date(),
    });
  });
}

export async function quitarAsignacion(id: number) {
  await modificar((datos) => {
    const indice = datos.asignaciones.findIndex((a) => a.id === id);

    if (indice === -1) throw new ErrorNegocio("La asignación no existe.");
    datos.asignaciones.splice(indice, 1);
  });
}
