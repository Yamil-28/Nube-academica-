
import Image from "next/image";
import Link from "next/link";
import FormularioAcceso from "@/componentes/FormularioAcceso";
import estilos from "./page.module.css";

export default function PaginaIniciarSesion() {
  return (
    <main className={estilos.paginaAcceso}>
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
            SISCloud es la plataforma de la EMI para gestionar proyectos
            académicos. Aquí puedes organizar los archivos de tu equipo,
            consultar el estado de cada proyecto y seguir los avances
            y las observaciones docentes.
          </p>

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
    </main>
  );
}
