
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
          className="dashboard-fondo-lateral"
          onClick={cerrar}
          aria-label="Cerrar menú lateral"
        />
      )}

      <aside
        className={`dashboard-lateral ${abierto ? "dashboard-lateral-abierto" : ""}`}
      >
        <div className="dashboard-lateral-cabecera">
          <span>MENÚ PRINCIPAL</span>

          <button
            type="button"
            className="dashboard-cerrar-lateral"
            onClick={cerrar}
            aria-label="Cerrar barra lateral"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="dashboard-lista-menus" aria-label="Menú principal">
          {menus.map((menu) => {
            const Icono = obtenerIcono(menu.icono);
            const expandido = estaAbierto(menu);

            if (menu.ruta) {
              return (
                <Link
                  key={menu.nombre}
                  href={menu.ruta}
                  onClick={cerrar}
                  className={`dashboard-enlace ${
                    rutaActual === menu.ruta
                      ? "dashboard-enlace-activo"
                      : ""
                  }`}
                >
                  <Icono size={19} />
                  <span>{menu.nombre}</span>
                </Link>
              );
            }

            return (
              <div key={menu.nombre} className="dashboard-grupo-menu">
                <button
                  type="button"
                  className="dashboard-enlace dashboard-boton-menu"
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
                  <div className="dashboard-submenus">
                    {menu.submenus?.map((submenu) => (
                      <Link
                        key={submenu.ruta}
                        href={submenu.ruta}
                        onClick={cerrar}
                        className={`dashboard-submenu ${
                          rutaActual === submenu.ruta
                            ? "dashboard-submenu-activo"
                            : ""
                        }`}
                      >
                        <span className="dashboard-punto-submenu" />
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
