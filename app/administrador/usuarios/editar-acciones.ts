
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { protegerRuta } from "@/lib/protegerRuta";
import { esAdministradorPrincipal, esNombreReservado, puedeAdministrarCuenta } from "@/lib/administradorPrincipal";

export type EstadoEdicion = {
  error: string;
  exito: string;
};

export async function actualizarUsuario(
  id: number,
  _anterior: EstadoEdicion,
  datos: FormData
): Promise<EstadoEdicion> {
  // 1. Verificar autenticación y permisos
  const sesion = await protegerRuta("ADMINISTRADOR");

  // 2. Obtener datos del formulario
  const nombre = String(datos.get("nombre") ?? "").trim();
  const usuario = String(datos.get("usuario") ?? "").trim();
  const rol = String(datos.get("rol") ?? "");
  const activo = datos.get("activo") === "true";

  // 3. Validar campos
  if (!nombre || !usuario || !rol) {
    return {
      error: "Completa todos los campos.",
      exito: "",
    };
  }

  if (nombre.length > 120) {
    return {
      error: "El nombre es demasiado largo.",
      exito: "",
    };
  }

  if (!/^[a-zA-Z0-9._-]{3,50}$/.test(usuario)) {
    return {
      error:
        "El usuario debe tener entre 3 y 50 caracteres válidos.",
      exito: "",
    };
  }

  // 4. Validar rol
  if (
    rol !== "ADMINISTRADOR" &&
    rol !== "DOCENTE" &&
    rol !== "ESTUDIANTE"
  ) {
    return {
      error: "Rol no válido.",
      exito: "",
    };
  }

  // 5. Validar identificador
  if (!Number.isSafeInteger(id) || id <= 0) {
    return {
      error: "Usuario no válido.",
      exito: "",
    };
  }

  // 6. Actualizar usuario y registrar auditoría
  try {
    const resultado = await prisma.$transaction(
      async (tx) => {
        // Bloqueo para proteger administradores
        // ante modificaciones simultáneas
        await tx.$executeRaw`
          SELECT pg_advisory_xact_lock(719221)
        `;

        // Verificar permisos dentro de la transacción
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
          return "No tienes permisos para editar usuarios.";
        }

        // Buscar usuario que se modificará
        const cuenta = await tx.usuario.findUnique({
          where: {
            id,
          },
        });

        if (!cuenta) {
          return "El usuario no existe.";
        }

        if (!puedeAdministrarCuenta(administrador, cuenta)) {
          return "Solo el administrador principal puede gestionar esta cuenta.";
        }

        if (rol === "ADMINISTRADOR" && cuenta.rol !== rol && !esAdministradorPrincipal(administrador)) {
          return "Solo el administrador principal puede asignar el rol de administrador.";
        }

        if (esNombreReservado(usuario) && usuario !== cuenta.usuario) {
          return "Ese nombre de usuario está reservado para la cuenta principal.";
        }

        // Proteger la propia cuenta del administrador
        if (
          cuenta.id === administrador.id &&
          (
            rol !== "ADMINISTRADOR" ||
            !activo ||
            usuario !== cuenta.usuario
          )
        ) {
          return "No puedes cambiar tu propio rol, estado o usuario.";
        }

        // Proteger al último administrador activo
        if (
          cuenta.rol === "ADMINISTRADOR" &&
          cuenta.activo &&
          (
            rol !== "ADMINISTRADOR" ||
            !activo
          )
        ) {
          const administradoresActivos =
            await tx.usuario.count({
              where: {
                rol: "ADMINISTRADOR",
                activo: true,
              },
            });

          if (administradoresActivos <= 1) {
            return "No puedes desactivar al último administrador activo.";
          }
        }

        // 7. Identificar cambios antes de guardar
        const cambioNombre =
          cuenta.nombre !== nombre;

        const cambioUsuario =
          cuenta.usuario !== usuario;

        const cambioRol =
          cuenta.rol !== rol;

        const cambioEstado =
          cuenta.activo !== activo;

        const cambioDatos =
          cambioNombre ||
          cambioUsuario ||
          cambioRol;

        // No generar eventos si no hay cambios
        if (!cambioDatos && !cambioEstado) {
          return "";
        }

        // 8. Guardar cambios en PostgreSQL
        await tx.usuario.update({
          where: {
            id,
          },
          data: {
            nombre,
            usuario,
            rol,
            activo,
          },
        });

        // 9. Registrar edición de datos
        if (cambioDatos) {
          await tx.auditoria.create({
            data: {
              tipo: "EDICION_USUARIO",

              descripcion:
                `El administrador ${sesion.usuario} ` +
                `modificó los datos del usuario ` +
                `${cuenta.usuario}.`,

              usuarioId: sesion.id,
              usuarioNombre: sesion.usuario,
              entidadId: id,

              detalles: {
                usuarioAnterior: cuenta.usuario,
                usuarioNuevo: usuario,

                nombreAnterior: cuenta.nombre,
                nombreNuevo: nombre,

                rolAnterior: cuenta.rol,
                rolNuevo: rol,
              },
            },
          });
        }

        // 10. Registrar activación o desactivación
        if (cambioEstado) {
          const tipoEvento = activo
            ? "ACTIVACION_USUARIO"
            : "DESACTIVACION_USUARIO";

          await tx.auditoria.create({
            data: {
              tipo: tipoEvento,

              descripcion: activo
                ? `El administrador ${sesion.usuario} ` +
                  `activó la cuenta ${usuario}.`
                : `El administrador ${sesion.usuario} ` +
                  `desactivó la cuenta ${usuario}.`,

              usuarioId: sesion.id,
              usuarioNombre: sesion.usuario,
              entidadId: id,

              detalles: {
                usuarioAfectado: usuario,
                estadoAnterior: cuenta.activo
                  ? "ACTIVO"
                  : "INACTIVO",
                estadoNuevo: activo
                  ? "ACTIVO"
                  : "INACTIVO",
              },
            },
          });
        }

        return "";
      }
    );

    // 11. Mostrar errores de validación
    if (resultado) {
      return {
        error: resultado,
        exito: "",
      };
    }

    // 12. Actualizar páginas
    revalidatePath("/administrador");
    revalidatePath("/administrador/usuarios");
    revalidatePath(
      `/administrador/usuarios/${id}/editar`
    );
    revalidatePath("/administrador/auditoria");

    return {
      error: "",
      exito:
        "Los datos del usuario se actualizaron correctamente.",
    };
  } catch (error) {
    console.error(
      "[SISCloud] Error al actualizar usuario:",
      error
    );

    // Nombre de usuario duplicado
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return {
        error: "Ese nombre de usuario ya está registrado.",
        exito: "",
      };
    }

    return {
      error: "No se pudieron guardar los cambios.",
      exito: "",
    };
  }
}
