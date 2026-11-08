
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Cloud,
  UsersRound,
  FolderKanban,
  ShieldCheck,
  ChartColumn,
  ClipboardCheck,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";

import {
  obtenerMenus,
  type MenuDashboard,
} from "@/lib/menusDashboard";

import type { RolUsuario } from "@/lib/sesion";
import estilos from "./BarraLateral.module.css";

type Propiedades = {
  rol: RolUsuario;
  abierto: boolean;
  cerrar: () => void;
};

function obtenerIcono(nombre: string) {
  const iconos = {
    inicio: LayoutDashboard,
    usuarios: Users,
    materias: BookOpen,
    nube: Cloud,
    equipos: UsersRound,
    proyectos: FolderKanban,
    seguridad: ShieldCheck,
    reportes: ChartColumn,
    seguimiento: ClipboardCheck,
  };

  return iconos[nombre as keyof typeof iconos] ?? LayoutDashboard;
}

export default function BarraLateral({
  rol,
  abierto,
  cerrar,
}: Propiedades) {
  const rutaActual = usePathname();
  const menus = obtenerMenus(rol);

  const [menusAbiertos, establecerMenusAbiertos] =
    useState<string[]>([]);

  function alternarMenu(nombre: string) {
    establecerMenusAbiertos((anteriores) =>
      anteriores.includes(nombre)
        ? anteriores.filter((item) => item !== nombre)
        : [...anteriores, nombre]
    );
  }

  function estaAbierto(menu: MenuDashboard) {
    const coincideRuta = menu.submenus?.some(
      (submenu) =>
        rutaActual === submenu.ruta ||
        rutaActual.startsWith(submenu.ruta + "/")
    );

    return menusAbiertos.includes(menu.nombre) || Boolean(coincideRuta);
  }

  return (
    <>
      {abierto && (
        <button
          type="button"
          className={estilos.dashboardFondoLateral}
          onClick={cerrar}
          aria-label="Cerrar menú lateral"
        />
      )}

      <aside
        className={`${estilos.dashboardLateral} ${
          abierto ? estilos.dashboardLateralAbierto : ""
        }`}
      >
        <div className={estilos.dashboardLateralCabecera}>
          <span>MENÚ PRINCIPAL</span>

          <button
            type="button"
            className={estilos.dashboardCerrarLateral}
            onClick={cerrar}
            aria-label="Cerrar barra lateral"
          >
            <X size={20} />
          </button>
        </div>

        <nav
          className={estilos.dashboardListaMenus}
          aria-label="Menú principal"
        >
          {menus.map((menu) => {
            const Icono = obtenerIcono(menu.icono);
            const expandido = estaAbierto(menu);

            if (menu.ruta) {
              return (
                <Link
                  key={menu.nombre}
                  href={menu.ruta}
                  onClick={cerrar}
                  className={`${estilos.dashboardEnlace} ${
                    rutaActual === menu.ruta
                      ? estilos.dashboardEnlaceActivo
                      : ""
                  }`}
                >
                  <Icono size={19} />
                  <span>{menu.nombre}</span>
                </Link>
              );
            }

            return (
              <div
                key={menu.nombre}
                className={estilos.dashboardGrupoMenu}
              >
                <button
                  type="button"
                  className={`${estilos.dashboardEnlace} ${estilos.dashboardBotonMenu}`}
                  onClick={() => alternarMenu(menu.nombre)}
                  aria-expanded={expandido}
                >
                  <Icono size={19} />
                  <span>{menu.nombre}</span>

                  {expandido ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>

                {expandido && (
                  <div className={estilos.dashboardSubmenus}>
                    {menu.submenus?.map((submenu) => (
                      <Link
                        key={submenu.ruta}
                        href={submenu.ruta}
                        onClick={cerrar}
                        className={`${estilos.dashboardSubmenu} ${
                          rutaActual === submenu.ruta
                            ? estilos.dashboardSubmenuActivo
                            : ""
                        }`}
                      >
                        <span
                          className={estilos.dashboardPuntoSubmenu}
                        />
                        {submenu.nombre}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
