
import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type RolUsuario =
  | "ADMINISTRADOR"
  | "DOCENTE"
  | "ESTUDIANTE";

export type DatosSesion = {
  id: number;
  usuario: string;
  rol: RolUsuario;
};

const NOMBRE_COOKIE = "siscloud_sesion";
const DURACION_SESION = 60 * 60 * 8; // 8 horas

function obtenerClaveSecreta() {
  const clave = process.env.CLAVE_SECRETA_SESION;

  if (!clave || clave.length < 32) {
    throw new Error(
      "Configura CLAVE_SECRETA_SESION con al menos 32 caracteres."
    );
  }

  return new TextEncoder().encode(clave);
}

// Crear una sesión después de validar las credenciales
export async function crearSesion(datos: DatosSesion) {
  const token = await new SignJWT({
    usuario: datos.usuario,
    rol: datos.rol,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(datos.id))
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(obtenerClaveSecreta());

  const almacenCookies = await cookies();

  almacenCookies.set(NOMBRE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACION_SESION,
  });
}

// Obtener y comprobar la sesión actual
export async function obtenerSesion(): Promise<DatosSesion | null> {
  const almacenCookies = await cookies();
  const token = almacenCookies.get(NOMBRE_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      obtenerClaveSecreta(),
      { algorithms: ["HS256"] }
    );

    const id = Number(payload.sub);
    const usuario = payload.usuario;
    const rol = payload.rol;

    if (
      !Number.isSafeInteger(id) ||
      id <= 0 ||
      typeof usuario !== "string" ||
      !["ADMINISTRADOR", "DOCENTE", "ESTUDIANTE"].includes(
        String(rol)
      )
    ) {
      return null;
    }

    return {
      id,
      usuario,
      rol: rol as RolUsuario,
    };
  } catch {
    return null;
  }
}

// Eliminar la cookie al cerrar sesión
export async function cerrarSesion() {
  const almacenCookies = await cookies();

  almacenCookies.delete(NOMBRE_COOKIE);
}

// Obtener la ruta correspondiente a cada rol
export function obtenerRutaPorRol(rol: RolUsuario): string {
  switch (rol) {
    case "ADMINISTRADOR":
      return "/administrador";

    case "DOCENTE":
      return "/docente";

    case "ESTUDIANTE":
      return "/estudiante";
  }
}
