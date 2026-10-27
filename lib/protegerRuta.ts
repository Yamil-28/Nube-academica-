
import "server-only";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  obtenerSesion,
  obtenerRutaPorRol,
  type RolUsuario,
} from "@/lib/sesion";

export async function protegerRuta(rolPermitido: RolUsuario) {
  // Comprobar si existe una sesión válida
  const sesion = await obtenerSesion();

  if (!sesion) {
    redirect("/iniciar-sesion");
  }

  // Consultar el estado y rol actuales en Neon
  const usuario = await prisma.usuario.findUnique({
    where: { id: sesion.id },
    select: {
      id: true,
      usuario: true,
      nombre: true,
      rol: true,
      activo: true,
    },
  });

  // Bloquear cuentas inexistentes o deshabilitadas
  if (
    !usuario ||
    !usuario.activo ||
    usuario.usuario !== sesion.usuario
  ) {
    redirect("/iniciar-sesion");
  }

  // Comprobar el rol real almacenado en la base de datos
  if (usuario.rol !== rolPermitido) {
    redirect(obtenerRutaPorRol(usuario.rol));
  }

  return usuario;
}
