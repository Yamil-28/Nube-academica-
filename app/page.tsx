
import Image from "next/image";

export default function PaginaPrincipal() {
  return (
    <section className="contenedor py-16">
      <div className="tarjeta mx-auto max-w-3xl p-8 text-center">
        <Image
          src="/imagenes/sistemas.jpg"
          alt="Ingeniería de Sistemas"
          width={110}
          height={110}
          className="mx-auto mb-6 rounded-full"
        />

        <h2 className="mb-4 text-4xl font-bold text-[var(--color-primario)]">
          Bienvenido a SISCloud
        </h2>

        <p className="text-[var(--color-texto-secundario)]">
          Plataforma académica para gestionar proyectos,
          organizar documentos y colaborar con equipos de trabajo.
        </p>
      </div>
    </section>
  );
}
