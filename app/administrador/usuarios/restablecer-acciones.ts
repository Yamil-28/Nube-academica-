
"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { protegerRuta } from "@/lib/protegerRuta";

export type EstadoRestablecimiento = {
  error: string;
  exito: string;
};

export async function restablecerContrasena(
  idUsuario: number,
  _estadoAnterior: EstadoRestablecimiento,
  datos: FormData
): Promise<EstadoRestablecimiento> {
  // 1. Verificar autenticación y rol
  const sesion = await protegerRuta("ADMINISTRADOR");

  // 2. Obtener datos del formulario
  const nueva = String(
    datos.get("nuevaContrasena") ?? ""
  );

  const confirmar = String(
    datos.get("confirmarContrasena") ?? ""
  );

  // 3. Validar identificador
  if (!Number.isSafeInteger(idUsuario) || idUsuario <= 0) {
    return {
      error: "Usuario no válido.",
      exito: "",
    };
  }

  // 4. Validar contraseña
  if (nueva.length < 8 || nueva.length > 72) {
    return {
      error:
        "La contraseña debe tener entre 8 y 72 caracteres.",
      exito: "",
    };
  }

  if (!/[a-zA-Z]/.test(nueva) || !/[0-9]/.test(nueva)) {
    return {
      error:
        "La contraseña debe incluir letras y números.",
      exito: "",
    };
  }

  if (nueva !== confirmar) {
    return {
      error: "Las contraseñas no coinciden.",
      exito: "",
    };
  }

  // 5. Cifrar contraseña
  const contrasenaCifrada = await bcrypt.hash(
    nueva,
    12
  );

  try {
    // 6. Restablecer contraseña y registrar auditoría
    // en una única transacción
    const resultado = await prisma.$transaction(
      async (tx) => {
        // Comprobar que el administrador
        // continúa autorizado
        const administrador = await tx.usuario.findUnique({
          where: {
            id: sesion.id,
          },
        });

        if (
          !administrador ||
          !administrador.activo ||
          administrador.usuario !== sesion.usuario ||
          administrador.rol !== "ADMINISTRADOR" ||
          administrador.versionSesion !==
            sesion.versionSesion
        ) {
          return "No tienes permisos para restablecer contraseñas.";
        }

        // Buscar la cuenta afectada
        const usuario = await tx.usuario.findUnique({
          where: {
            id: idUsuario,
          },
          select: {
            id: true,
            usuario: true,
          },
        });

        if (!usuario) {
          return "El usuario no existe.";
        }

        // 7. Cambiar contraseña e invalidar
        // todas las sesiones anteriores
        await tx.usuario.update({
          where: {
            id: idUsuario,
          },
          data: {
            contrasena: contrasenaCifrada,
            versionSesion: {
              increment: 1,
            },
          },
        });

        // 8. Registrar actividad en Neon
        await tx.auditoria.create({
          data: {
            tipo: "RESTABLECIMIENTO_CONTRASENA",

            descripcion:
              `El administrador ${sesion.usuario} ` +
              `restableció la contraseña del usuario ` +
              `${usuario.usuario}.`,

            usuarioId: sesion.id,
            usuarioNombre: sesion.usuario,
            entidadId: usuario.id,

            detalles: {
              usuarioAfectado: usuario.usuario,
              sesionesAnterioresInvalidadas: true,
            },
          },
        });

        return "";
      }
    );

    // 9. Mostrar errores de autorización
    if (resultado) {
      return {
        error: resultado,
        exito: "",
      };
    }

    // 10. Actualizar historial
    revalidatePath("/administrador/auditoria");

    return {
      error: "",
      exito: "Contraseña restablecida correctamente.",
    };
  } catch (error) {
    console.error(
      "[SISCloud] Error al restablecer contraseña:",
      error
    );

    return {
      error:
        "No se pudo restablecer la contraseña. Intenta nuevamente.",
      exito: "",
    };
  }
}
