
import { NextResponse } from "next/server";

import {
  cerrarSesion,
  obtenerSesion,
} from "@/lib/sesion";

import { prisma } from "@/lib/prisma";

export async function POST() {
  // 1. Obtener los datos de la sesión
  // antes de eliminarla
  let sesion: Awaited<
    ReturnType<typeof obtenerSesion>
  > = null;

  try {
    sesion = await obtenerSesion();
  } catch (error) {
    console.error(
      "[SISCloud] Error al consultar la sesión:",
      error
    );
  }

  // 2. Registrar el cierre de sesión
  if (sesion) {
    try {
      await prisma.auditoria.create({
        data: {
          tipo: "CIERRE_SESION",

          descripcion:
            `El usuario ${sesion.usuario} ` +
            `cerró su sesión en SISCloud.`,

          usuarioId: sesion.id,
          usuarioNombre: sesion.usuario,

          detalles: {
            rol: sesion.rol,
            resultado: "CIERRE_SOLICITADO",
          },
        },
      });
    } catch (error) {
      // Un error de auditoría no debe impedir
      // que el usuario cierre sesión.
      console.error(
        "[SISCloud] Error al registrar cierre de sesión:",
        error
      );
    }
  }

  // 3. Eliminar la sesión
  try {
    await cerrarSesion();

    return NextResponse.json({
      correcto: true,
      mensaje: "Sesión cerrada correctamente.",
    });
  } catch (error) {
    console.error(
      "[SISCloud] Error al cerrar sesión:",
      error
    );

    return NextResponse.json(
      {
        correcto: false,
        mensaje: "No se pudo cerrar la sesión.",
      },
      { status: 500 }
    );
  }
}
