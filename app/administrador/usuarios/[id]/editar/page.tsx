import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";

import { protegerRuta } from "@/lib/protegerRuta";
import { prisma } from "@/lib/prisma";
import FormularioEditar from "./FormularioEditar";
import FormularioRestablecer from "./FormularioRestablecer";

import estilos from "./page.module.css";

type Propiedades = {
  params: Promise<{ id: string }>;
};

async function ContenidoEdicion({ params }: Propiedades) {
  // 1. Verificar que sea un administrador
  const sesion = await protegerRuta("ADMINISTRADOR");

  // 2. Obtener el identificador del usuario
  const { id } = await params;
  const identificador = Number(id);

  if (
    !Number.isSafeInteger(identificador) ||
    identificador <= 0
  ) {
    notFound();
  }

  // 3. Consultar los datos del usuario en Neon
  const cuenta = await prisma.usuario.findUnique({
    where: {
      id: identificador,
    },
    select: {
      id: true,
      nombre: true,
      usuario: true,
      rol: true,
      activo: true,
    },
  });

  if (!cuenta) {
    notFound();
  }

  // 4. Mostrar el contenido dentro del layout compartido
  return (
    <div className={estilos.pagina}>
      <div className={estilos.encabezado}>
        <span className={estilos.etiqueta}>
          GESTIÓN DE USUARIOS
        </span>

        <h1>Editar usuario</h1>

        <p>
          Modifica la información, los permisos y la
          seguridad de la cuenta.
        </p>
      </div>

      <section className={estilos.tarjeta}>
        <div className={estilos.tarjetaTitulo}>
          <Pencil size={21} />
          <h2>Información del usuario</h2>
        </div>

        <FormularioEditar
          cuenta={cuenta}
          esCuentaPropia={cuenta.id === sesion.id}
        />
      </section>

      {/* Restablecimiento de contraseña */}
      <FormularioRestablecer
        idUsuario={cuenta.id}
      />
    </div>
  );
}

export default function PaginaEditarUsuario(
  propiedades: Propiedades
) {
  return (
    <Suspense fallback={<CargandoDashboard />}>
      <ContenidoEdicion {...propiedades} />
    </Suspense>
  );
}
