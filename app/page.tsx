
import Image from "next/image";

export default function PaginaPrincipal() {
  return (
    <div className="emi-inicio">
      <section className="emi-portada">
        <Image
          src="/logo-body.jpg"
          alt="Instalaciones de la Escuela Militar de Ingeniería"
          fill
          priority
          sizes="100vw"
          className="emi-portada-imagen"
        />

        <div className="emi-portada-sombra" />

        <div className="emi-portada-contenido">
          <span className="emi-portada-etiqueta">
            ESCUELA MILITAR DE INGENIERÍA
          </span>

          <h1>
            Formación, tecnología
            <br />
            e innovación
          </h1>

          <p>
            Mariscal Antonio José de Sucre
          </p>
        </div>
      </section>

      <section className="emi-informacion">
        <div className="emi-informacion-contenedor">
          <span className="emi-informacion-etiqueta">
            NUESTRA INSTITUCIÓN
          </span>

          <h2>Escuela Militar de Ingeniería</h2>

          <p>
            Una institución de educación superior orientada
            a la formación profesional, la investigación
            y el desarrollo tecnológico.
          </p>

          <div className="emi-informacion-tarjetas">
            <article>
              <h3>Formación académica</h3>
              <p>Desarrollo de conocimientos y competencias profesionales.</p>
            </article>

            <article>
              <h3>Investigación</h3>
              <p>Impulso a la ciencia, la tecnología y la innovación.</p>
            </article>

            <article>
              <h3>Interacción social</h3>
              <p>Vinculación de la formación académica con la sociedad.</p>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
