
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import {
  crearSesion,
  obtenerRutaPorRol,
} from "@/lib/sesion";

export async function POST(solicitud: NextRequest) {
  // 1. Obtener CAPTCHA y datos del formulario
  const tokenCaptcha = solicitud.cookies.get(
    "captcha_siscloud"
  )?.value;

  // Esta cookie debe eliminarse después del intento.
  function respuestaError(mensaje: string, estado = 400) {
    const respuesta = NextResponse.json(
      { correcto: false, mensaje },
      { status: estado }
    );

    respuesta.cookies.delete("captcha_siscloud");
    return respuesta;
  }

  try {
    const datos = await solicitud.json();

    const usuario = String(datos.usuario ?? "")
      .trim()
      .toLowerCase();

    const contrasena = String(datos.contrasena ?? "");
    const codigoCaptcha = String(datos.codigoCaptcha ?? "")
      .trim()
      .toUpperCase();

    if (!usuario || !contrasena || !codigoCaptcha) {
      return respuestaError(
        "Completa el usuario, la contraseña y el CAPTCHA."
      );
    }

    // 2. Verificar CAPTCHA
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

    // 3. Buscar usuario en PostgreSQL
    const cuenta = await prisma.usuario.findUnique({
      where: { usuario },
    });

    if (!cuenta) {
      return respuestaError(
        "Usuario o contraseña incorrectos.",
        401
      );
    }

    // 4. Verificar cuenta activa
    if (!cuenta.activo) {
      return respuestaError(
        "Tu cuenta se encuentra deshabilitada.",
        403
      );
    }

    // 5. Comprobar contraseña
    const contrasenaCorrecta = await bcrypt.compare(
      contrasena,
      cuenta.contrasena
    );

    if (!contrasenaCorrecta) {
      return respuestaError(
        "Usuario o contraseña incorrectos.",
        401
      );
    }

    // 6. Crear sesión
    await crearSesion({
      id: cuenta.id,
      usuario: cuenta.usuario,
      rol: cuenta.rol,
    });

    // 7. Obtener panel según rol
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
    console.error("Error al iniciar sesión:", error);

    return respuestaError(
      "Ocurrió un error al iniciar sesión.",
      500
    );
  }
}
