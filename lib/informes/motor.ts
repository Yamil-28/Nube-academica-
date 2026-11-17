
import type { RolUsuario } from "@/lib/sesion";
import type { TablaExportable } from "@/lib/informes/exportadores";

/* ==========================================
   MOTOR GENÉRICO DE REPORTES
   Cada reporte declara sus filtros y cómo generar
   su tabla. La página, la vista previa, la
   exportación (PDF/Excel/CSV), la seguridad por rol
   y el historial son comunes a todos.
========================================== */

export type UsuarioReporte = {
  id: number;
  nombre: string;
  rol: RolUsuario;
};

export type OpcionFiltro = { valor: string; texto: string };

export type FiltroReporte = {
  clave: string;
  etiqueta: string;
  textoTodos: string;
  opciones: (usuario: UsuarioReporte) => Promise<OpcionFiltro[]> | OpcionFiltro[];
};

export type ResultadoReporte = {
  tabla: TablaExportable;
  resumen: { etiqueta: string; valor: string }[];
};

export type DefinicionReporteDatos = {
  id: string;
  titulo: string;
  descripcion: string;
  nombreArchivo: string;
  roles: RolUsuario[];
  filtros: FiltroReporte[];
  generar: (contexto: {
    usuario: UsuarioReporte;
    filtros: Record<string, string>;
    limite: number;
  }) => Promise<ResultadoReporte>;
};

export const LIMITE_VISTA_PREVIA = 200;
export const LIMITE_EXPORTACION = 5000;

type ParametrosUrl = Record<string, string | string[] | undefined>;

/* ==========================================
   LECTURA SEGURA DE FILTROS
   Solo se aceptan valores que existen entre las
   opciones del filtro; cualquier otro se ignora.
========================================== */

export async function leerFiltros(
  definicion: DefinicionReporteDatos,
  parametros: ParametrosUrl,
  usuario: UsuarioReporte
) {
  const valores: Record<string, string> = {};
  const opciones: Record<string, OpcionFiltro[]> = {};

  for (const filtro of definicion.filtros) {
    const lista = await filtro.opciones(usuario);
    opciones[filtro.clave] = lista;

    const bruto = parametros[filtro.clave];
    const valor = (Array.isArray(bruto) ? bruto[0] : bruto ?? "").trim();

    valores[filtro.clave] = lista.some((opcion) => opcion.valor === valor) ? valor : "";
  }

  return { valores, opciones };
}

export function describirFiltros(
  definicion: DefinicionReporteDatos,
  valores: Record<string, string>,
  opciones: Record<string, OpcionFiltro[]>
) {
  return definicion.filtros.map((filtro) => ({
    etiqueta: filtro.etiqueta,
    valor:
      opciones[filtro.clave]?.find((o) => o.valor === valores[filtro.clave])?.texto ??
      filtro.textoTodos,
  }));
}

export function valoresAParametros(
  valores: Record<string, string>,
  extra: Record<string, string> = {}
) {
  const parametros = new URLSearchParams();

  for (const [clave, valor] of Object.entries({ ...valores, ...extra })) {
    if (valor) parametros.set(clave, valor);
  }

  return parametros.toString();
}

// Número entero positivo a partir del valor de un filtro (o undefined)
export function idFiltro(valor: string | undefined) {
  const numero = Number.parseInt(valor ?? "", 10);
  return Number.isSafeInteger(numero) && numero > 0 ? numero : undefined;
}
