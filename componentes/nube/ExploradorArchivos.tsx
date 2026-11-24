"use client";
// Explorador REUTILIZABLE de archivos y carpetas de un proyecto (RF05–RF09).
// El mismo componente sirve a Estudiante, Docente y Administrador: los botones visibles
// dependen de `datos.permisos`, que calcula el servidor (lib/nube/politica.ts).
import { useCallback, useEffect, useRef, useState, type DragEvent, type ReactNode } from "react";
import { claseTipo, fechaCorta, formatoBytes } from "@/lib/nube/formato";
import { nube } from "@/lib/nube/cliente";
import type { ArchivoDTO, CarpetaDTO, ContenidoDTO } from "@/lib/nube/tipos";
import Dialogo, { type CampoDialogo } from "./Dialogo";
import { Icono } from "./iconos";
import PanelCompartir from "./PanelCompartir";
import PanelVersiones from "./PanelVersiones";
import e from "./nube.module.css";

type Estado =
  | { tipo: "carpeta" }
  | { tipo: "renombrarCarpeta"; carpeta: CarpetaDTO }
  | { tipo: "eliminarCarpeta"; carpeta: CarpetaDTO }
  | { tipo: "renombrarArchivo"; archivo: ArchivoDTO }
  | { tipo: "eliminarArchivo"; archivo: ArchivoDTO }
  | { tipo: "versiones"; archivo: ArchivoDTO }
  | { tipo: "compartir"; archivo: ArchivoDTO };

interface Config {
  titulo: string; descripcion?: string; campo?: CampoDialogo; confirmar?: string; peligro?: boolean;
  soloCerrar?: boolean; amplio?: boolean; contenido?: ReactNode; accion?: (valor: string) => Promise<unknown>; ok?: string;
}

