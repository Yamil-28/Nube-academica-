// Pantalla "Compartidos conmigo" (servidor): archivos que otros usuarios compartieron con mi cuenta (RF08).
import { obtenerContexto } from "@/lib/nube/contexto";
import { claseTipo, fechaCorta, formatoBytes } from "@/lib/nube/formato";
import { listarCompartidosConmigo } from "@/lib/nube/servicio";
import CabeceraNube from "./CabeceraNube";
import { Icono } from "./iconos";
import NavegacionNube from "./NavegacionNube";
import e from "./nube.module.css";

export default async function VistaCompartidos() {
  const ctx = await obtenerContexto();
  const items = await listarCompartidosConmigo(ctx);

  return (
    <div className={e.raiz}>
      <CabeceraNube rol={ctx.usuario.rol} titulo="Espacios compartidos" subtitulo="Archivos que otras personas compartieron contigo." />
      <NavegacionNube rol={ctx.usuario.rol} activa="compartidos" />
      <div className={e.tarjeta}>
        {items.length === 0 ? (
          <div className={e.vacio}>
            <span className={e.vacioIcono}><Icono nombre="compartir" tamano={44} /></span>
            <strong>Nadie ha compartido archivos contigo todavía</strong>
            <span>Cuando un compañero comparta un archivo, aparecerá en esta lista.</span>
          </div>
        ) : (
          <div className={e.envoltura}>
            <table className={e.tabla}>
              <thead>
                <tr><th>Archivo</th><th className={e.ocultarMovil}>Proyecto</th><th>Compartido por</th><th>Permiso</th><th className={e.ocultarMovil}>Fecha</th><th className={e.derecha}>Descargar</th></tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.archivoId}>
                    <td><span className={e.nombreTxt}><span className={`${e.ico} ${e[claseTipo(i.tipo)]}`}><Icono nombre="archivo" /></span>
                      <span>{i.nombre}<br /><small>{formatoBytes(i.tamanoBytes)} · v{i.versionActual}</small></span></span></td>
                    <td className={e.ocultarMovil}>{i.proyecto}</td>
                    <td>{i.compartidoPor}</td>
                    <td><span className={`${e.chip} ${i.nivel === "EDICION" ? e.chipAzul : e.chipOk}`}>{i.nivel === "EDICION" ? "Puede editar" : "Solo lectura"}</span></td>
                    <td className={e.ocultarMovil}>{fechaCorta(i.fecha)}</td>
                    <td><div className={e.acciones}>
                      <a className={e.icono} href={`/api/nube/archivos/${i.archivoId}`} title="Descargar" aria-label={`Descargar ${i.nombre}`}><Icono nombre="descargar" /></a>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
