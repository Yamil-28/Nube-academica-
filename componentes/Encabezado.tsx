
import Image from "next/image";
import Link from "next/link";

export default function Encabezado() {
  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="contenedor flex min-h-20 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/imagenes/emi.jpg"
            alt="Escuela Militar de Ingeniería"
            width={58}
            height={58}
            className="rounded-full object-cover"
          />

          <div>
            <h1 className="text-2xl font-bold text-[var(--color-primario)]">
              SIS<span className="text-[var(--color-secundario)]">Cloud</span>
            </h1>
            <p className="text-xs text-[var(--color-texto-secundario)]">
              Gestión de Proyectos Académicos
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm font-semibold text-[var(--color-primario)]"
          >
            Inicio
          </Link>

          <Link href="/iniciar-sesion" className="boton-primario text-sm">
            Iniciar sesión
          </Link>
        </nav>
      </div>
    </header>
  );
}
