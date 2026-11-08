
import { Suspense } from "react";
import Link from "next/link";

import {
  BookOpen,
  FolderKanban,
  FolderPlus,
  Users,
  CloudUpload,
  ArrowRight,
  GraduationCap,
  FileText,
} from "lucide-react";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import { protegerRuta } from "@/lib/protegerRuta";

import estilos from "./page.module.css";

const accesos = [
  {
    titulo: "Mis materias",
    descripcion: "Consultar mis materias académicas",
    ruta: "/estudiante/materias",
    icono: BookOpen,
  },
  {
    titulo: "Mis proyectos",
    descripcion: "Consultar y gestionar mis proyectos",
    ruta: "/estudiante/proyectos",
    icono: FolderKanban,
  },
  {
    titulo: "Crear proyecto",
    descripcion: "Registrar un nuevo proyecto académico",
    ruta: "/estudiante/proyectos/crear",
    icono: FolderPlus,
  },
  {
    titulo: "Equipos de trabajo",
    descripcion: "Organizar y consultar mis equipos",
    ruta: "/estudiante/equipos",
    icono: Users,
  },
  {
    titulo: "Archivos en la nube",
    descripcion: "Gestionar documentos y versiones",
    ruta: "/estudiante/archivos",
    icono: CloudUpload,
  },
  {
    titulo: "Informes",
    descripcion: "Consultar mis informes académicos",
    ruta: "/estudiante/reportes",
    icono: FileText,
  },
];

async function ContenidoEstudiante() {
  const usuario = await protegerRuta("ESTUDIANTE");

  return (
    <EstructuraDashboard
      usuario={usuario.usuario}
      rol={usuario.rol}
    >
      <div className={estilos.dashboardRol}>

        {/* ENCABEZADO DEL ESTUDIANTE */}
        <section className={estilos.dashboardRolBienvenida}>
          <div>
            <span className={estilos.dashboardRolEtiqueta}>
              ESPACIO ACADÉMICO
            </span>

            <h1>Dashboard del Estudiante</h1>

            <p>
              Bienvenido, {usuario.nombre}. Gestiona tus
              proyectos, equipos y archivos académicos.
            </p>
          </div>

          <div className={estilos.dashboardRolInsignia}>
            <GraduationCap size={20} />
            <span>Estudiante</span>
          </div>
        </section>

        {/* ACCESOS RÁPIDOS */}
        <section className={estilos.dashboardRolSeccion}>
          <div className={estilos.dashboardRolTitulo}>
            <h2>Accesos rápidos</h2>
            <p>
              Accede a las herramientas de tu espacio
              académico.
            </p>
          </div>

          <div className={estilos.dashboardRolCuadricula}>
            {accesos.map((acceso) => {
              const Icono = acceso.icono;

              return (
                <Link
                  key={acceso.titulo}
                  href={acceso.ruta}
                  className={estilos.dashboardRolTarjeta}
                >
                  <div className={estilos.dashboardRolTarjetaSuperior}>
                    <div className={estilos.dashboardRolIcono}>
                      <Icono size={23} />
                    </div>

                    <ArrowRight size={18} />
                  </div>

                  <h3>{acceso.titulo}</h3>
                  <p>{acceso.descripcion}</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* PANELES INFERIORES */}
        <div className={estilos.dashboardRolColumnas}>

          {/* MIS PROYECTOS */}
          <section className={estilos.dashboardRolPanel}>
            <div className={estilos.dashboardRolPanelTitulo}>
              <FolderKanban size={21} />
              <h2>Mis proyectos académicos</h2>
            </div>

            <div className={estilos.dashboardRolVacio}>
              <FolderKanban size={35} />
              <h3>Proyectos pendientes de implementar</h3>
              <p>
                Aquí aparecerán tus proyectos registrados,
                su estado y sus avances.
              </p>
            </div>
          </section>

          {/* MIS ARCHIVOS */}
          <section className={estilos.dashboardRolPanel}>
            <div className={estilos.dashboardRolPanelTitulo}>
              <CloudUpload size={21} />
              <h2>Mis archivos</h2>
            </div>

            <div className={estilos.dashboardRolVacio}>
              <CloudUpload size={35} />
              <h3>Almacenamiento académico</h3>
              <p>
                Aquí podrás subir, organizar y consultar
                los archivos de tus proyectos.
              </p>
            </div>
          </section>
        </div>
      </div>
    </EstructuraDashboard>
  );
}

export default function PaginaEstudiante() {
  return (
    <Suspense fallback={<p>Cargando panel estudiante...</p>}>
      <ContenidoEstudiante />
    </Suspense>
  );
}
