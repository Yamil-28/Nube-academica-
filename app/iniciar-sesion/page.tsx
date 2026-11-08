
import Image from "next/image";
import Link from "next/link";
import FormularioAcceso from "@/componentes/FormularioAcceso";
import estilos from "./page.module.css";

export default function PaginaIniciarSesion() {
  return (
    <section className={estilos.paginaAcceso}>
      <div className={estilos.accesoContenido}>
        <div className={estilos.accesoInformacion}>
          <Link href="/" className={estilos.accesoVolver}>
            ← Volver al inicio
          </Link>

          <div className={estilos.accesoIdentidad}>
            <Image
              src="/imagenes/emi.jpg"
              alt="Escuela Militar de Ingeniería"
              width={85}
              height={85}
              className={estilos.accesoLogotipo}
            />

            <span>ESCUELA MILITAR DE INGENIERÍA</span>
          </div>

          <h1>
            Bienvenido a <span>SISCloud</span>
          </h1>

          <p className={estilos.accesoDescripcion}>
            Gestiona tus proyectos académicos, organiza
            documentos y colabora con tu equipo desde
            un solo lugar.
          </p>

          <div className={estilos.accesoBeneficios}>
            <p>✓ Organización de proyectos académicos</p>
            <p>✓ Trabajo colaborativo</p>
            <p>✓ Seguimiento y revisión docente</p>
          </div>

          <div className={estilos.accesoCarrera}>
            <Image
              src="/imagenes/sistemas.jpg"
              alt="Ingeniería de Sistemas"
              width={55}
              height={55}
              className={estilos.accesoLogotipo}
            />

            <div>
              <strong>Ingeniería de Sistemas</strong>
              <span>Unidad Académica La Paz</span>
            </div>
          </div>
        </div>

        <div className={estilos.accesoTarjeta}>
          <FormularioAcceso />
        </div>
      </div>
    </section>
  );
}
