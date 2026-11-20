
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { protegerRuta } from "@/lib/protegerRuta";

export type EstadoRegistro = {
  error: string;
};

export async function registrarUsuario(
  _estadoAnterior: EstadoRegistro,
  datos: FormData
): Promise<EstadoRegistro> {
  // 1. Verificar autenticación y permisos
  const sesion = await protegerRuta("ADMINISTRADOR");

  // 2. Obtener datos del formulario
  const nombre = String(datos.get("nombre") ?? "").trim();
  const usuario = String(datos.get("usuario") ?? "").trim();
  const contrasena = String(datos.get("contrasena") ?? "");
  const confirmar = String(datos.get("confirmar") ?? "");
  const rol = String(datos.get("rol") ?? "");

  // 3. Validar campos obligatorios
  if (!nombre || !usuario || !contrasena || !rol) {
    return {
      error: "Completa todos los campos obligatorios.",
    };
  }

  if (nombre.length > 120 || usuario.length > 50) {
    return {
      error: "El nombre o usuario supera la longitud permitida.",
    };
  }

  if (!/^[a-zA-Z0-9._-]{3,50}$/.test(usuario)) {
    return {
      error:
        "El usuario debe tener entre 3 y 50 caracteres y solo letras, números, puntos, guiones o guiones bajos.",
    };
  }

  if (contrasena.length < 8 || contrasena.length > 72) {
    return {
      error: "La contraseña debe tener entre 8 y 72 caracteres.",
    };
  }

  if (contrasena !== confirmar) {
    return {
      error: "Las contraseñas no coinciden.",
    };
  }

  // 4. Validar rol
  if (
    rol !== "ADMINISTRADOR" &&
    rol !== "DOCENTE" &&
    rol !== "ESTUDIANTE"
  ) {
    return {
      error: "Selecciona un rol válido.",
    };
  }

  // 5. Comprobar nombre de usuario
  const existente = await prisma.usuario.findUnique({
    where: { usuario },
    select: { id: true },
  });

  if (existente) {
    return {
      error: "El nombre de usuario ya está registrado.",
    };
  }

  // 6. Generar hash seguro de contraseña
  const contrasenaCifrada = await bcrypt.hash(
    contrasena,
    12
  );

  try {
    // 7. Registrar usuario y auditoría
    // dentro de una misma transacción
    await prisma.$transaction(async (tx) => {
      const nuevoUsuario = await tx.usuario.create({
        data: {
          nombre,
          usuario,
          contrasena: contrasenaCifrada,
          rol,
          activo: true,
        },
      });

      // 8. Registrar actividad de auditoría
      await tx.auditoria.create({
        data: {
          tipo: "REGISTRO_USUARIO",
          descripcion:
            `El administrador ${sesion.usuario} registró ` +
            `al usuario ${usuario}.`,
          usuarioId: sesion.id,
          usuarioNombre: sesion.usuario,
          entidadId: nuevoUsuario.id,
          detalles: {
            usuarioRegistrado: usuario,
            nombreRegistrado: nombre,
            rolAsignado: rol,
            estadoInicial: "ACTIVO",
          },
        },
      });
    });
  } catch (error) {
    console.error(
      "[SISCloud] Error al registrar usuario:",
      error
    );

    // P2002: nombre de usuario duplicado
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return {
        error: "El nombre de usuario ya está registrado.",
      };
    }

    return {
      error:
        "No se pudo registrar el usuario. Intenta nuevamente.",
    };
  }

  // 9. Actualizar páginas
  revalidatePath("/administrador");
  revalidatePath("/administrador/usuarios");
  revalidatePath("/administrador/auditoria");

  // 10. Redirigir al listado
  redirect("/administrador/usuarios?registrado=1");
}
