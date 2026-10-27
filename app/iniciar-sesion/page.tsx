
import Image from "next/image";
import Link from "next/link";
import FormularioAcceso from "@/componentes/FormularioAcceso";

export default function PaginaIniciarSesion() {
  return (
    <section className="pagina-acceso">
      <div className="contenedor acceso-contenido">
        <div className="acceso-informacion">
          <Link href="/" className="acceso-volver">
            ← Volver al inicio
          </Link>

          <div className="acceso-identidad">
            <Image
              src="/imagenes/emi.jpg"
              alt="Escuela Militar de Ingeniería"
              width={85}
              height={85}
              className="acceso-logotipo"
            />

            <span>ESCUELA MILITAR DE INGENIERÍA</span>
          </div>

          <h1>
            Bienvenido a <span>SISCloud</span>
          </h1>

          <p className="acceso-descripcion">
            Gestiona tus proyectos académicos, organiza
            documentos y colabora con tu equipo desde
            un solo lugar.
          </p>

          <div className="acceso-beneficios">
            <p>✓ Organización de proyectos académicos</p>
            <p>✓ Trabajo colaborativo</p>
            <p>✓ Seguimiento y revisión docente</p>
          </div>

          <div className="acceso-carrera">
            <Image
              src="/imagenes/sistemas.jpg"
              alt="Ingeniería de Sistemas"
              width={55}
              height={55}
              className="acceso-logotipo"
            />

            <div>
              <strong>Ingeniería de Sistemas</strong>
              <span>Unidad Académica La Paz</span>
            </div>
          </div>
        </div>

        <div className="acceso-tarjeta">
          <FormularioAcceso />
        </div>
      </div>
    </section>
  );
}
