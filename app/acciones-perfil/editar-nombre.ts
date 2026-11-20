
"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/sesion";

export type EstadoEditarNombre = {
  error: string;
  exito: string;
};

export async function editarNombre(
  _estadoAnterior: EstadoEditarNombre,
  datos: FormData
): Promise<EstadoEditarNombre> {
  // 1. Verificar que exista una sesión
  const sesion = await obtenerSesion();

  if (!sesion) {
    return {
      error: "Debes iniciar sesión para editar tu perfil.",
      exito: "",
    };
  }

  // 2. Obtener y limpiar el nuevo nombre
  const nombre = String(datos.get("nombre") ?? "")
    .trim()
    .replace(/\s+/g, " ");

  // 3. Validar el nombre
  if (nombre.length < 3 || nombre.length > 100) {
    return {
      error: "El nombre debe tener entre 3 y 100 caracteres.",
      exito: "",
    };
  }

  // 4. Buscar la cuenta autenticada
  const usuario = await prisma.usuario.findUnique({
    where: {
      id: sesion.id,
    },
    select: {
      id: true,
      usuario: true,
      nombre: true,
      rol: true,
      activo: true,
      versionSesion: true,
    },
  });

  // 5. Verificar que la sesión siga siendo válida
  if (
    !usuario ||
    !usuario.activo ||
    usuario.usuario !== sesion.usuario ||
    usuario.rol !== sesion.rol ||
    usuario.versionSesion !== sesion.versionSesion
  ) {
    return {
      error: "Tu sesión ya no es válida. Inicia sesión nuevamente.",
      exito: "",
    };
  }

  // 6. Evitar actualizaciones innecesarias
  if (usuario.nombre === nombre) {
    return {
      error: "El nombre ingresado es igual al actual.",
      exito: "",
    };
  }

  // 7. Actualizar únicamente el nombre
  const resultado = await prisma.usuario.updateMany({
    where: {
      id: usuario.id,
      usuario: sesion.usuario,
      rol: sesion.rol,
      activo: true,
      versionSesion: sesion.versionSesion,
    },
    data: {
      nombre,
    },
  });

  if (resultado.count !== 1) {
    return {
      error: "No se pudo actualizar el perfil. Inténtalo nuevamente.",
      exito: "",
    };
  }

  // 8. Actualizar las páginas del perfil
  revalidatePath("/administrador/perfil");
  revalidatePath("/docente/perfil");
  revalidatePath("/estudiante/perfil");

  return {
    error: "",
    exito: "Tu nombre se actualizó correctamente.",
  };
}
