
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, UserPlus } from "lucide-react";

import { protegerRuta } from "@/lib/protegerRuta";
import FormularioRegistro from "./FormularioRegistro";

import estilos from "./page.module.css";

async function ContenidoRegistro() {
  // Verificar que sea un administrador
  await protegerRuta("ADMINISTRADOR");

  return (
    <div className={estilos.pagina}>
      <Link
        href="/administrador/usuarios"
        className={estilos.botonVolver}
      >
        <ArrowLeft size={18} />
        Volver a Gestión de Usuarios
      </Link>

      <div className={estilos.encabezado}>
        <span className={estilos.etiqueta}>
          GESTIÓN DE USUARIOS
        </span>

        <h1>Registrar usuario</h1>

        <p>
          Crea una cuenta para un administrador, docente
          o estudiante de SISCloud.
        </p>
      </div>

      <section className={estilos.tarjeta}>
        <div className={estilos.tarjetaTitulo}>
          <UserPlus size={22} />
          <h2>Información de la nueva cuenta</h2>
        </div>

        <FormularioRegistro />
      </section>
    </div>
  );
}

export default function PaginaNuevoUsuario() {
  return (
    <Suspense fallback={null}>
      <ContenidoRegistro />
    </Suspense>
  );
}
