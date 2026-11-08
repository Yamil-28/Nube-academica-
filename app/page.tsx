
import Image from "next/image";

import estilos from "./page.module.css";

export default function PaginaPrincipal() {
  return (
    <div
     className={estilos.emiInicio}
     data-pagina="inicio-emi"
     >
      {/* PORTADA INSTITUCIONAL */}
      <section className={estilos.emiPortada}>
        <Image
          src="/logo-body.jpg"
          alt="Instalaciones de la Escuela Militar de Ingeniería"
          fill
          priority
          sizes="100vw"
          className={estilos.emiPortadaImagen}
        />

        <div className={estilos.emiPortadaSombra} />

        <div className={estilos.emiPortadaContenido}>
          <span className={estilos.emiPortadaEtiqueta}>
            ESCUELA MILITAR DE INGENIERÍA
          </span>

          <h1>
            Formación, tecnología
            <br />
            e innovación
          </h1>

          <p>Mariscal Antonio José de Sucre</p>
        </div>
      </section>

      {/* INFORMACIÓN INSTITUCIONAL */}
      <section className={estilos.emiInformacion}>
        <div className={estilos.emiInformacionContenedor}>
          <span className={estilos.emiInformacionEtiqueta}>
            NUESTRA INSTITUCIÓN
          </span>

          <h2>Escuela Militar de Ingeniería</h2>

          <p>
            Una institución de educación superior orientada
            a la formación profesional, la investigación
            y el desarrollo tecnológico.
          </p>

          <div className={estilos.emiInformacionTarjetas}>
            <article>
              <h3>Formación académica</h3>
              <p>
                Desarrollo de conocimientos y competencias profesionales.
              </p>
            </article>

            <article>
              <h3>Investigación</h3>
              <p>
                Impulso a la ciencia, la tecnología y la innovación.
              </p>
            </article>

            <article>
              <h3>Interacción social</h3>
              <p>
                Vinculación de la formación académica con la sociedad.
              </p>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