export default function ExploradorArchivos({ proyectoId }: { proyectoId: number }) {
  const [carpetaId, setCarpetaId] = useState<number | null>(null);
  const [datos, setDatos] = useState<ContenidoDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const [dialogo, setDialogo] = useState<Estado | null>(null);
  const entradaArchivo = useRef<HTMLInputElement>(null);

  const ultimaCarga = useRef(0);

  const cargar = useCallback(async (silenciosa = false) => {
    const solicitud = ++ultimaCarga.current;
    try {
      const contenido = await nube.contenido(proyectoId, carpetaId);
      if (solicitud === ultimaCarga.current) setDatos(contenido);
    } catch (err) {
      if (solicitud === ultimaCarga.current && !silenciosa) setError((err as Error).message);
    }
  }, [proyectoId, carpetaId]);
  useEffect(() => {
    const inicio = window.setTimeout(() => void cargar(), 0);
    return () => window.clearTimeout(inicio);
  }, [cargar]);

  useEffect(() => {
    if (ocupado || dialogo) return;
    const actualizar = () => {
      if (document.visibilityState === "visible") void cargar(true);
    };
    const intervalo = window.setInterval(actualizar, 15000);
    window.addEventListener("focus", actualizar);
    return () => {
      window.clearInterval(intervalo);
      window.removeEventListener("focus", actualizar);
    };
  }, [cargar, dialogo, ocupado]);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 4000);
    return () => clearTimeout(t);
  }, [aviso]);

  const cerrar = () => { setDialogo(null); setError(null); };

  async function ejecutar(accion: () => Promise<unknown>, ok: string) {
    setOcupado(true); setError(null);
    try { await accion(); setAviso(ok); setDialogo(null); await cargar(); }
    catch (err) { setError((err as Error).message); }
    finally { setOcupado(false); }
  }

  async function subirVarios(lista: File[]) {
    if (lista.length === 0) return;
    setOcupado(true); setError(null); setAviso(null);
    let correctos = 0;
    const fallos: string[] = [];
    for (const f of lista) {
      try { await nube.subir(proyectoId, f, carpetaId); correctos++; }
      catch (err) { fallos.push(`${f.name}: ${(err as Error).message}`); }
    }
    await cargar();
    setOcupado(false);
    if (correctos) setAviso(`${correctos} archivo${correctos > 1 ? "s" : ""} subido${correctos > 1 ? "s" : ""} correctamente`);
    if (fallos.length) setError(fallos.join(" · "));
  }

  function alSoltar(ev: DragEvent<HTMLDivElement>) {
    ev.preventDefault(); setArrastrando(false);
    if (datos?.permisos.subir) void subirVarios(Array.from(ev.dataTransfer.files));
  }

  if (!datos) return error ? <p role="alert" className={e.bannerError}><Icono nombre="alerta" /> {error}</p> : <div className={e.esqueleto} aria-busy="true" />;

  const p = datos.permisos;
  const c = datos.cuota;
  const pct = Math.min(100, Math.round((c.usoBytes / c.limiteBytes) * 100));
  const colorBarra = pct >= 90 ? e.rellenoRojo : pct >= 70 ? e.rellenoAmbar : e.rellenoVerde;
  const ultima = datos.ruta.length - 1;

  function configurar(s: Estado | null): Config | null {
    if (!s) return null;
    switch (s.tipo) {
      case "carpeta": return { titulo: "Nueva carpeta", campo: { etiqueta: "Nombre de la carpeta", placeholder: "Ej. Informes" }, confirmar: "Crear carpeta", accion: (v) => nube.crearCarpeta(proyectoId, v, carpetaId), ok: "Carpeta creada" };
      case "renombrarCarpeta": return { titulo: "Renombrar carpeta", campo: { etiqueta: "Nuevo nombre", valor: s.carpeta.nombre }, confirmar: "Guardar", accion: (v) => nube.renombrarCarpeta(s.carpeta.id, v), ok: "Carpeta renombrada" };
      case "eliminarCarpeta": return { titulo: "Eliminar carpeta", descripcion: `Se eliminará “${s.carpeta.nombre}” junto con todo su contenido.`, confirmar: "Eliminar", peligro: true, accion: () => nube.eliminarCarpeta(s.carpeta.id), ok: "Carpeta eliminada" };
      case "renombrarArchivo": return { titulo: "Renombrar archivo", campo: { etiqueta: "Nuevo nombre", valor: s.archivo.nombre }, confirmar: "Guardar", accion: (v) => nube.renombrarArchivo(s.archivo.id, v), ok: "Archivo renombrado" };
      case "eliminarArchivo": return { titulo: "Eliminar archivo", descripcion: `“${s.archivo.nombre}” dejará de estar visible para los miembros del proyecto.`, confirmar: "Eliminar", peligro: true, accion: () => nube.eliminarArchivo(s.archivo.id), ok: "Archivo eliminado" };
      case "versiones": return { titulo: `Versiones · ${s.archivo.nombre}`, soloCerrar: true, amplio: true, contenido: <PanelVersiones archivo={s.archivo} puedeDescargar={p.descargar} puedeSubir={p.subir} onCambio={() => void cargar()} /> };
      case "compartir": return { titulo: `Compartir · ${s.archivo.nombre}`, soloCerrar: true, amplio: true, contenido: <PanelCompartir archivo={s.archivo} /> };
    }
  }
  const cfg = configurar(dialogo);

  return (
    <section>
      <div className={e.resumen}>
        <div className={e.stat}><span className={e.statIcono}><Icono nombre="carpeta" /></span><div className={e.statCuerpo}><div className={e.statValor}>{datos.carpetas.length}</div><div className={e.statEtiqueta}>Carpetas aquí</div></div></div>
        <div className={e.stat}><span className={e.statIcono}><Icono nombre="archivo" /></span><div className={e.statCuerpo}><div className={e.statValor}>{datos.archivos.length}</div><div className={e.statEtiqueta}>Archivos aquí</div></div></div>
        <div className={e.stat}>
          <span className={e.statIcono}><Icono nombre="disco" /></span>
          <div className={e.statCuerpo}>
            <div className={e.statValor}>{formatoBytes(c.usoBytes)} <small style={{ fontSize: ".75rem", fontWeight: 500 }}>de {formatoBytes(c.limiteBytes)}</small></div>
            <div className={e.barra} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Espacio usado"><div className={`${e.relleno} ${colorBarra}`} style={{ width: `${pct}%` }} /></div>
          </div>
        </div>
      </div>

      {aviso && <p role="status" className={e.bannerOk}><Icono nombre="check" /> {aviso}</p>}
      {error && !dialogo && <p role="alert" className={e.bannerError}><Icono nombre="alerta" /> {error}</p>}

      <div className={e.tarjeta}>
        {ocupado && <div className={e.progreso} />}
        <header className={e.tarjetaCab}>
          <nav className={e.migas} aria-label="Ruta de carpetas">
            {datos.ruta.map((m, i) => (
              <span key={m.id ?? "raiz"} style={{ display: "inline-flex", alignItems: "center" }}>
                <button type="button" className={e.miga} disabled={i === ultima} onClick={() => setCarpetaId(m.id)}>
                  {i === 0 && <Icono nombre="nube" tamano={16} />}{m.nombre}
                </button>
                {i < ultima && <Icono nombre="chevron" tamano={14} />}
              </span>
            ))}
          </nav>
          <div className={e.herramientas}>
            {p.crearCarpeta && <button type="button" className={e.botonSec} disabled={ocupado} onClick={() => setDialogo({ tipo: "carpeta" })}><Icono nombre="carpetaMas" /> Nueva carpeta</button>}
            {p.subir && (
              <>
                <button type="button" className={e.botonPrimario} disabled={ocupado} onClick={() => entradaArchivo.current?.click()}><Icono nombre="subir" /> Subir archivos</button>
                <input ref={entradaArchivo} type="file" multiple hidden onChange={(ev) => { const l: File[] = Array.from(ev.target.files ?? []); ev.target.value = ""; void subirVarios(l); }} />
              </>
            )}
          </div>
        </header>

        {!p.subir && <p className={e.infoLectura}><Icono nombre="candado" tamano={16} /> Modo consulta: puedes ver y descargar los archivos de este proyecto.</p>}

        <div className={`${e.zona} ${arrastrando ? e.zonaActiva : ""}`}
          onDragOver={(ev) => { if (p.subir) { ev.preventDefault(); setArrastrando(true); } }}
          onDragLeave={() => setArrastrando(false)} onDrop={alSoltar}>
          <div className={e.envoltura}>
            <table className={e.tabla}>
              <thead>
                <tr>
                  <th>Nombre</th><th className={e.ocultarMovil}>Tipo</th><th>Tamaño</th>
                  <th className={e.ocultarMovil}>Versión</th><th className={e.ocultarMovil}>Modificado</th><th className={e.derecha}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {datos.carpetas.map((f) => (
                  <tr key={`c${f.id}`}>
                    <td><button type="button" className={e.nombreBtn} onClick={() => setCarpetaId(f.id)}><span className={`${e.ico} ${e.icoCarpeta}`}><Icono nombre="carpeta" /></span>{f.nombre}</button></td>
                    <td className={e.ocultarMovil}><span className={e.chip}>Carpeta</span></td><td>—</td><td className={e.ocultarMovil}>—</td>
                    <td className={e.ocultarMovil}>{fechaCorta(f.creadaEn)}</td>
                    <td><div className={e.acciones}>
                      {p.renombrar && <button type="button" className={e.icono} title="Renombrar" aria-label={`Renombrar ${f.nombre}`} onClick={() => setDialogo({ tipo: "renombrarCarpeta", carpeta: f })}><Icono nombre="editar" /></button>}
                      {p.eliminar && <button type="button" className={`${e.icono} ${e.iconoPeligro}`} title="Eliminar" aria-label={`Eliminar ${f.nombre}`} onClick={() => setDialogo({ tipo: "eliminarCarpeta", carpeta: f })}><Icono nombre="papelera" /></button>}
                    </div></td>
                  </tr>
                ))}
                {datos.archivos.map((a) => (
                  <tr key={`a${a.id}`}>
                    <td><span className={e.nombreTxt}><span className={`${e.ico} ${e[claseTipo(a.tipo)]}`}><Icono nombre="archivo" /></span>{a.nombre}</span></td>
                    <td className={e.ocultarMovil}><span className={e.chip}>{a.tipo ?? "Otro"}</span></td>
                    <td>{formatoBytes(a.tamanoBytes)}</td>
                    <td className={e.ocultarMovil}><span className={e.version}>v{a.versionActual}</span></td>
                    <td className={e.ocultarMovil}>{fechaCorta(a.actualizadoEn)}</td>
                    <td><div className={e.acciones}>
                      {p.descargar && <a className={e.icono} href={nube.urlDescarga(a.id)} title="Descargar" aria-label={`Descargar ${a.nombre}`}><Icono nombre="descargar" /></a>}
                      {p.verVersiones && <button type="button" className={e.icono} title="Versiones" aria-label={`Versiones de ${a.nombre}`} onClick={() => setDialogo({ tipo: "versiones", archivo: a })}><Icono nombre="versiones" /></button>}
                      {p.compartir && <button type="button" className={e.icono} title="Compartir" aria-label={`Compartir ${a.nombre}`} onClick={() => setDialogo({ tipo: "compartir", archivo: a })}><Icono nombre="compartir" /></button>}
                      {p.renombrar && <button type="button" className={e.icono} title="Renombrar" aria-label={`Renombrar ${a.nombre}`} onClick={() => setDialogo({ tipo: "renombrarArchivo", archivo: a })}><Icono nombre="editar" /></button>}
                      {p.eliminar && <button type="button" className={`${e.icono} ${e.iconoPeligro}`} title="Eliminar" aria-label={`Eliminar ${a.nombre}`} onClick={() => setDialogo({ tipo: "eliminarArchivo", archivo: a })}><Icono nombre="papelera" /></button>}
                    </div></td>
                  </tr>
                ))}
                {datos.carpetas.length + datos.archivos.length === 0 && (
                  <tr><td colSpan={6}>
                    <div className={e.vacio}>
                      <span className={e.vacioIcono}><Icono nombre="nube" tamano={44} /></span>
                      <strong>Esta carpeta está vacía</strong>
                      <span>{p.subir ? "Arrastra archivos aquí, o usa “Subir archivos” y “Nueva carpeta”." : "Todavía no hay archivos en esta carpeta."}</span>
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
          {p.subir && <p className={e.pista}>Puedes arrastrar y soltar archivos en esta zona para subirlos.</p>}
        </div>
      </div>

      <Dialogo abierto={!!cfg} titulo={cfg?.titulo ?? ""} descripcion={cfg?.descripcion} campo={cfg?.campo}
        confirmar={cfg?.confirmar} peligro={cfg?.peligro} soloCerrar={cfg?.soloCerrar} amplio={cfg?.amplio}
        ocupado={ocupado} error={dialogo ? error : null} onCerrar={cerrar}
        onConfirmar={(valor) => { const a = cfg?.accion; if (a) void ejecutar(() => a(valor), cfg?.ok ?? "Listo"); }}>
        {cfg?.contenido}
      </Dialogo>
    </section>
  );
}
