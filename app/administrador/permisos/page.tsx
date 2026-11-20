
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowLeft,
  ShieldCheck,
  GraduationCap,
  UserRound,
  Check,
  X,
  Users,
  LockKeyhole,
  Info,
} from "lucide-react";

import { protegerRuta } from "@/lib/protegerRuta";
import { prisma } from "@/lib/prisma";

import estilos from "./page.module.css";

const permisos = [
  {
    modulo: "Gestión de usuarios",
    acciones: [
      {
        nombre: "Consultar todos los usuarios",
        roles: [true, false, false],
      },
      {
        nombre: "Registrar usuarios",
        roles: [true, false, false],
      },
      {
        nombre: "Editar usuarios y asignar roles",
        roles: [true, false, false],
      },
      {
        nombre: "Activar o desactivar cuentas",
        roles: [true, false, false],
      },
    ],
  },
  {
    modulo: "Gestión académica",
    acciones: [
      {
        nombre: "Administrar materias",
        roles: [true, false, false],
      },
      {
        nombre: "Consultar materias asignadas",
        roles: [true, true, true],
      },
    ],
  },
  {
    modulo: "Proyectos académicos",
    acciones: [
      {
        nombre: "Crear proyectos académicos",
        roles: [true, true, true],
      },
      {
        nombre: "Consultar proyectos autorizados",
        roles: [true, true, true],
      },
      {
        nombre: "Revisar avances académicos",
        roles: [true, true, false],
      },
    ],
  },
  {
    modulo: "Nube académica",
    acciones: [
      {
        nombre: "Gestionar archivos autorizados",
        roles: [true, true, true],
      },
      {
        nombre: "Consultar repositorio académico",
        roles: [true, true, true],
      },
    ],
  },
  {
    modulo: "Equipos de trabajo",
    acciones: [
      {
        nombre: "Administrar equipos",
        roles: [true, false, false],
      },
      {
        nombre: "Supervisar equipos asignados",
        roles: [true, true, false],
      },
      {
        nombre: "Participar en equipos",
        roles: [true, false, true],
      },
    ],
  },
  {
    modulo: "Seguridad y control",
    acciones: [
      {
        nombre: "Consultar auditoría",
        roles: [true, false, false],
      },
      {
        nombre: "Administrar controles de acceso",
        roles: [true, false, false],
      },
    ],
  },
  {
    modulo: "Informes y reportes",
    acciones: [
      {
        nombre: "Consultar estadísticas generales",
        roles: [true, false, false],
      },
      {
        nombre: "Consultar reportes autorizados",
        roles: [true, true, true],
      },
    ],
  },
];

async function ContenidoPermisos() {
  // Verificar permisos del Administrador
  await protegerRuta("ADMINISTRADOR");

  // Consultar usuarios activos en Neon
  const conteos = await prisma.usuario.groupBy({
    by: ["rol"],
    where: {
      activo: true,
    },
    _count: {
      _all: true,
    },
  });

  function cantidad(
    rol: "ADMINISTRADOR" | "DOCENTE" | "ESTUDIANTE"
  ) {
    return (
      conteos.find((item) => item.rol === rol)
        ?._count._all ?? 0
    );
  }

  const tarjetas = [
    {
      nombre: "Administrador",
      descripcion: "Administración general del sistema",
      cantidad: cantidad("ADMINISTRADOR"),
      icono: ShieldCheck,
    },
    {
      nombre: "Docente",
      descripcion: "Supervisión y seguimiento académico",
      cantidad: cantidad("DOCENTE"),
      icono: GraduationCap,
    },
    {
      nombre: "Estudiante",
      descripcion: "Participación en proyectos académicos",
      cantidad: cantidad("ESTUDIANTE"),
      icono: UserRound,
    },
  ];

  return (
    <div className={estilos.pagina}>
      <Link
        href="/administrador/usuarios"
        className={estilos.botonVolver}
      >
        <ArrowLeft size={18} />
        Volver a Gestión de Usuarios
      </Link>

      <div className={estilos.encabezado}>
        <div>
          <span className={estilos.etiqueta}>
            ADMINISTRACIÓN
          </span>

          <h1>Roles y permisos</h1>

          <p>
            Consulta los roles del sistema y la matriz
            de permisos propuesta para SISCloud.
          </p>
        </div>

        <LockKeyhole size={30} />
      </div>

      <section className={estilos.tarjetas}>
        {tarjetas.map((tarjeta) => {
          const Icono = tarjeta.icono;

          return (
            <div
              className={estilos.tarjeta}
              key={tarjeta.nombre}
            >
              <div className={estilos.tarjetaIcono}>
                <Icono size={24} />
              </div>

              <h2>{tarjeta.nombre}</h2>
              <p>{tarjeta.descripcion}</p>

              <div className={estilos.tarjetaCantidad}>
                <Users size={16} />
                <strong>{tarjeta.cantidad}</strong>
                <span>usuarios activos</span>
              </div>
            </div>
          );
        })}
      </section>

      <section className={estilos.panel}>
        <div className={estilos.panelEncabezado}>
          <div>
            <h2>Matriz de permisos</h2>
            <p>
              Permisos previstos según el rol del usuario
            </p>
          </div>

          <ShieldCheck size={24} />
        </div>

        <div className={estilos.tablaContenedor}>
          <table className={estilos.tabla}>
            <thead>
              <tr>
                <th>Operación</th>
                <th>Administrador</th>
                <th>Docente</th>
                <th>Estudiante</th>
              </tr>
            </thead>

            <tbody>
              {permisos.map((grupo) => (
                <FragmentoPermisos
                  key={grupo.modulo}
                  modulo={grupo.modulo}
                  acciones={grupo.acciones}
                />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className={estilos.aviso}>
        <Info size={20} />

        <p>
          Esta matriz es una propuesta de permisos por rol.
          Las operaciones de los demás módulos deberán
          implementar sus propias verificaciones de acceso
          en el servidor.
        </p>
      </div>

      <div className={estilos.acciones}>
        <Link
          href="/administrador/usuarios"
          className={estilos.botonUsuarios}
        >
          <Users size={18} />
          Gestionar usuarios y asignar roles
        </Link>
      </div>
    </div>
  );
}

type GrupoPermisos = {
  modulo: string;
  acciones: {
    nombre: string;
    roles: boolean[];
  }[];
};

function FragmentoPermisos({
  modulo,
  acciones,
}: GrupoPermisos) {
  return (
    <>
      <tr className={estilos.filaModulo}>
        <td colSpan={4}>{modulo}</td>
      </tr>

      {acciones.map((accion) => (
        <tr key={accion.nombre}>
          <td>{accion.nombre}</td>

          {accion.roles.map((permitido, indice) => (
            <td
              key={indice}
              className={estilos.celdaPermiso}
            >
              {permitido ? (
                <span
                  className={estilos.permitido}
                  title="Permitido"
                >
                  <Check size={18} />
                </span>
              ) : (
                <span
                  className={estilos.denegado}
                  title="No permitido"
                >
                  <X size={18} />
                </span>
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function PaginaPermisos() {
  return (
    <Suspense fallback={null}>
      <ContenidoPermisos />
    </Suspense>
  );
}
