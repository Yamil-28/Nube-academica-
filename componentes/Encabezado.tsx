
import Image from "next/image";
import Link from "next/link";
import estilos from "./Encabezado.module.css";

export default function Encabezado() {
  return (
    <header className={estilos.encabezado}>
      <div className={estilos.contenedor}>
        <Link href="/" className={estilos.marca}>
          <Image
            src="/imagenes/emi.jpg"
            alt="Escuela Militar de Ingeniería"
            width={58}
            height={58}
            className={estilos.logotipo}
          />

          <div className={estilos.identidad}>
            <h1 className={estilos.titulo}>
              SIS<span>Cloud</span>
            </h1>

            <p className={estilos.descripcion}>
              Gestión de Proyectos Académicos
            </p>
          </div>
        </Link>

        <nav
          className={estilos.navegacion}
          aria-label="Navegación principal"
        >
          <Link href="/" className={estilos.enlaceInicio}>
            Inicio
          </Link>

          <Link
            href="/iniciar-sesion"
            className={estilos.botonSesion}
          >
            Iniciar sesión
          </Link>
        </nav>
      </div>
    </header>
  );
}
