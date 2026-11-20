
"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/sesion";

export type EstadoCambioContrasena = {
  error: string;
  exito: string;
};

export async function cambiarContrasena(
  _estadoAnterior: EstadoCambioContrasena,
  datos: FormData
): Promise<EstadoCambioContrasena> {
  // 1. Verificar la sesión
  const sesion = await obtenerSesion();

  if (!sesion) {
    return {
      error: "Debes iniciar sesión.",
      exito: "",
    };
  }

  // 2. Obtener las contraseñas del formulario
  const actual = String(datos.get("contrasenaActual") ?? "");
  const nueva = String(datos.get("nuevaContrasena") ?? "");
  const confirmar = String(datos.get("confirmarContrasena") ?? "");

  // 3. Validar los datos
  if (!actual || !nueva || !confirmar) {
    return {
      error: "Completa todos los campos.",
      exito: "",
    };
  }

  if (nueva.length < 8 || nueva.length > 72) {
    return {
      error: "La nueva contraseña debe tener entre 8 y 72 caracteres.",
      exito: "",
    };
  }

  if (!/[a-zA-Z]/.test(nueva) || !/[0-9]/.test(nueva)) {
    return {
      error: "La nueva contraseña debe incluir letras y números.",
      exito: "",
    };
  }

  if (nueva !== confirmar) {
    return {
      error: "Las contraseñas nuevas no coinciden.",
      exito: "",
    };
  }

  // 4. Consultar la cuenta actual en Neon
  const usuario = await prisma.usuario.findUnique({
    where: { id: sesion.id },
    select: {
      id: true,
      usuario: true,
      rol: true,
      activo: true,
      contrasena: true,
      versionSesion: true,
    },
  });

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

  // 5. Verificar la contraseña actual
  const contrasenaCorrecta = await bcrypt.compare(
    actual,
    usuario.contrasena
  );

  if (!contrasenaCorrecta) {
    return {
      error: "La contraseña actual es incorrecta.",
      exito: "",
    };
  }

  // 6. Evitar reutilizar la misma contraseña
  const mismaContrasena = await bcrypt.compare(
    nueva,
    usuario.contrasena
  );

  if (mismaContrasena) {
    return {
      error: "La nueva contraseña debe ser diferente de la actual.",
      exito: "",
    };
  }

  // 7. Cifrar la nueva contraseña
  const contrasenaCifrada = await bcrypt.hash(nueva, 12);

  // 8. Actualizar únicamente si la sesión sigue vigente
  const resultado = await prisma.usuario.updateMany({
    where: {
      id: usuario.id,
      activo: true,
      usuario: sesion.usuario,
      rol: sesion.rol,
      versionSesion: sesion.versionSesion,
      contrasena: usuario.contrasena,
    },
    data: {
      contrasena: contrasenaCifrada,
      versionSesion: {
        increment: 1,
      },
    },
  });

  if (resultado.count !== 1) {
    return {
      error: "La cuenta cambió durante la operación. Intenta iniciar sesión nuevamente.",
      exito: "",
    };
  }

  return {
    error: "",
    exito: "Contraseña actualizada. Cierra sesión e inicia nuevamente.",
  };
}
