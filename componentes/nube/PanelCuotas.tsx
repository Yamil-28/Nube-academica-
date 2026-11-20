"use client";
// Administrador: uso de almacenamiento por proyecto y cambio de límites (RF05).
import { useCallback, useEffect, useState } from "react";
import { formatoBytes } from "@/lib/nube/formato";
import { nube } from "@/lib/nube/cliente";
import type { ResumenCuotaDTO } from "@/lib/nube/tipos";
import Dialogo from "./Dialogo";
import { Icono } from "./iconos";
import e from "./nube.module.css";

export default function PanelCuotas() {
  const [filas, setFilas] = useState<ResumenCuotaDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [edicion, setEdicion] = useState<ResumenCuotaDTO | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const cargar = useCallback(async () => {
    try { setFilas(await nube.cuotas()); }
    catch (err) { setError((err as Error).message); }
  }, []);
  useEffect(() => { void cargar(); }, [cargar]);

  async function guardar(valor: string) {
    const mb = Number(valor);
    if (!edicion || !(mb > 0)) { setError("Escribe un número de MB mayor que cero"); return; }
    setOcupado(true); setError(null);
    try {
      await nube.fijarCuota(edicion.proyectoId, Math.round(mb * 1048576));
      setAviso(`Límite de “${edicion.titulo}” actualizado a ${mb} MB`);
      setEdicion(null);
      await cargar();
    } catch (err) { setError((err as Error).message); }
    finally { setOcupado(false); }
  }

  if (!filas) return error ? <p role="alert" className={e.bannerError}><Icono nombre="alerta" /> {error}</p> : <div className={e.esqueleto} aria-busy="true" />;

  const uso = filas.reduce((s, f) => s + f.usoBytes, 0);
  const capacidad = filas.reduce((s, f) => s + f.limiteBytes, 0);

  return (
    <section>
      <div className={e.resumen}>
        <div className={e.stat}><span className={e.statIcono}><Icono nombre="carpeta" /></span><div className={e.statCuerpo}><div className={e.statValor}>{filas.length}</div><div className={e.statEtiqueta}>Proyectos con espacio</div></div></div>
        <div className={e.stat}><span className={e.statIcono}><Icono nombre="disco" /></span><div className={e.statCuerpo}><div className={e.statValor}>{formatoBytes(uso)}</div><div className={e.statEtiqueta}>Espacio usado en total</div></div></div>
        <div className={e.stat}><span className={e.statIcono}><Icono nombre="nube" /></span><div className={e.statCuerpo}><div className={e.statValor}>{formatoBytes(capacidad)}</div><div className={e.statEtiqueta}>Capacidad asignada</div></div></div>
      </div>

      {aviso && <p role="status" className={e.bannerOk}><Icono nombre="check" /> {aviso}</p>}
      {error && !edicion && <p role="alert" className={e.bannerError}><Icono nombre="alerta" /> {error}</p>}

      <div className={e.tarjeta}>
        <div className={e.envoltura}>
          <table className={e.tabla}>
            <thead><tr><th>Proyecto</th><th>Uso</th><th className={e.ocultarMovil}>Límite</th><th className={e.derecha}>Acciones</th></tr></thead>
            <tbody>
              {filas.map((f) => {
                const pct = Math.min(100, Math.round((f.usoBytes / f.limiteBytes) * 100));
                const color = pct >= 90 ? e.rellenoRojo : pct >= 70 ? e.rellenoAmbar : e.rellenoVerde;
                return (
                  <tr key={f.proyectoId}>
                    <td><span className={e.nombreTxt}><span className={`${e.ico} ${e.icoCarpeta}`}><Icono nombre="carpeta" /></span>{f.titulo}</span></td>
                    <td style={{ minWidth: 220 }}>
                      {formatoBytes(f.usoBytes)} <small>({pct}%)</small>
                      <div className={e.barra}><div className={`${e.relleno} ${color}`} style={{ width: `${pct}%` }} /></div>
                    </td>
                    <td className={e.ocultarMovil}>{formatoBytes(f.limiteBytes)}</td>
                    <td><div className={e.acciones}>
                      <button type="button" className={e.botonSec} onClick={() => { setError(null); setEdicion(f); }}><Icono nombre="editar" tamano={16} /> Cambiar límite</button>
                    </div></td>
                  </tr>
                );
              })}
              {filas.length === 0 && <tr><td colSpan={4}><div className={e.vacio}><strong>No hay proyectos registrados</strong><span>Cuando existan proyectos, aquí verás su consumo de espacio.</span></div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Dialogo abierto={!!edicion} titulo="Cambiar límite de almacenamiento"
        descripcion={edicion ? `Proyecto: ${edicion.titulo}. Uso actual: ${formatoBytes(edicion.usoBytes)}.` : undefined}
        campo={{ etiqueta: "Nuevo límite (MB)", tipo: "number", min: 1, valor: edicion ? String(Math.round(edicion.limiteBytes / 1048576)) : "" }}
        confirmar="Guardar límite" ocupado={ocupado} error={edicion ? error : null}
        onConfirmar={(v) => void guardar(v)} onCerrar={() => { setEdicion(null); setError(null); }} />
    </section>
  );
}
