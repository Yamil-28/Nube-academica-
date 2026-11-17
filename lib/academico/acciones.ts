
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { protegerRuta } from "@/lib/protegerRuta";
import {
  actualizarMateria,
  asignarDocente,
  cambiarEstadoMateria,
  cambiarEstadoPeriodo,
  crearMateria,
  crearPeriodo,
  ErrorNegocio,
  establecerPeriodoVigente,
  quitarAsignacion,
} from "@/lib/academico/repositorio";
import {
  leerId,
  validarAsignacion,
  validarMateria,
  validarPeriodo,
} from "@/lib/academico/validaciones";
import {
  etiquetaMateria,
  nombrePeriodo,
  type EstadoFormulario,
} from "@/lib/academico/tipos";

/* ==========================================
   ACCIONES DEL SERVIDOR - GESTIÓN ACADÉMICA
   Cada acción vuelve a comprobar en el servidor
   que quien la ejecuta es ADMINISTRADOR
   (Tabla 6: solo él registra y administra).
========================================== */

const RUTAS = {
  periodos: "/administrador/periodos",
  materias: "/administrador/materias",
  docentes: "/administrador/docentes",
};

// Rutas de docente y estudiante que muestran estos datos
function actualizarVistas() {
  for (const ruta of [
    ...Object.values(RUTAS),
    "/docente/materias",
    "/estudiante/materias",
    "/estudiante/docentes",
  ]) {
    revalidatePath(ruta);
  }
}

function error(mensaje: string, errores?: Record<string, string>): EstadoFormulario {
  return { estado: "error", mensaje, errores };
}

function exito(mensaje: string): EstadoFormulario {
  return { estado: "exito", mensaje, marca: Date.now() };
}

// Ejecuta la operación y convierte los errores de negocio en mensajes
async function ejecutar(
  operacion: () => Promise<unknown>,
  mensajeExito: string
): Promise<EstadoFormulario> {
  try {
    await operacion();
  } catch (fallo) {
    if (fallo instanceof ErrorNegocio) {
      return error(fallo.message);
    }

    console.error("Error en gestión académica:", fallo);
    return error("Ocurrió un error inesperado. Inténtalo nuevamente.");
  }

  actualizarVistas();
  return exito(mensajeExito);
}

/* ==========================================
   PERIODOS
========================================== */

export async function accionCrearPeriodo(
  _anterior: EstadoFormulario,
  formulario: FormData
): Promise<EstadoFormulario> {
  await protegerRuta("ADMINISTRADOR");

  const validacion = validarPeriodo(formulario);
  if (!validacion.valido) {
    return error("Revisa los datos del periodo.", validacion.errores);
  }

  return ejecutar(
    () => crearPeriodo(validacion.datos),
    `Periodo ${nombrePeriodo(validacion.datos)} registrado.`
  );
}

export async function accionEstablecerVigente(
  _anterior: EstadoFormulario,
  formulario: FormData
): Promise<EstadoFormulario> {
  await protegerRuta("ADMINISTRADOR");

  const id = leerId(formulario);
  if (!id) return error("Periodo no válido.");

  return ejecutar(
    () => establecerPeriodoVigente(id),
    "Periodo vigente actualizado."
  );
}

export async function accionCambiarEstadoPeriodo(
  _anterior: EstadoFormulario,
  formulario: FormData
): Promise<EstadoFormulario> {
  await protegerRuta("ADMINISTRADOR");

  const id = leerId(formulario);
  if (!id) return error("Periodo no válido.");

  return ejecutar(() => cambiarEstadoPeriodo(id), "Estado del periodo actualizado.");
}

/* ==========================================
   MATERIAS
========================================== */

export async function accionCrearMateria(
  _anterior: EstadoFormulario,
  formulario: FormData
): Promise<EstadoFormulario> {
  await protegerRuta("ADMINISTRADOR");

  const validacion = validarMateria(formulario);
  if (!validacion.valido) {
    return error("Revisa los datos de la materia.", validacion.errores);
  }

  return ejecutar(
    () => crearMateria(validacion.datos),
    `Materia "${etiquetaMateria(validacion.datos)}" registrada.`
  );
}

export async function accionActualizarMateria(
  _anterior: EstadoFormulario,
  formulario: FormData
): Promise<EstadoFormulario> {
  await protegerRuta("ADMINISTRADOR");

  const id = leerId(formulario);
  if (!id) return error("Materia no válida.");

  const validacion = validarMateria(formulario);
  if (!validacion.valido) {
    return error("Revisa los datos de la materia.", validacion.errores);
  }

  const resultado = await ejecutar(
    () => actualizarMateria(id, validacion.datos),
    "Materia actualizada."
  );

  // Al guardar, se vuelve a la lista (sale del modo edición)
  if (resultado.estado === "exito") {
    redirect(`${RUTAS.materias}?guardado=1`);
  }

  return resultado;
}

export async function accionCambiarEstadoMateria(
  _anterior: EstadoFormulario,
  formulario: FormData
): Promise<EstadoFormulario> {
  await protegerRuta("ADMINISTRADOR");

  const id = leerId(formulario);
  if (!id) return error("Materia no válida.");

  return ejecutar(() => cambiarEstadoMateria(id), "Estado de la materia actualizado.");
}

/* ==========================================
   ASIGNACIONES
========================================== */

export async function accionAsignarDocente(
  _anterior: EstadoFormulario,
  formulario: FormData
): Promise<EstadoFormulario> {
  await protegerRuta("ADMINISTRADOR");

  const validacion = validarAsignacion(formulario);
  if (!validacion.valido) {
    return error("Completa todos los campos de la asignación.", validacion.errores);
  }

  return ejecutar(
    () => asignarDocente(validacion.datos),
    "Docente asignado correctamente."
  );
}

export async function accionQuitarAsignacion(
  _anterior: EstadoFormulario,
  formulario: FormData
): Promise<EstadoFormulario> {
  await protegerRuta("ADMINISTRADOR");

  const id = leerId(formulario);
  if (!id) return error("Asignación no válida.");

  return ejecutar(() => quitarAsignacion(id), "Asignación eliminada.");
}
