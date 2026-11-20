import { Suspense } from "react";
import Link from "next/link";
import { Users, UserPlus } from "lucide-react";

import EstructuraDashboard from "@/componentes/dashboard/EstructuraDashboard";
import {
  listarEquiposDeUsuario,
  titulosDeProyectos,
} from "@/lib/equipos/servicio";
import { ETIQUETA_ROL_EQUIPO } from "@/lib/equipos/tipos";
import { protegerRuta } from "@/lib/protegerRuta";
import { obtenerNombresUsuarios } from "@/lib/proyectos/nombres";

import estilos from "./page.module.css";

type Parametros = { creado?: string };

async function ContenidoMisEquipos({
  parametros,
}: {
  parametros: Promise<Parametros>;
}) {
  const usuario = await protegerRuta("ESTUDIANTE");
  const { creado } = await parametros;

  const equipos = await listarEquiposDeUsuario(usuario.id);
  const titulos = await titulosDeProyectos(equipos.map((e) => e.proyectoId));
  const nombres = await obtenerNombresUsuarios(
    equipos.flatMap((e) => e.miembros.map((m) => m.usuarioId))
  );

  return (
    <EstructuraDashboard usuario={usuario.usuario} rol={usuario.rol}>
      <div className={estilos.contenedor}>
        <section className={estilos.encabezado}>
          <div>
            <span className={estilos.etiqueta}>EQUIPOS DE TRABAJO</span>
            <h1>Mis equipos</h1>
            <p>Equipos de los que formas parte y sus integrantes.</p>
          </div>

          <Link href="/estudiante/equipos/nuevo" className={estilos.botonPrincipal}>
            <UserPlus size={18} />
            Crear equipo
          </Link>
        </section>

        {creado === "1" && (
          <p className={estilos.aviso}>Equipo creado correctamente.</p>
        )}

        {equipos.length === 0 ? (
          <section className={estilos.panel}>
            <div className={estilos.vacio}>
              <Users size={35} />
              <h3>Aún no formas parte de ningún equipo</h3>
              <p>Crea uno para tu proyecto y agrega a tus compañeros.</p>
            </div>
          </section>
        ) : (
          equipos.map((equipo) => {
            const miRol = equipo.miembros.find(
              (m) => m.usuarioId === usuario.id
            )?.rolEquipo;

            return (
              <article key={equipo.id} className={estilos.tarjeta}>
                <header className={estilos.tarjetaCabecera}>
                  <div>
                    <h2>{equipo.nombre}</h2>
                    <p>
                      Proyecto: {titulos.get(equipo.proyectoId) ?? "—"} ·{" "}
                      {equipo.miembros.length}{" "}
                      {equipo.miembros.length === 1 ? "integrante" : "integrantes"}
                    </p>
                  </div>

                  {miRol && (
                    <span className={estilos.rol}>{ETIQUETA_ROL_EQUIPO[miRol]}</span>
                  )}
                </header>

                <ul className={estilos.lista}>
                  {equipo.miembros.map((m) => (
                    <li key={m.id} className={estilos.miembro}>
                      <span>{nombres.get(m.usuarioId) ?? "Usuario"}</span>
                      <span
                        className={
                          m.rolEquipo === "LIDER"
                            ? estilos.rolLider
                            : estilos.rolIntegrante
                        }
                      >
                        {ETIQUETA_ROL_EQUIPO[m.rolEquipo]}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })
        )}
      </div>
    </EstructuraDashboard>
  );
}

export default function PaginaMisEquipos({
  searchParams,
}: {
  searchParams: Promise<Parametros>;
}) {
  return (
    <Suspense fallback={<p>Cargando equipos...</p>}>
      <ContenidoMisEquipos parametros={searchParams} />
    </Suspense>
  );
}