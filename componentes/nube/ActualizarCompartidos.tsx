"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ActualizarCompartidos() {
  const router = useRouter();
  useEffect(() => {
    const actualizar = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const intervalo = window.setInterval(actualizar, 15000);
    window.addEventListener("focus", actualizar);
    return () => {
      window.clearInterval(intervalo);
      window.removeEventListener("focus", actualizar);
    };
  }, [router]);

  return null;
}
