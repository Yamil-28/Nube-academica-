import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";

import { Suspense } from "react";
import Link from "next/link";

import {
  Users,
  BookOpen,
  FolderKanban,
  UsersRound,
  UserPlus,
  ChartColumn,
  Cloud,
  ShieldCheck,
  ArrowRight,
  Activity,
  Clock3,
} from "lucide-react";

import { protegerRuta } from "@/lib/protegerRuta";
import { prisma } from "@/lib/prisma";

import TarjetaEstadistica from "@/componentes/dashboard/TarjetaEstadistica";

import estilos from "./page.module.css";

async function ContenidoAdministrador() {
  // 1. Verificar que el usuario sea Administrador
  const usuario = await protegerRuta("ADMINISTRADOR");

  // 2. Obtener estadísticas reales desde Neon
  const [
    totalUsuarios,
    totalAdministradores,
    totalDocentes,
    totalEstudiantes,
    usuariosRecientes,
  ] = await Promise.all([
    prisma.usuario.count(),

    prisma.usuario.count({
      where: { rol: "ADMINISTRADOR" },
    }),

    prisma.usuario.count({
      where: { rol: "DOCENTE" },
    }),

    prisma.usuario.count({
      where: { rol: "ESTUDIANTE" },
    }),

    prisma.usuario.findMany({
      take: 5,
      orderBy: { creadoEn: "desc" },
      select: {
        id: true,
        usuario: true,
        nombre: true,
        rol: true,
        activo: true,
        creadoEn: true,
      },
    }),
  ]);

  const nombresRoles = {
    ADMINISTRADOR: "Administrador",
    DOCENTE: "Docente",
    ESTUDIANTE: "Estudiante",
  };

  // 3. Mostrar contenido dentro del layout compartido
  return (
    <div className={estilos.administradorDashboard}>

      {/* ENCABEZADO DE LA PÁGINA */}
      <div className={estilos.administradorBienvenida}>
        <div>
          <span className={estilos.administradorEtiqueta}>
            PANEL DE CONTROL
          </span>

          <h1>Dashboard del Administrador</h1>

          <p>
            Bienvenido, {usuario.nombre}. Supervisa la
            información general de SISCloud.
          </p>
        </div>

        <div className={estilos.administradorInsignia}>
          <ShieldCheck size={22} />
          <span>Administrador</span>
        </div>
      </div>

      {/* TARJETAS ESTADÍSTICAS */}
      <section className={estilos.administradorSeccion}>
        <div className={estilos.administradorTituloSeccion}>
          <div>
            <h2>Resumen general</h2>
            <p>Usuarios registrados en la plataforma</p>
          </div>
        </div>

        <div className={estilos.administradorCuadricula}>
          <TarjetaEstadistica
            titulo="Total de usuarios"
            valor={totalUsuarios}
            icono={Users}
            ruta="/administrador/usuarios"
            color="azul"
          />

          <TarjetaEstadistica
            titulo="Administradores"
            valor={totalAdministradores}
            icono={ShieldCheck}
            ruta="/administrador/usuarios"
            color="dorado"
          />

          <TarjetaEstadistica
            titulo="Docentes"
            valor={totalDocentes}
            icono={BookOpen}
            ruta="/administrador/docentes"
            color="verde"
          />

          <TarjetaEstadistica
            titulo="Estudiantes"
            valor={totalEstudiantes}
            icono={UsersRound}
            ruta="/administrador/usuarios"
            color="morado"
          />
        </div>
      </section>

      {/* ACCESOS RÁPIDOS */}
      <section className={estilos.administradorSeccion}>
        <div className={estilos.administradorTituloSeccion}>
          <div>
            <h2>Accesos rápidos</h2>
            <p>Funciones principales de administración</p>
          </div>
        </div>

        <div className={estilos.administradorAccesos}>
          <Link
            href="/administrador/usuarios/nuevo"
            className={estilos.administradorAcceso}
          >
            <span className={estilos.administradorAccesoIcono}>
              <UserPlus size={21} />
            </span>

            <span>
              <strong>Registrar usuario</strong>
              <small>Crear una cuenta nueva</small>
            </span>

            <ArrowRight size={17} />
          </Link>

          <Link
            href="/administrador/materias"
            className={estilos.administradorAcceso}
          >
            <span className={estilos.administradorAccesoIcono}>
              <BookOpen size={21} />
            </span>

            <span>
              <strong>Gestionar materias</strong>
              <small>Administración académica</small>
            </span>

            <ArrowRight size={17} />
          </Link>

          <Link
            href="/administrador/proyectos"
            className={estilos.administradorAcceso}
          >
            <span className={estilos.administradorAccesoIcono}>
              <FolderKanban size={21} />
            </span>

            <span>
              <strong>Ver proyectos</strong>
              <small>Consultar proyectos académicos</small>
            </span>

            <ArrowRight size={17} />
          </Link>

          <Link
            href="/administrador/reportes"
            className={estilos.administradorAcceso}
          >
            <span className={estilos.administradorAccesoIcono}>
              <ChartColumn size={21} />
            </span>

            <span>
              <strong>Generar reportes</strong>
              <small>Estadísticas e informes</small>
            </span>

            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* INFORMACIÓN INFERIOR */}
      <div className={estilos.administradorColumnas}>

        {/* USUARIOS RECIENTES */}
        <section className={estilos.administradorPanel}>
          <div className={estilos.administradorPanelCabecera}>
            <div>
              <h2>Usuarios recientes</h2>
              <p>Últimas cuentas registradas</p>
            </div>

            <Link href="/administrador/usuarios">
              Ver todos <ArrowRight size={15} />
            </Link>
          </div>

          <div className={estilos.administradorListaUsuarios}>
            {usuariosRecientes.length === 0 ? (
              <p>No hay usuarios registrados.</p>
            ) : (
              usuariosRecientes.map((cuenta) => (
                <div
                  key={cuenta.id}
                  className={estilos.administradorUsuario}
                >
                  <div className={estilos.administradorUsuarioAvatar}>
                    {cuenta.nombre.charAt(0).toUpperCase()}
                  </div>

                  <div className={estilos.administradorUsuarioDatos}>
                    <strong>{cuenta.nombre}</strong>

                    <span>
                      @{cuenta.usuario} ·{" "}
                      {nombresRoles[cuenta.rol]}
                    </span>
                  </div>

                  <span
                    className={`${estilos.administradorEstado} ${
                      cuenta.activo
                        ? estilos.activo
                        : estilos.inactivo
                    }`}
                  >
                    {cuenta.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ESTADO DE LA PLATAFORMA */}
        <section className={estilos.administradorPanel}>
          <div className={estilos.administradorPanelCabecera}>
            <div>
              <h2>Administración del sistema</h2>
              <p>Acceso a módulos principales</p>
            </div>

            <Activity size={20} />
          </div>

          <div className={estilos.administradorListaModulos}>
            <Link href="/administrador/almacenamiento">
              <Cloud size={20} />
              <span>Nube académica</span>
              <ArrowRight size={16} />
            </Link>

            <Link href="/administrador/equipos">
              <UsersRound size={20} />
              <span>Equipos de trabajo</span>
              <ArrowRight size={16} />
            </Link>

            <Link href="/administrador/auditoria">
              <Clock3 size={20} />
              <span>Auditoría del sistema</span>
              <ArrowRight size={16} />
            </Link>

            <Link href="/administrador/estadisticas">
              <ChartColumn size={20} />
              <span>Estadísticas generales</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function PaginaAdministrador() {
  return (
    <Suspense fallback={<CargandoDashboard />}>
      <ContenidoAdministrador />
    </Suspense>
  );
}
