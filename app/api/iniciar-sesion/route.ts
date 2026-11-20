
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import {
  crearSesion,
  obtenerRutaPorRol,
} from "@/lib/sesion";

export async function POST(solicitud: NextRequest) {
  // 1. Obtener cookie CAPTCHA
  const tokenCaptcha = solicitud.cookies.get(
    "captcha_siscloud"
  )?.value;

  // Generar respuestas de error
  function respuestaError(mensaje: string, estado = 400) {
    const respuesta = NextResponse.json(
      { correcto: false, mensaje },
      { status: estado }
    );

    respuesta.cookies.delete("captcha_siscloud");
    return respuesta;
  }

  try {
    // 2. Obtener datos del formulario
    const datos = await solicitud.json();

    const usuario = String(datos.usuario ?? "")
      .trim()
      .toLowerCase();

    const contrasena = String(datos.contrasena ?? "");

    const codigoCaptcha = String(
      datos.codigoCaptcha ?? ""
    )
      .trim()
      .toUpperCase();

    if (!usuario || !contrasena || !codigoCaptcha) {
      return respuestaError(
        "Completa el usuario, la contraseña y el CAPTCHA."
      );
    }

    // 3. Verificar CAPTCHA
    const secretoCaptcha =
      process.env.CLAVE_SECRETA_CAPTCHA;

    if (!secretoCaptcha || !tokenCaptcha) {
      return respuestaError(
        "El CAPTCHA ha vencido. Genera uno nuevo."
      );
    }

    try {
      const { payload } = await jwtVerify(
        tokenCaptcha,
        new TextEncoder().encode(secretoCaptcha),
        { algorithms: ["HS256"] }
      );

      if (
        typeof payload.codigo !== "string" ||
        payload.codigo !== codigoCaptcha
      ) {
        return respuestaError(
          "CAPTCHA incorrecto. Inténtalo nuevamente."
        );
      }
    } catch {
      return respuestaError(
        "CAPTCHA incorrecto o vencido."
      );
    }

    // 4. Buscar usuario en PostgreSQL
    const cuenta = await prisma.usuario.findUnique({
      where: { usuario },
    });

    // 5. Usuario inexistente
    if (!cuenta) {
      await prisma.auditoria.create({
        data: {
          tipo: "INICIO_SESION_FALLIDO",
          descripcion:
            `Intento de inicio de sesión fallido ` +
            `con el usuario ${usuario}.`,
          usuarioNombre: usuario,
          detalles: {
            motivo: "USUARIO_INEXISTENTE",
          },
        },
      });

      return respuestaError(
        "Usuario o contraseña incorrectos.",
        401
      );
    }

    // 6. Cuenta deshabilitada
    if (!cuenta.activo) {
      await prisma.auditoria.create({
        data: {
          tipo: "ACCESO_DENEGADO",
          descripcion:
            `Intento de acceso a la cuenta ` +
            `deshabilitada ${cuenta.usuario}.`,
          usuarioId: cuenta.id,
          usuarioNombre: cuenta.usuario,
          detalles: {
            motivo: "CUENTA_DESHABILITADA",
          },
        },
      });

      return respuestaError(
        "Tu cuenta se encuentra deshabilitada.",
        403
      );
    }

    // 7. Verificar contraseña
    const contrasenaCorrecta = await bcrypt.compare(
      contrasena,
      cuenta.contrasena
    );

    if (!contrasenaCorrecta) {
      await prisma.auditoria.create({
        data: {
          tipo: "INICIO_SESION_FALLIDO",
          descripcion:
            `Contraseña incorrecta para el usuario ` +
            `${cuenta.usuario}.`,
          usuarioId: cuenta.id,
          usuarioNombre: cuenta.usuario,
          detalles: {
            motivo: "CONTRASENA_INCORRECTA",
          },
        },
      });

      return respuestaError(
        "Usuario o contraseña incorrectos.",
        401
      );
    }

    // 8. Crear sesión
    await crearSesion({
      id: cuenta.id,
      usuario: cuenta.usuario,
      rol: cuenta.rol,
      versionSesion: cuenta.versionSesion,
    });

    // 9. Registrar inicio de sesión exitoso
    await prisma.auditoria.create({
      data: {
        tipo: "INICIO_SESION",
        descripcion:
          `El usuario ${cuenta.usuario} ` +
          `inició sesión correctamente.`,
        usuarioId: cuenta.id,
        usuarioNombre: cuenta.usuario,
        detalles: {
          rol: cuenta.rol,
          resultado: "EXITOSO",
        },
      },
    });

    // 10. Obtener panel según rol
    const ruta = obtenerRutaPorRol(cuenta.rol);

    const respuesta = NextResponse.json({
      correcto: true,
      mensaje: "Inicio de sesión correcto.",
      ruta,
      usuario: cuenta.usuario,
      rol: cuenta.rol,
    });

    respuesta.cookies.delete("captcha_siscloud");

    return respuesta;
  } catch (error) {
    console.error(
      "[SISCloud] Error al iniciar sesión:",
      error
    );

    return respuestaError(
      "Ocurrió un error al iniciar sesión.",
      500
    );
  }
}
