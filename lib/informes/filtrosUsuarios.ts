
import type { Prisma } from "@/app/generated/prisma/client";
import type { RolUsuario } from "@/lib/sesion";
import { DESPLAZAMIENTO_HORARIO } from "@/lib/informes/formato";

/* ==========================================
   FILTROS DEL INFORME DE USUARIOS
   Los filtros viajan en la URL (?rol=&estado=...).
   Todo valor que llega del navegador se valida
   aquí antes de usarse en una consulta.
========================================== */

export type FiltroRol = RolUsuario | "TODOS";
export type FiltroEstado = "todos" | "activos" | "inactivos";

export type FiltrosUsuarios = {
  rol: FiltroRol;
  estado: FiltroEstado;
  desde: string; // "AAAA-MM-DD" o ""
  hasta: string; // "AAAA-MM-DD" o ""
  busqueda: string;
  pagina: number;
};

type ParametrosUrl = Record<string, string | string[] | undefined>;

export const OPCIONES_ROL: { valor: FiltroRol; texto: string }[] = [
  { valor: "TODOS", texto: "Todos los roles" },
  { valor: "ADMINISTRADOR", texto: "Administradores" },
  { valor: "DOCENTE", texto: "Docentes" },
  { valor: "ESTUDIANTE", texto: "Estudiantes" },
];

export const OPCIONES_ESTADO: { valor: FiltroEstado; texto: string }[] = [
  { valor: "todos", texto: "Todos los estados" },
  { valor: "activos", texto: "Solo activos" },
  { valor: "inactivos", texto: "Solo inactivos" },
];

const LARGO_MAXIMO_BUSQUEDA = 60;

function leerTexto(parametros: ParametrosUrl, clave: string): string {
  const valor = parametros[clave];
  return (Array.isArray(valor) ? valor[0] : valor ?? "").trim();
}

function esFechaValida(texto: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    return false;
  }

  const fecha = new Date(`${texto}T00:00:00Z`);

  // Descarta fechas imposibles como 2026-02-31
  return (
    !Number.isNaN(fecha.getTime()) &&
    fecha.toISOString().slice(0, 10) === texto
  );
}

/* ==========================================
   LECTURA Y VALIDACIÓN
========================================== */

export function leerFiltrosUsuarios(parametros: ParametrosUrl): {
  filtros: FiltrosUsuarios;
  errores: string[];
} {
  const errores: string[] = [];

  const rolTexto = leerTexto(parametros, "rol").toUpperCase();
  const rol = OPCIONES_ROL.some((opcion) => opcion.valor === rolTexto)
    ? (rolTexto as FiltroRol)
    : "TODOS";

  const estadoTexto = leerTexto(parametros, "estado").toLowerCase();
  const estado = OPCIONES_ESTADO.some(
    (opcion) => opcion.valor === estadoTexto
  )
    ? (estadoTexto as FiltroEstado)
    : "todos";

  let desde = leerTexto(parametros, "desde");
  let hasta = leerTexto(parametros, "hasta");

  if (desde && !esFechaValida(desde)) {
    errores.push("La fecha «desde» no es válida y se ignoró.");
    desde = "";
  }

  if (hasta && !esFechaValida(hasta)) {
    errores.push("La fecha «hasta» no es válida y se ignoró.");
    hasta = "";
  }

  if (desde && hasta && desde > hasta) {
    errores.push(
      "La fecha «desde» era posterior a «hasta»; se intercambiaron."
    );
    [desde, hasta] = [hasta, desde];
  }

  const busqueda = leerTexto(parametros, "busqueda").slice(
    0,
    LARGO_MAXIMO_BUSQUEDA
  );

  const paginaNumero = Number.parseInt(leerTexto(parametros, "pagina"), 10);
  const pagina =
    Number.isSafeInteger(paginaNumero) && paginaNumero > 0
      ? paginaNumero
      : 1;

  return {
    filtros: { rol, estado, desde, hasta, busqueda, pagina },
    errores,
  };
}

/* ==========================================
   CONDICIÓN PARA PRISMA
========================================== */

export function construirCondicionUsuarios(
  filtros: FiltrosUsuarios
): Prisma.UsuarioWhereInput {
  const condicion: Prisma.UsuarioWhereInput = {};

  if (filtros.rol !== "TODOS") {
    condicion.rol = filtros.rol;
  }

  if (filtros.estado !== "todos") {
    condicion.activo = filtros.estado === "activos";
  }

  // Las fechas se interpretan en la hora de Bolivia
  if (filtros.desde || filtros.hasta) {
    const rango: Prisma.DateTimeFilter<"Usuario"> = {};

    if (filtros.desde) {
      rango.gte = new Date(
        `${filtros.desde}T00:00:00${DESPLAZAMIENTO_HORARIO}`
      );
    }

    if (filtros.hasta) {
      rango.lte = new Date(
        `${filtros.hasta}T23:59:59.999${DESPLAZAMIENTO_HORARIO}`
      );
    }

    condicion.creadoEn = rango;
  }

  if (filtros.busqueda) {
    condicion.OR = [
      { nombre: { contains: filtros.busqueda, mode: "insensitive" } },
      { usuario: { contains: filtros.busqueda, mode: "insensitive" } },
    ];
  }

  return condicion;
}

/* ==========================================
   URL Y DESCRIPCIÓN DE LOS FILTROS
========================================== */

// Solo incluye en la URL los filtros que no son el valor por defecto
export function filtrosAParametros(
  filtros: FiltrosUsuarios,
  extra: Record<string, string> = {}
): string {
  const parametros = new URLSearchParams();

  if (filtros.rol !== "TODOS") parametros.set("rol", filtros.rol);
  if (filtros.estado !== "todos") parametros.set("estado", filtros.estado);
  if (filtros.desde) parametros.set("desde", filtros.desde);
  if (filtros.hasta) parametros.set("hasta", filtros.hasta);
  if (filtros.busqueda) parametros.set("busqueda", filtros.busqueda);

  for (const [clave, valor] of Object.entries(extra)) {
    parametros.set(clave, valor);
  }

  return parametros.toString();
}

function invertirFecha(texto: string): string {
  const [anio, mes, dia] = texto.split("-");
  return `${dia}/${mes}/${anio}`;
}

export function describirFiltrosUsuarios(
  filtros: FiltrosUsuarios
): { etiqueta: string; valor: string }[] {
  const textoRol =
    OPCIONES_ROL.find((opcion) => opcion.valor === filtros.rol)?.texto ??
    "Todos los roles";

  const textoEstado =
    OPCIONES_ESTADO.find((opcion) => opcion.valor === filtros.estado)
      ?.texto ?? "Todos los estados";

  let periodo = "Todo el historial";

  if (filtros.desde && filtros.hasta) {
    periodo = `Del ${invertirFecha(filtros.desde)} al ${invertirFecha(
      filtros.hasta
    )}`;
  } else if (filtros.desde) {
    periodo = `Desde el ${invertirFecha(filtros.desde)}`;
  } else if (filtros.hasta) {
    periodo = `Hasta el ${invertirFecha(filtros.hasta)}`;
  }

  return [
    { etiqueta: "Rol", valor: textoRol },
    { etiqueta: "Estado", valor: textoEstado },
    { etiqueta: "Fecha de registro", valor: periodo },
    {
      etiqueta: "Búsqueda",
      valor: filtros.busqueda ? `"${filtros.busqueda}"` : "Sin búsqueda",
    },
  ];
}
