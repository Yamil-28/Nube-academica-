"use client";
// Administrador: uso de almacenamiento por proyecto y cambio de límites (RF05).
import { useCallback, useEffect, useState } from "react";
import { formatoBytes } from "@/lib/nube/formato";
import { nube } from "@/lib/nube/cliente";
import type { ResumenCuotaDTO } from "@/lib/nube/tipos";
import Dialogo from "./Dialogo";
import { Icono } from "./iconos";
import e from "./nube.module.css";

function formatoCapacidad(bytes: number) {
  const unidad = bytes >= 1e9 ? "gigabyte" : bytes >= 1e6 ? "megabyte" : bytes >= 1e3 ? "kilobyte" : "byte";
  const divisor = { gigabyte: 1e9, megabyte: 1e6, kilobyte: 1e3, byte: 1 }[unidad];
  return new Intl.NumberFormat("es-BO", { style: "unit", unit: unidad, maximumFractionDigits: 2 }).format(bytes / divisor);
}

export default function PanelCuotas({ revision, capacidadBytes }: { revision: number; capacidadBytes: number }) {
  const [filas, setFilas] = useState<ResumenCuotaDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [edicion, setEdicion] = useState<ResumenCuotaDTO | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const cargar = useCallback(async () => {
    try { setFilas(await nube.cuotas()); }
    catch (err) { setError((err as Error).message); }
  }, []);
  useEffect(() => {
    const inicio = window.setTimeout(() => void cargar(), 0);
    return () => window.clearTimeout(inicio);
  }, [cargar, revision]);
  useEffect(() => {
    if (edicion) return;
    const actualizar = () => {
      if (document.visibilityState === "visible") void cargar();
    };
    const intervalo = window.setInterval(actualizar, 15000);
    window.addEventListener("focus", actualizar);
    return () => {
      window.clearInterval(intervalo);
      window.removeEventListener("focus", actualizar);
    };
  }, [cargar, edicion]);

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
  const disponibleGlobal = Math.max(0, capacidadBytes - uso);
  const porcentajeGlobal = uso / capacidadBytes * 100;
  const porcentajeTexto = porcentajeGlobal > 0 && porcentajeGlobal < 0.01
    ? "Menos de 0,01 %" : `${new Intl.NumberFormat("es-BO", { maximumFractionDigits: 2 }).format(porcentajeGlobal)} %`;
  const usoPorMateria = new Map<number, number>();
  for (const fila of filas) {
    usoPorMateria.set(fila.materiaId, (usoPorMateria.get(fila.materiaId) ?? 0) + fila.usoBytes);
  }
  const normalizar = (valor: string) => valor.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("es");
  const texto = normalizar(busqueda.trim());
  const visibles = filas.filter((fila) => normalizar(`${fila.titulo} ${fila.materia}`).includes(texto));

  return (
    <section id="almacenamiento-proyectos">
      <section className={e.distribucion}>
        <div className={e.distribucionFila}>
          <h3>Uso total de almacenamiento</h3>
          <strong>{porcentajeTexto} ocupado</strong>
        </div>
        <div className={e.barra} aria-hidden="true">
          <div className={`${e.relleno} ${porcentajeGlobal >= 90 ? e.rellenoRojo : porcentajeGlobal >= 70 ? e.rellenoAmbar : e.rellenoVerde}`}
            style={{ width: `${Math.min(100, porcentajeGlobal)}%` }} />
        </div>
        <div className={e.resumenCapacidad}>
          <div><span>Ocupado por proyectos</span><strong>{formatoCapacidad(uso)}</strong></div>
          <div><span>Espacio restante estimado</span><strong>{formatoCapacidad(disponibleGlobal)}</strong></div>
          <div><span>Capacidad de referencia</span><strong>{formatoCapacidad(capacidadBytes)}</strong></div>
        </div>
        <p>Incluye todas las versiones de los archivos vigentes de los proyectos.</p>
      </section>
      <h2>Almacenamiento por proyecto</h2>
      <label className={e.buscarCuotas}>Buscar por proyecto o materia
        <input type="search" value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} />
      </label>

      {aviso && <p role="status" className={e.bannerOk}><Icono nombre="check" /> {aviso}</p>}
      {error && !edicion && <p role="alert" className={e.bannerError}><Icono nombre="alerta" /> {error}</p>}

      <div className={e.tarjeta}>
        <div className={e.envoltura}>
          <table className={e.tabla}>
            <thead><tr><th>Proyecto</th><th>Materia</th><th>Uso</th><th>Límite aplicable</th><th>Disponible</th><th className={e.derecha}>Acciones</th></tr></thead>
            <tbody>
              {visibles.map((f) => {
                const limiteAplicable = Math.min(f.limiteBytes, f.limiteMateriaBytes ?? Infinity);
                const pct = limiteAplicable > 0 ? Math.round((f.usoBytes / limiteAplicable) * 100) : 0;
                const disponibleMateria = f.limiteMateriaBytes === null
                  ? Infinity : f.limiteMateriaBytes - (usoPorMateria.get(f.materiaId) ?? 0);
                const disponible = Math.max(0, Math.min(f.limiteBytes - f.usoBytes, disponibleMateria));
                const color = pct >= 90 ? e.rellenoRojo : pct >= 70 ? e.rellenoAmbar : e.rellenoVerde;
                return (
                  <tr key={f.proyectoId}>
                    <td><span className={e.nombreTxt}><span className={`${e.ico} ${e.icoCarpeta}`}><Icono nombre="carpeta" /></span>{f.titulo}</span></td>
                    <td>{f.materia}</td>
                    <td style={{ minWidth: 145 }}>
                      {formatoBytes(f.usoBytes)} <small>({pct}%)</small>
                      <div className={e.barra}><div className={`${e.relleno} ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} /></div>
                    </td>
                    <td>
                      <strong>{formatoBytes(limiteAplicable)}</strong>
                      {f.limiteMateriaBytes !== null && (
                        <><br /><small>Materia: {formatoBytes(f.limiteMateriaBytes)} compartidos</small></>
                      )}
                    </td>
                    <td>{formatoBytes(disponible)}</td>
                    <td><div className={e.acciones}>
                      <button type="button" className={e.botonSec} onClick={() => { setError(null); setEdicion(f); }}><Icono nombre="editar" tamano={16} /> Cambiar límite</button>
                    </div></td>
                  </tr>
                );
              })}
              {visibles.length === 0 && <tr><td colSpan={6}><div className={e.vacio}><strong>{filas.length ? "No hay proyectos que coincidan" : "No hay proyectos registrados"}</strong></div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Dialogo abierto={!!edicion} titulo="Cambiar límite de almacenamiento"
        descripcion={edicion ? `Proyecto: ${edicion.titulo}. Uso actual: ${formatoBytes(edicion.usoBytes)}. El límite de la materia también se aplica.` : undefined}
        campo={{ etiqueta: "Nuevo límite (MB)", tipo: "number", min: 1, valor: edicion ? String(Math.round(edicion.limiteBytes / 1048576)) : "" }}
        confirmar="Guardar límite" ocupado={ocupado} error={edicion ? error : null}
        onConfirmar={(v) => void guardar(v)} onCerrar={() => { setEdicion(null); setError(null); }} />
    </section>
  );
}
