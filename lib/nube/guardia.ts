// Protege una página de servidor: sin sesión → login; con otro rol → su propio panel.
import { redirect } from "next/navigation";
import { obtenerRutaPorRol, obtenerSesion, type RolUsuario } from "@/lib/sesion";

export async function exigirRol(rol: RolUsuario) {
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/iniciar-sesion");
  if (sesion.rol !== rol) redirect(obtenerRutaPorRol(sesion.rol));
}
