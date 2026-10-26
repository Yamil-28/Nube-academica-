
export default function PiePagina() {
  return (
    <footer className="bg-[var(--color-primario)] text-white">
      <div className="contenedor flex min-h-20 flex-wrap items-center justify-between gap-4 py-4">
        <div>
          <p className="font-bold">SISCloud</p>
          <p className="text-xs text-blue-100">
            Sistema de Gestión de Proyectos Académicos
          </p>
        </div>

        <div className="text-xs text-blue-100 md:text-right">
          <p>Escuela Militar de Ingeniería</p>
          <p>Ingeniería de Sistemas · Unidad Académica La Paz</p>
        </div>
      </div>
    </footer>
  );
}
