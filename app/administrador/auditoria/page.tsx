import { TipoEventoAuditoria } from "@/app/generated/prisma/enums";
import FiltrosListado, { coincide, parametro, type ParametrosListado } from "@/componentes/dashboard/FiltrosListado";
import CargandoDashboard from "@/componentes/dashboard/CargandoDashboard";

import { Suspense } from "react";
import {
  ClipboardList,
  ShieldCheck,
  CalendarDays,
  UserRound,
} from "lucide-react";

import { protegerRuta } from "@/lib/protegerRuta";
import { prisma } from "@/lib/prisma";

async function ContenidoAuditoria({ searchParams }: { searchParams: Promise<ParametrosListado> }) {
  // Verificar que sea un administrador
  await protegerRuta("ADMINISTRADOR");
  const filtros = await searchParams;
  const q = parametro(filtros, "q");
  const tipos = Object.values(TipoEventoAuditoria);
  const tipo = tipos.find((valor) => valor === parametro(filtros, "tipo"));
  const busqueda = q ? {
    OR: [
      { descripcion: { contains: q, mode: "insensitive" as const } },
      { usuarioNombre: { contains: q, mode: "insensitive" as const } },
      { tipo: { in: tipos.filter((valor) => coincide(q, valor, valor.replaceAll("_", " "))) } },
      ...(/^\d+$/.test(q) && Number(q) <= 2147483647 ? [{ entidadId: Number(q) }] : []),
    ],
  } : {};

  // Obtener los últimos 100 registros de Neon
  const registros = await prisma.auditoria.findMany({
    where: { ...busqueda, tipo },
    orderBy: {
      fecha: "desc",
    },
    take: 100,
    select: {
      id: true,
      tipo: true,
      descripcion: true,
      usuarioNombre: true,
      entidadId: true,
      fecha: true,
    },
  });


  return (
    <div
      style={{
        padding: "24px",
        color: "var(--color-texto)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "12px",
        }}
      >
        <ClipboardList size={30} />

        <h1
          style={{
            fontSize: "28px",
            fontWeight: 800,
          }}
        >
          Auditoría del sistema
        </h1>
      </div>

      <p
        style={{
          color: "var(--color-texto-secundario)",
        }}
      >
        Consulta las actividades registradas
        en SISCloud.
      </p>


      <FiltrosListado ruta="/administrador/auditoria" filtros={filtros} etiqueta="Buscar actividad, usuario o entidad" selectores={[{ nombre: "tipo", todos: "Todos los tipos", opciones: tipos.map((valor) => ({ valor, etiqueta: valor.replaceAll("_", " ") })) }]} />
      <section
        style={{
          marginTop: "24px",
          padding: "24px",
          border: "1px solid var(--color-borde)",
          borderRadius: "16px",
          background: "var(--color-blanco)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <ShieldCheck
            size={26}
            color="var(--color-primario)"
          />

          <div>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 700,
              }}
            >
              Historial de actividades
            </h2>

            <p
              style={{
                color: "var(--color-texto-secundario)",
              }}
            >
              Mostrando {registros.length}
              {" "}registros.
            </p>
          </div>
        </div>

        {registros.length === 0 ? (
          <p>
            Todavía no existen actividades
            registradas en el sistema.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom:
                      "2px solid var(--color-borde)",
                  }}
                >
                  <th style={{ padding: "12px" }}>
                    Evento
                  </th>
                  <th style={{ padding: "12px" }}>
                    Usuario
                  </th>
                  <th style={{ padding: "12px" }}>
                    Descripción
                  </th>
                  <th style={{ padding: "12px" }}>
                    Fecha y hora
                  </th>
                </tr>
              </thead>

              <tbody>
                {registros.map((registro) => (
                  <tr
                    key={registro.id}
                    style={{
                      borderBottom:
                        "1px solid var(--color-borde)",
                    }}
                  >
                    <td style={{ padding: "12px" }}>
                      <strong>
                        {registro.tipo.replaceAll(
                          "_",
                          " "
                        )}
                      </strong>
                    </td>

                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <UserRound size={16} />

                        {registro.usuarioNombre ??
                          "No identificado"}
                      </span>
                    </td>

                    <td style={{ padding: "12px" }}>
                      {registro.descripcion}
                    </td>

                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <CalendarDays size={16} />

                        {new Intl.DateTimeFormat(
                          "es-BO",
                          {
                            timeZone:
                              "America/La_Paz",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          }
                        ).format(registro.fecha)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default function PaginaAuditoria({ searchParams }: { searchParams: Promise<ParametrosListado> }) {
  return (
    <Suspense fallback={<CargandoDashboard />}>
      <ContenidoAuditoria searchParams={searchParams} />
    </Suspense>
  );
}
