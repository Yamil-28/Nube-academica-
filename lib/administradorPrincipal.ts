type Cuenta = { usuario: string; rol: string };

// Identidad de la cuenta inicial. Solo se puede configurar desde el servidor.
const USUARIO_PRINCIPAL = process.env.SISCLOUD_ADMIN_PRINCIPAL?.trim() || "admin";

export function esNombreReservado(usuario: string) {
  return usuario === USUARIO_PRINCIPAL;
}

export function esAdministradorPrincipal(cuenta: Cuenta) {
  return cuenta.rol === "ADMINISTRADOR" && esNombreReservado(cuenta.usuario);
}

export function puedeAdministrarCuenta(actor: Cuenta, cuenta: Cuenta) {
  if (actor.rol !== "ADMINISTRADOR") return false;
  if (esNombreReservado(cuenta.usuario)) return esAdministradorPrincipal(actor);
  return cuenta.rol !== "ADMINISTRADOR" || actor.usuario === cuenta.usuario || esAdministradorPrincipal(actor);
}
