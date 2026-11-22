
import "server-only";

import { prisma } from "@/lib/prisma";
import { obtenerSesion, type RolUsuario } from "@/lib/sesion";

/* ==========================================
   AUTORIZACIÓN PARA RUTAS DE LA API
   Igual que protegerRuta, pero devuelve null en
   lugar de redirigir (las rutas de la API deben
   responder con un código de estado, no con HTML).
========================================== */

export async function obtenerUsuarioAutorizado(
  rolesPermitidos: RolUsuario[]
) {
  const sesion = await obtenerSesion();

  if (!sesion) {
    return null;
  }

  // Rol y estado reales, consultados en Neon
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

  if (
    !usuario ||
    !usuario.activo ||
    usuario.usuario !== sesion.usuario ||
    !rolesPermitidos.includes(usuario.rol)
  ) {
    return null;
  }

  return usuario;
}
