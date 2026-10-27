
import { Suspense } from "react";
import Link from "next/link";
import {
  BookOpen,
  ClipboardCheck,
  FolderKanban,
  Users,
  FileText,
  ArrowRight,
  GraduationCap,
} from "lucide-react";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import { protegerRuta } from "@/lib/protegerRuta";

const accesos = [
  {
    titulo: "Mis materias",
    descripcion: "Consultar las materias asignadas",
    ruta: "/docente/materias",
    icono: BookOpen,
  },
  {
    titulo: "Proyectos académicos",
    descripcion: "Revisar los proyectos estudiantiles",
    ruta: "/docente/proyectos",
    icono: FolderKanban,
  },
  {
    titulo: "Seguimiento académico",
    descripcion: "Revisar avances y observaciones",
    ruta: "/docente/seguimiento",
    icono: ClipboardCheck,
  },
  {
    titulo: "Informes y reportes",
    descripcion: "Consultar información académica",
    ruta: "/docente/reportes",
    icono: FileText,
  },
];

async function ContenidoDocente() {
  const usuario = await protegerRuta("DOCENTE");

  return (
    <EstructuraDashboard
      usuario={usuario.usuario}
      rol={usuario.rol}
    >
      <div className="dashboard-rol">
        <section className="dashboard-rol-bienvenida">
          <div>
            <span className="dashboard-rol-etiqueta">
              PANEL ACADÉMICO
            </span>

            <h1>Dashboard del Docente</h1>

            <p>
              Bienvenido, {usuario.nombre}. Desde aquí
              puedes gestionar el seguimiento académico.
            </p>
          </div>

          <div className="dashboard-rol-insignia">
            <GraduationCap size={20} />
            <span>Docente</span>
          </div>
        </section>

        <section className="dashboard-rol-seccion">
          <div className="dashboard-rol-titulo">
            <h2>Accesos rápidos</h2>
            <p>
              Selecciona el módulo que deseas consultar.
            </p>
          </div>

          <div className="dashboard-rol-cuadricula">
            {accesos.map((acceso) => {
              const Icono = acceso.icono;

              return (
                <Link
                  href={acceso.ruta}
                  key={acceso.titulo}
                  className="dashboard-rol-tarjeta"
                >
                  <div className="dashboard-rol-tarjeta-superior">
                    <div className="dashboard-rol-icono">
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

        <div className="dashboard-rol-columnas">
          <section className="dashboard-rol-panel">
            <div className="dashboard-rol-panel-titulo">
              <BookOpen size={21} />
              <h2>Materias asignadas</h2>
            </div>

            <div className="dashboard-rol-vacio">
              <BookOpen size={35} />
              <h3>Sin información disponible</h3>
              <p>
                Las materias asignadas aparecerán aquí
                cuando se implemente la gestión académica.
              </p>
            </div>
          </section>

          <section className="dashboard-rol-panel">
            <div className="dashboard-rol-panel-titulo">
              <Users size={21} />
              <h2>Proyectos de estudiantes</h2>
            </div>

            <div className="dashboard-rol-vacio">
              <FolderKanban size={35} />
              <h3>Próximamente</h3>
              <p>
                Aquí podrás consultar proyectos, revisar
                avances y registrar observaciones.
              </p>
            </div>
          </section>
        </div>
      </div>
    </EstructuraDashboard>
  );
}

export default function PaginaDocente() {
  return (
    <Suspense fallback={<p>Cargando panel docente...</p>}>
      <ContenidoDocente />
    </Suspense>
  );
}
