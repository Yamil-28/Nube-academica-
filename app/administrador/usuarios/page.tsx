import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";

import Link from "next/link";
import { Suspense } from "react";
import {
  UserPlus,
  Users,
} from "lucide-react";

import { protegerRuta } from "@/lib/protegerRuta";
import { prisma } from "@/lib/prisma";
import TablaUsuarios from "./TablaUsuarios";

import estilos from "./page.module.css";

async function ContenidoUsuarios() {
  // Verificar permisos en el servidor
  await protegerRuta("ADMINISTRADOR");

  // Consultar usuarios en Neon
  const usuarios = await prisma.usuario.findMany({
    orderBy: { creadoEn: "desc" },
    select: {
      id: true,
      usuario: true,
      nombre: true,
      rol: true,
      activo: true,
      creadoEn: true,
    },
  });

  const total = usuarios.length;
  const activos = usuarios.filter((u) => u.activo).length;
  const inactivos = total - activos;

  // Convertir fechas antes de enviar datos al cliente
  const datosUsuarios = usuarios.map((cuenta) => ({
    ...cuenta,
    creadoEn: cuenta.creadoEn.toLocaleDateString("es-BO", {
      timeZone: "America/La_Paz",
    }),
  }));

  return (
    <div className={estilos.pagina}>
      <div className={estilos.encabezado}>
        <div>
          <span className={estilos.etiqueta}>
            ADMINISTRACIÓN
          </span>

          <h1>Gestión de Usuarios</h1>

          <p>
            Administra las cuentas registradas en SISCloud.
          </p>
        </div>

        <Link
          href="/administrador/usuarios/nuevo"
          className={estilos.botonNuevo}
        >
          <UserPlus size={18} />
          Registrar usuario
        </Link>
      </div>

      <section className={estilos.estadisticas}>
        <div className={estilos.tarjeta}>
          <Users size={23} />
          <span>Total de usuarios</span>
          <strong>{total}</strong>
        </div>

        <div className={estilos.tarjeta}>
          <Users size={23} />
          <span>Usuarios activos</span>
          <strong>{activos}</strong>
        </div>

        <div className={estilos.tarjeta}>
          <Users size={23} />
          <span>Usuarios inactivos</span>
          <strong>{inactivos}</strong>
        </div>
      </section>

      <TablaUsuarios usuarios={datosUsuarios} />
    </div>
  );
}

export default function PaginaUsuarios() {
  return (
    <Suspense fallback={<CargandoDashboard />}>
      <ContenidoUsuarios />
    </Suspense>
  );
}
