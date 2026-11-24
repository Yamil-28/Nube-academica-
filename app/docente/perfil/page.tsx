import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";

import { Suspense } from "react";
import { protegerRuta } from "@/lib/protegerRuta";
import { prisma } from "@/lib/prisma";
import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import PerfilUsuario from "@/componentes/perfil/PerfilUsuario";

async function ContenidoPerfil() {
  const sesion = await protegerRuta("DOCENTE");

  const cuenta = await prisma.usuario.findUniqueOrThrow({
    where: { id: sesion.id },
    select: { nombre: true, usuario: true, rol: true, creadoEn: true },
  });

  return (
    <EstructuraDashboard usuario={cuenta.usuario} rol={cuenta.rol}>
      <PerfilUsuario
        nombre={cuenta.nombre}
        usuario={cuenta.usuario}
        rol={cuenta.rol}
        fotoRevision={sesion.fotoPerfil?.revision}
        creadoEn={cuenta.creadoEn.toLocaleDateString("es-BO", {
          timeZone: "America/La_Paz",
        })}
      />
    </EstructuraDashboard>
  );
}

export default function PaginaPerfil() {
  return (
    <Suspense fallback={<CargandoDashboard />}>
      <ContenidoPerfil />
    </Suspense>
  );
}
