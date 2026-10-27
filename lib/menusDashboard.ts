
import type { RolUsuario } from "@/lib/sesion";

export type SubmenuDashboard = {
  nombre: string;
  ruta: string;
};

export type MenuDashboard = {
  nombre: string;
  icono: string;
  ruta?: string;
  submenus?: SubmenuDashboard[];
};

export function obtenerMenus(rol: RolUsuario): MenuDashboard[] {
  const inicio: MenuDashboard = {
    nombre: "Inicio",
    icono: "inicio",
    ruta:
      rol === "ADMINISTRADOR"
        ? "/administrador"
        : rol === "DOCENTE"
          ? "/docente"
          : "/estudiante",
  };

  if (rol === "ADMINISTRADOR") {
    return [
      inicio,
      {
        nombre: "Gestión de usuarios",
        icono: "usuarios",
        submenus: [
          { nombre: "Lista de usuarios", ruta: "/administrador/usuarios" },
          { nombre: "Registrar usuario", ruta: "/administrador/usuarios/nuevo" },
          { nombre: "Roles y permisos", ruta: "/administrador/permisos" },
        ],
      },
      {
        nombre: "Gestión académica",
        icono: "materias",
        submenus: [
          { nombre: "Materias", ruta: "/administrador/materias" },
          { nombre: "Docentes", ruta: "/administrador/docentes" },
          { nombre: "Periodos académicos", ruta: "/administrador/periodos" },
        ],
      },
      {
        nombre: "Nube académica",
        icono: "nube",
        submenus: [
          { nombre: "Almacenamiento", ruta: "/administrador/almacenamiento" },
          { nombre: "Archivos y carpetas", ruta: "/administrador/archivos" },
        ],
      },
      {
        nombre: "Equipos de trabajo",
        icono: "equipos",
        submenus: [
          { nombre: "Todos los equipos", ruta: "/administrador/equipos" },
          { nombre: "Integrantes", ruta: "/administrador/integrantes" },
        ],
      },
      {
        nombre: "Proyectos académicos",
        icono: "proyectos",
        submenus: [
          { nombre: "Todos los proyectos", ruta: "/administrador/proyectos" },
          { nombre: "Proyectos finalizados", ruta: "/administrador/finalizados" },
          { nombre: "Repositorio académico", ruta: "/administrador/repositorio" },
        ],
      },
      {
        nombre: "Seguridad y control",
        icono: "seguridad",
        submenus: [
          { nombre: "Auditoría", ruta: "/administrador/auditoria" },
          { nombre: "Control de acceso", ruta: "/administrador/control-acceso" },
        ],
      },
      {
        nombre: "Informes y reportes",
        icono: "reportes",
        submenus: [
          { nombre: "Estadísticas generales", ruta: "/administrador/estadisticas" },
          { nombre: "Reportes", ruta: "/administrador/reportes" },
        ],
      },
    ];
  }

  if (rol === "DOCENTE") {
    return [
      inicio,
      {
        nombre: "Gestión académica",
        icono: "materias",
        submenus: [
          { nombre: "Mis materias", ruta: "/docente/materias" },
          { nombre: "Mis estudiantes", ruta: "/docente/estudiantes" },
        ],
      },
      {
        nombre: "Proyectos académicos",
        icono: "proyectos",
        submenus: [
          { nombre: "Proyectos asignados", ruta: "/docente/proyectos" },
          { nombre: "Revisión de avances", ruta: "/docente/revisiones" },
          { nombre: "Observaciones", ruta: "/docente/observaciones" },
        ],
      },
      {
        nombre: "Nube académica",
        icono: "nube",
        submenus: [
          { nombre: "Archivos de proyectos", ruta: "/docente/archivos" },
          { nombre: "Espacios compartidos", ruta: "/docente/compartidos" },
        ],
      },
      {
        nombre: "Equipos de trabajo",
        icono: "equipos",
        submenus: [
          { nombre: "Equipos de mis materias", ruta: "/docente/equipos" },
        ],
      },
      {
        nombre: "Seguimiento",
        icono: "seguimiento",
        submenus: [
          { nombre: "Actividades", ruta: "/docente/actividades" },
          { nombre: "Estado de proyectos", ruta: "/docente/seguimiento" },
        ],
      },
      {
        nombre: "Informes y reportes",
        icono: "reportes",
        submenus: [
          { nombre: "Reportes de avance", ruta: "/docente/reportes" },
          { nombre: "Repositorio académico", ruta: "/docente/repositorio" },
        ],
      },
    ];
  }

  return [
    inicio,
    {
      nombre: "Gestión académica",
      icono: "materias",
      submenus: [
        { nombre: "Mis materias", ruta: "/estudiante/materias" },
        { nombre: "Docentes", ruta: "/estudiante/docentes" },
      ],
    },
    {
      nombre: "Mis proyectos",
      icono: "proyectos",
      submenus: [
        { nombre: "Lista de proyectos", ruta: "/estudiante/proyectos" },
        { nombre: "Crear proyecto", ruta: "/estudiante/proyectos/nuevo" },
        { nombre: "Mis avances", ruta: "/estudiante/avances" },
      ],
    },
    {
      nombre: "Nube académica",
      icono: "nube",
      submenus: [
        { nombre: "Mis archivos", ruta: "/estudiante/archivos" },
        { nombre: "Carpetas", ruta: "/estudiante/carpetas" },
        { nombre: "Versiones", ruta: "/estudiante/versiones" },
      ],
    },
    {
      nombre: "Equipos de trabajo",
      icono: "equipos",
      submenus: [
        { nombre: "Mis equipos", ruta: "/estudiante/equipos" },
        { nombre: "Crear equipo", ruta: "/estudiante/equipos/nuevo" },
        { nombre: "Integrantes", ruta: "/estudiante/integrantes" },
      ],
    },
    {
      nombre: "Seguimiento",
      icono: "seguimiento",
      submenus: [
        { nombre: "Actividades", ruta: "/estudiante/actividades" },
        { nombre: "Observaciones docentes", ruta: "/estudiante/observaciones" },
      ],
    },
    {
      nombre: "Informes y reportes",
      icono: "reportes",
      submenus: [
        { nombre: "Mis reportes", ruta: "/estudiante/reportes" },
        { nombre: "Repositorio académico", ruta: "/estudiante/repositorio" },
      ],
    },
  ];
}
