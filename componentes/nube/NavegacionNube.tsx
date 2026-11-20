// Pestañas internas del módulo, según el rol (componente de servidor).
import Link from "next/link";
import { RUTA_BASE, type Rol } from "@/lib/nube/tipos";
import { Icono, type NombreIcono } from "./iconos";
import e from "./nube.module.css";

export type Seccion = "archivos" | "compartidos" | "almacenamiento";

export default function NavegacionNube({ rol, activa }: { rol: Rol; activa: Seccion }) {
  const base = RUTA_BASE[rol];
  const items: { id: Seccion; texto: string; href: string; icono: NombreIcono }[] =
    rol === "ADMINISTRADOR"
      ? [
          { id: "archivos", texto: "Archivos y carpetas", href: `${base}/nube`, icono: "carpeta" },
          { id: "almacenamiento", texto: "Almacenamiento", href: `${base}/almacenamiento`, icono: "disco" },
        ]
      : [
          { id: "archivos", texto: "Archivos del proyecto", href: `${base}/nube`, icono: "carpeta" },
          { id: "compartidos", texto: "Compartidos conmigo", href: `${base}/compartidos`, icono: "compartir" },
        ];
  return (
    <nav className={e.pestanas} aria-label="Secciones de la Nube Académica">
      {items.map((i) => (
        <Link key={i.id} href={i.href} className={i.id === activa ? e.pestanaActiva : e.pestana}
          aria-current={i.id === activa ? "page" : undefined}>
          <Icono nombre={i.icono} tamano={16} /> {i.texto}
        </Link>
      ))}
    </nav>
  );
}
