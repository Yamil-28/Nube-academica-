
import Link from "next/link";

import {
  UserRound,
  ShieldCheck,
  AtSign,
  ArrowLeft,
  CalendarDays,
} from "lucide-react";

import type { RolUsuario } from "@/lib/sesion";

import FormularioEditarNombre from "./FormularioEditarNombre";
import FormularioCambioContrasena from "./FormularioCambioContrasena";

import estilos from "./PerfilUsuario.module.css";

type Propiedades = {
  nombre: string;
  usuario: string;
  rol: RolUsuario;
  creadoEn: string;
};

const nombresRoles: Record<RolUsuario, string> = {
  ADMINISTRADOR: "Administrador",
  DOCENTE: "Docente",
  ESTUDIANTE: "Estudiante",
};

export default function PerfilUsuario({
  nombre,
  usuario,
  rol,
  creadoEn,
}: Propiedades) {
  const rutaInicio =
    rol === "ADMINISTRADOR"
      ? "/administrador"
      : rol === "DOCENTE"
        ? "/docente"
        : "/estudiante";

  return (
    <div className={estilos.pagina}>
      {/* BOTÓN VOLVER */}
      <Link href={rutaInicio} className={estilos.volver}>
        <ArrowLeft size={18} />
        Volver al Dashboard
      </Link>

      {/* ENCABEZADO */}
      <div className={estilos.encabezado}>
        <span className={estilos.etiqueta}>MI CUENTA</span>

        <h1>Mi perfil</h1>

        <p>
          Consulta y administra tu información personal
          y la seguridad de tu cuenta en SISCloud.
        </p>
      </div>

      {/* INFORMACIÓN PERSONAL */}
      <section className={estilos.tarjeta}>
        <div className={estilos.perfilSuperior}>
          <div className={estilos.avatar}>
            <UserRound size={34} />
          </div>

          <div>
            <h2>{nombre}</h2>
            <p>@{usuario}</p>

            <span className={estilos.insignia}>
              {nombresRoles[rol]}
            </span>
          </div>
        </div>

        <div className={estilos.informacion}>
          <div className={estilos.dato}>
            <UserRound size={19} />

            <div>
              <span>Nombre completo</span>
              <strong>{nombre}</strong>
            </div>
          </div>

          <div className={estilos.dato}>
            <AtSign size={19} />

            <div>
              <span>Nombre de usuario</span>
              <strong>{usuario}</strong>
            </div>
          </div>

          <div className={estilos.dato}>
            <ShieldCheck size={19} />

            <div>
              <span>Rol asignado</span>
              <strong>{nombresRoles[rol]}</strong>
            </div>
          </div>

          <div className={estilos.dato}>
            <CalendarDays size={19} />

            <div>
              <span>Fecha de registro</span>
              <strong>{creadoEn}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* EDITAR INFORMACIÓN PERSONAL */}
      <FormularioEditarNombre nombreActual={nombre} />

      {/* CAMBIAR CONTRASEÑA */}
      <FormularioCambioContrasena />
    </div>
  );
}
