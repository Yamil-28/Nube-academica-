"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Camera } from "lucide-react";
import { useRouter } from "next/navigation";

import { MAX_FOTO_PERFIL, TIPOS_FOTO_PERFIL } from "@/lib/fotoPerfil";
import AvatarPerfil from "./AvatarPerfil";
import estilos from "./PerfilUsuario.module.css";

export default function FormularioFotoPerfil({ revision }: { revision?: string }) {
  const entrada = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [guardando, setGuardando] = useState(false);
  const [estado, setEstado] = useState<{ mensaje: string; error: boolean } | null>(null);

  async function subir(evento: ChangeEvent<HTMLInputElement>) {
    const archivo = evento.currentTarget.files?.[0];
    evento.currentTarget.value = "";
    if (!archivo || guardando) return;

    if (!TIPOS_FOTO_PERFIL.some((tipo) => tipo === archivo.type)) {
      setEstado({ mensaje: "Selecciona una imagen JPG, PNG o WebP.", error: true });
      return;
    }
    if (archivo.size > MAX_FOTO_PERFIL) {
      setEstado({ mensaje: "La foto debe pesar como máximo 2 MB.", error: true });
      return;
    }

    setGuardando(true);
    setEstado(null);
    try {
      const respuesta = await fetch("/api/perfil/foto", {
        method: "PUT",
        headers: { "Content-Type": archivo.type },
        body: archivo,
      });
      if (!respuesta.ok) {
        const resultado = await respuesta.json().catch(() => null);
        throw new Error(resultado?.mensaje ?? "La foto no pudo guardarse.");
      }
      setEstado({ mensaje: "Foto de perfil actualizada.", error: false });
      router.refresh();
    } catch (error) {
      setEstado({ mensaje: error instanceof Error ? error.message : "No se pudo guardar la foto.", error: true });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className={estilos.fotoPerfil} id="foto-de-perfil">
      <div className={estilos.avatar}>
        <AvatarPerfil revision={revision} ancho={76} icono={34} />
      </div>
      <input ref={entrada} type="file" accept={TIPOS_FOTO_PERFIL.join(",")} onChange={subir} hidden />
      <button
        type="button"
        className={estilos.botonFoto}
        onClick={() => entrada.current?.click()}
        disabled={guardando}
      >
        <Camera size={16} aria-hidden="true" />
        {guardando ? "Guardando…" : revision ? "Cambiar foto" : "Subir foto"}
      </button>
      <small>JPG, PNG o WebP · Hasta 2 MB</small>
      {estado && (
        <small role={estado.error ? "alert" : "status"} className={estado.error ? estilos.errorFoto : undefined}>
          {estado.mensaje}
        </small>
      )}
    </div>
  );
}
