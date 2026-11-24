"use client";

import { useState } from "react";
import type { ResumenCuotaMateriaDTO } from "@/lib/nube/tipos";
import PanelCuotasMaterias from "./PanelCuotasMaterias";
import PanelCuotas from "./PanelCuotas";

export default function PanelAlmacenamiento({ materias }: { materias: ResumenCuotaMateriaDTO[] }) {
  const [revision, setRevision] = useState(0);
  return (
    <>
      <PanelCuotasMaterias iniciales={materias} onCambio={() => setRevision((actual) => actual + 1)} />
      <PanelCuotas revision={revision} />
    </>
  );
}
