
import Link from "next/link";
import { Suspense } from "react";
import {
  ShieldCheck,
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  LockKeyhole,
  ClipboardList,
  ArrowRight,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { protegerRuta } from "@/lib/protegerRuta";

import estilos from "./page.module.css";

async function ContenidoControlAcceso() {
  // Verificar permisos del Administrador
  await protegerRuta("ADMINISTRADOR");

  // Obtener información de PostgreSQL (Neon)
  const [
    totalUsuarios,
    usuariosActivos,
    usuariosInactivos,
    intentosFallidos,
    accesosDenegados,
    eventos,
    roles,
  ] = await Promise.all([
    prisma.usuario.count(),

    prisma.usuario.count({
      where: { activo: true },
    }),

    prisma.usuario.count({
      where: { activo: false },
    }),

    prisma.auditoria.count({
      where: {
        tipo: "INICIO_SESION_FALLIDO",
      },
    }),

    prisma.auditoria.count({
      where: {
        tipo: "ACCESO_DENEGADO",
      },
    }),

    prisma.auditoria.findMany({
      where: {
        tipo: {
          in: [
            "INICIO_SESION_FALLIDO",
            "ACCESO_DENEGADO",
          ],
        },
      },
      orderBy: {
        fecha: "desc",
      },
      take: 10,
    }),

    prisma.usuario.groupBy({
      by: ["rol"],
      _count: {
        _all: true,
      },
    }),
  ]);

  // Obtener cantidad de usuarios por rol
  const cantidadRol = (rol: string) =>
    roles.find((item) => item.rol === rol)
      ?._count._all ?? 0;

  // Tarjetas de estadísticas
  const tarjetas = [
    {
      titulo: "Total de usuarios",
      valor: totalUsuarios,
      icono: Users,
    },
    {
      titulo: "Cuentas activas",
      valor: usuariosActivos,
      icono: UserCheck,
    },
    {
      titulo: "Cuentas inactivas",
      valor: usuariosInactivos,
      icono: UserX,
    },
    {
      titulo: "Intentos fallidos",
      valor: intentosFallidos,
      icono: AlertTriangle,
    },
    {
      titulo: "Accesos denegados",
      valor: accesosDenegados,
      icono: LockKeyhole,
    },
  ];

  return (
    <div className={estilos.pagina}>
      <header className={estilos.encabezado}>
        <div>
          <span className={estilos.etiqueta}>
            SEGURIDAD Y CONTROL
          </span>

          <h1>Control de acceso</h1>

          <p>
            Supervisa las cuentas, los roles y los
            eventos de seguridad de SISCloud.
          </p>
        </div>

        <ShieldCheck size={32} />
      </header>

      {/* Estadísticas generales */}
      <section className={estilos.tarjetas}>
        {tarjetas.map((tarjeta) => {
          const Icono = tarjeta.icono;

          return (
            <article
              key={tarjeta.titulo}
              className={estilos.tarjeta}
            >
              <Icono size={24} />

              <h2>{tarjeta.valor}</h2>

              <p>{tarjeta.titulo}</p>
            </article>
          );
        })}
      </section>

      {/* Distribución por roles */}
      <section className={estilos.panel}>
        <h2>Distribución de usuarios por rol</h2>

        <div className={estilos.roles}>
          <div>
            <strong>
              {cantidadRol("ADMINISTRADOR")}
            </strong>
            <span>Administradores</span>
          </div>

          <div>
            <strong>
              {cantidadRol("DOCENTE")}
            </strong>
            <span>Docentes</span>
          </div>

          <div>
            <strong>
              {cantidadRol("ESTUDIANTE")}
            </strong>
            <span>Estudiantes</span>
          </div>
        </div>
      </section>

      {/* Eventos de seguridad */}
      <section className={estilos.panel}>
        <div className={estilos.panelEncabezado}>
          <div>
            <h2>Últimos eventos de seguridad</h2>
            <p>
              Intentos fallidos y accesos denegados
            </p>
          </div>

          <AlertTriangle size={24} />
        </div>

        {eventos.length === 0 ? (
          <p className={estilos.vacio}>
            No existen eventos de seguridad registrados.
          </p>
        ) : (
          <div className={estilos.tablaContenedor}>
            <table className={estilos.tabla}>
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Usuario</th>
                  <th>Descripción</th>
                  <th>Fecha</th>
                </tr>
              </thead>

              <tbody>
                {eventos.map((evento) => (
                  <tr key={evento.id}>
                    <td>
                      {evento.tipo.replaceAll("_", " ")}
                    </td>

                    <td>
                      {evento.usuarioNombre ??
                        "No identificado"}
                    </td>

                    <td>
                      {evento.descripcion}
                    </td>

                    <td>
                      {new Intl.DateTimeFormat(
                        "es-BO",
                        {
                          timeZone: "America/La_Paz",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        }
                      ).format(evento.fecha)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Enlaces de administración */}
      <section className={estilos.panel}>
        <h2>Administración de seguridad</h2>

        <div className={estilos.enlaces}>
          <Link href="/administrador/usuarios">
            <Users size={20} />
            Gestión de usuarios
            <ArrowRight size={18} />
          </Link>

          <Link href="/administrador/permisos">
            <ShieldCheck size={20} />
            Roles y permisos
            <ArrowRight size={18} />
          </Link>

          <Link href="/administrador/auditoria">
            <ClipboardList size={20} />
            Historial de auditoría
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}

export default function PaginaControlAcceso() {
  return (
    <Suspense fallback={null}>
      <ContenidoControlAcceso />
    </Suspense>
  );
}
