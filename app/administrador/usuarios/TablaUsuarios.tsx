
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Pencil,
  FilterX,
  Users,
} from "lucide-react";

import estilos from "./page.module.css";

type Rol = "ADMINISTRADOR" | "DOCENTE" | "ESTUDIANTE";

type Usuario = {
  id: number;
  nombre: string;
  usuario: string;
  rol: Rol;
  activo: boolean;
  creadoEn: string;
};

type Propiedades = {
  usuarios: Usuario[];
};

const nombresRoles: Record<Rol, string> = {
  ADMINISTRADOR: "Administrador",
  DOCENTE: "Docente",
  ESTUDIANTE: "Estudiante",
};

export default function TablaUsuarios({
  usuarios,
}: Propiedades) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("TODOS");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");

  const usuariosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase("es");

    return usuarios.filter((cuenta) => {
      const coincideBusqueda =
        cuenta.nombre.toLocaleLowerCase("es").includes(texto) ||
        cuenta.usuario.toLocaleLowerCase("es").includes(texto);

      const coincideRol =
        filtroRol === "TODOS" || cuenta.rol === filtroRol;

      const coincideEstado =
        filtroEstado === "TODOS" ||
        (filtroEstado === "ACTIVOS" && cuenta.activo) ||
        (filtroEstado === "INACTIVOS" && !cuenta.activo);

      return coincideBusqueda && coincideRol && coincideEstado;
    });
  }, [usuarios, busqueda, filtroRol, filtroEstado]);

  function limpiarFiltros() {
    setBusqueda("");
    setFiltroRol("TODOS");
    setFiltroEstado("TODOS");
  }

  return (
    <section className={estilos.panel}>
      <div className={estilos.panelEncabezado}>
        <div>
          <h2>Usuarios registrados</h2>
          <p>Consulta y administra las cuentas del sistema</p>
        </div>

        <Users size={21} />
      </div>

      {/* Búsqueda y filtros */}
      <div className={estilos.contenedorFiltros}>
        <div className={estilos.campoBusqueda}>
          <Search size={19} />

          <input
            type="search"
            placeholder="Buscar por nombre o usuario..."
            aria-label="Buscar usuarios"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <select
          aria-label="Filtrar por rol"
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
          className={estilos.selectorFiltro}
        >
          <option value="TODOS">Todos los roles</option>
          <option value="ADMINISTRADOR">Administrador</option>
          <option value="DOCENTE">Docente</option>
          <option value="ESTUDIANTE">Estudiante</option>
        </select>

        <select
          aria-label="Filtrar por estado"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className={estilos.selectorFiltro}
        >
          <option value="TODOS">Todos los estados</option>
          <option value="ACTIVOS">Activos</option>
          <option value="INACTIVOS">Inactivos</option>
        </select>

        <button
          type="button"
          onClick={limpiarFiltros}
          className={estilos.botonLimpiar}
        >
          <FilterX size={17} />
          Limpiar
        </button>
      </div>

      <div className={estilos.resultadosFiltro} role="status">
        Mostrando <strong>{usuariosFiltrados.length}</strong> de{" "}
        <strong>{usuarios.length}</strong> usuarios
      </div>

      {/* Tabla */}
      <div className={estilos.tablaContenedor}>
        <table className={estilos.tabla}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {usuariosFiltrados.map((cuenta) => (
              <tr key={cuenta.id}>
                <td>
                  <div className={estilos.usuarioNombre}>
                    <span className={estilos.avatar}>
                      {cuenta.nombre.charAt(0).toUpperCase()}
                    </span>
                    <strong>{cuenta.nombre}</strong>
                  </div>
                </td>

                <td>@{cuenta.usuario}</td>

                <td>{nombresRoles[cuenta.rol]}</td>

                <td>
                  <span
                    className={`${estilos.estado} ${
                      cuenta.activo
                        ? estilos.activo
                        : estilos.inactivo
                    }`}
                  >
                    {cuenta.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>

                <td>
                  {cuenta.creadoEn}
                </td>

                <td>
                  <Link
                    href={`/administrador/usuarios/${cuenta.id}/editar`}
                    className={estilos.botonEditar}
                    aria-label={`Editar usuario ${cuenta.nombre}`}
                  >
                    <Pencil size={15} />
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {usuariosFiltrados.length === 0 && (
          <div className={estilos.sinResultados}>
            <Search size={30} />
            <h3>No se encontraron usuarios</h3>
            <p>Prueba con otros criterios de búsqueda.</p>

            <button type="button" onClick={limpiarFiltros}>
              Mostrar todos los usuarios
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
