import { Suspense } from "react";
import CargandoNube from "@/componentes/nube/CargandoNube";
import VistaNube from "@/componentes/nube/VistaNube";
import { exigirRol } from "@/lib/nube/guardia";

type Props = { searchParams: Promise<{ proyecto?: string }> };

// Con Cache Components, lo que lee cookies/parámetros debe ir dentro de <Suspense>.
async function Contenido({ searchParams }: Props) {
  await exigirRol("ADMINISTRADOR");
  const { proyecto } = await searchParams;
  return <VistaNube rutaBase="/administrador/nube" proyectoParam={proyecto} />;
}

export default function Pagina(props: Props) {
  return (
    <Suspense fallback={<CargandoNube />}>
      <Contenido searchParams={props.searchParams} />
    </Suspense>
  );
}
