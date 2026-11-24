"use client";

import { useEffect, useState } from "react";
import { nube } from "@/lib/nube/cliente";
import { formatoBytes } from "@/lib/nube/formato";
import type { ResumenCuotaMateriaDTO } from "@/lib/nube/tipos";
import Dialogo from "./Dialogo";
import e from "./nube.module.css";

const MB = 1024 * 1024;

export default function PanelCuotasMaterias({ iniciales, onCambio }: { iniciales: ResumenCuotaMateriaDTO[]; onCambio: () => void }) {
  const [materias, setMaterias] = useState(iniciales);
  const [edicion, setEdicion] = useState<ResumenCuotaMateriaDTO | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    if (edicion) return;
    let activa = true;
    const actualizar = () => {
      if (document.visibilityState === "visible") {
        void nube.cuotasMaterias().then((filas) => {
          if (activa) setMaterias(filas);
        }).catch(() => {});
      }
    };
    const intervalo = window.setInterval(actualizar, 15000);
    window.addEventListener("focus", actualizar);
    return () => {
      activa = false;
      window.clearInterval(intervalo);
      window.removeEventListener("focus", actualizar);
    };
  }, [edicion]);

  async function guardar(valor: string) {
    if (!edicion || ocupado) return;
    const bytes = valor === "" ? null : Math.round(Number(valor) * MB);
    setOcupado(true);
    setError("");
    setAviso("");
    try {
      if (bytes !== null && (!Number.isSafeInteger(bytes) || bytes <= 0)) {
        throw new Error("Indica un límite válido en MB");
      }
      await nube.fijarCuotaMateria(edicion.materiaId, bytes);
      setMaterias((filas) => filas.map((materia) =>
        materia.materiaId === edicion.materiaId ? { ...materia, limiteBytes: bytes } : materia
      ));
      setAviso("Límite actualizado para " + edicion.nombre);
      setEdicion(null);
      onCambio();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setOcupado(false);
    }
  }

  return (
    <section>
      <h2>Almacenamiento por materia</h2>
      {aviso && <p role="status" className={e.bannerOk}>{aviso}</p>}
      <div className={e.tarjeta}>
        <div className={e.envoltura}>
          <table className={e.tabla}>
            <thead><tr><th scope="col">Materia</th><th scope="col">Semestre</th><th scope="col">Proyectos</th><th scope="col">Uso</th><th scope="col">Límite total</th><th scope="col">Acciones</th></tr></thead>
            <tbody>
              {materias.map((materia) => (
                <tr key={materia.materiaId}>
                  <th scope="row">{materia.codigo && materia.codigo + " · "}{materia.nombre}{!materia.activa && " (inactiva)"}</th>
                  <td>{materia.nivel}.º</td>
                  <td>{materia.proyectos || "Sin proyectos"}</td>
                  <td>{formatoBytes(materia.usoBytes)}</td>
                  <td>{materia.limiteBytes === null ? "Sin límite total" : formatoBytes(materia.limiteBytes)}</td>
                  <td><button type="button" className={e.botonSec} onClick={() => { setEdicion(materia); setError(""); }}>Cambiar límite</button></td>
                </tr>
              ))}
              {materias.length === 0 && <tr><td colSpan={6}>No hay materias registradas.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <Dialogo
        abierto={edicion !== null}
        titulo={edicion ? "Límite de " + edicion.nombre : "Límite por materia"}
        descripcion="El límite se comparte entre todos los proyectos de la materia. Deja el campo vacío para quitarlo."
        campo={{ etiqueta: "Límite total (MB)", tipo: "number", min: 0.001, paso: "any", requerido: false, valor: edicion?.limiteBytes == null ? "" : String(edicion.limiteBytes / MB) }}
        confirmar="Guardar límite"
        ocupado={ocupado}
        error={error}
        onConfirmar={(valor) => void guardar(valor)}
        onCerrar={() => { if (!ocupado) setEdicion(null); }}
      />
    </section>
  );
}
