
import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  obtenerSesion,
  obtenerRutaPorRol,
  type RolUsuario,
} from "@/lib/sesion";

export const protegerRuta = cache(async (rolPermitido: RolUsuario) => {
  // 1. Comprobar si existe una sesión válida
  const sesion = await obtenerSesion();

  if (!sesion) {
    redirect("/iniciar-sesion");
  }

  // 2. Consultar los datos actuales del usuario en Neon
  const usuario = await prisma.usuario.findUnique({
    where: { id: sesion.id },
    select: {
      id: true,
      usuario: true,
      nombre: true,
      rol: true,
      activo: true,
      versionSesion: true,
    },
  });

  // 3. Verificar que la cuenta exista y esté activa
  if (
    !usuario ||
    !usuario.activo ||
    usuario.usuario !== sesion.usuario
  ) {
    redirect("/iniciar-sesion");
  }

  // 4. Comprobar que la sesión no haya sido invalidada
  if (usuario.versionSesion !== sesion.versionSesion) {
    redirect("/iniciar-sesion");
  }

  // 5. Verificar el rol actual del usuario
  if (usuario.rol !== rolPermitido) {
    redirect(obtenerRutaPorRol(usuario.rol));
  }

  return usuario;
});
