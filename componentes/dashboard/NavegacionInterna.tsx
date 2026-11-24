
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { obtenerCatalogo } from "@/lib/informes/catalogo";
import { obtenerMenus } from "@/lib/menusDashboard";
import type { RolUsuario } from "@/lib/sesion";
import {
  ArrowLeft,
  House,
  ChevronRight,
} from "lucide-react";

import estilos from "./NavegacionInterna.module.css";

const ETIQUETAS: Record<string, string> = {
  perfil: "Mi perfil",
  configuracion: "Configuración",
  editar: "Editar usuario",
  historial: "Historial de reportes",
  usuarios: "Reporte de usuarios",
  compartidos: "Espacios compartidos",
};

const DESTINOS_VOLVER: Record<string, string> = {
  "/administrador/permisos": "/administrador/usuarios",
  "/administrador/usuarios/nuevo": "/administrador/usuarios",
  "/estudiante/proyectos/nuevo": "/estudiante/proyectos",
  "/estudiante/equipos/nuevo": "/estudiante/equipos",
};

export default function NavegacionInterna({ rol }: { rol: RolUsuario }) {
  const ruta = usePathname();
  const segmentos = ruta.split("/").filter(Boolean);
  const rutaInicio = "/" + rol.toLowerCase();
  if (segmentos.length < 2) return null;

  const coincidencia = obtenerMenus(rol)
    .flatMap((menu) => (menu.submenus ?? []).map((submenu) => ({ menu, submenu })))
    .filter(({ submenu }) => ruta === submenu.ruta || ruta.startsWith(submenu.ruta + "/"))
    .sort((a, b) => b.submenu.ruta.length - a.submenu.ruta.length)[0];
  const exacta = coincidencia?.submenu.ruta === ruta;
  const segmento = segmentos[segmentos.length - 1];
  const titulo = exacta
    ? coincidencia.submenu.nombre
    : (segmentos[1] === "reportes" && obtenerCatalogo(rol).find((reporte) => reporte.id === segmento)?.titulo)
      || ETIQUETAS[segmento]
      || segmento.replaceAll("-", " ").replace(/^./, (letra) => letra.toUpperCase());
  const nombreSeccion = coincidencia?.menu.nombre
    ?? (segmento === "compartidos" ? "Nube académica" : undefined);
  const rutaPadre = exacta ? undefined : coincidencia?.submenu.ruta;
  const rutaVolver = DESTINOS_VOLVER[ruta] ?? rutaPadre ?? rutaInicio;

  return (
    <nav className={estilos.dashboardNavegacionInterna} aria-label="Navegación de la página">
      <div className={estilos.dashboardMigas}>
        <Link href={rutaInicio}>
          <House size={16} />
          Inicio
        </Link>

        {nombreSeccion && (
          <>
            <ChevronRight size={15} />
            <span>{nombreSeccion}</span>
          </>
        )}

        <ChevronRight size={15} />
        <strong aria-current="page">{titulo}</strong>
      </div>

      <div className={estilos.dashboardAccionesNavegacion}>
        <Link
          href={rutaVolver}
          className={estilos.dashboardBotonVolver}
        >
          <ArrowLeft size={17} />
          Volver
        </Link>

        <Link
          href={rutaInicio}
          className={estilos.dashboardBotonInicio}
        >
          <House size={17} />
          Ir al inicio
        </Link>
      </div>
    </nav>
  );
}
