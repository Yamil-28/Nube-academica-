
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Tema = "claro" | "oscuro";

type ContextoTema = {
  tema: Tema;
  cambiarTema: (nuevoTema: Tema) => void;
};

const ContextoTema = createContext<ContextoTema | null>(null);

type Propiedades = {
  children: ReactNode;
};

export default function ProveedorTema({
  children,
}: Propiedades) {
  const [tema, establecerTema] = useState<Tema>("claro");

  useEffect(() => {
    try {
      const temaGuardado = localStorage.getItem("siscloud-tema");

      if (temaGuardado === "claro" || temaGuardado === "oscuro") {
        establecerTema(temaGuardado);
        document.documentElement.dataset.tema = temaGuardado;
      } else {
        document.documentElement.dataset.tema = "claro";
      }
    } catch {
      document.documentElement.dataset.tema = "claro";
    }
  }, []);

  function cambiarTema(nuevoTema: Tema) {
    establecerTema(nuevoTema);

    document.documentElement.dataset.tema = nuevoTema;

    try {
      localStorage.setItem("siscloud-tema", nuevoTema);
    } catch {
      // El tema seguirá funcionando durante la sesión actual.
    }
  }

  return (
    <ContextoTema.Provider value={{ tema, cambiarTema }}>
      {children}
    </ContextoTema.Provider>
  );
}

export function usarTema() {
  const contexto = useContext(ContextoTema);

  if (!contexto) {
    throw new Error(
      "usarTema debe utilizarse dentro de ProveedorTema."
    );
  }

  return contexto;
}
