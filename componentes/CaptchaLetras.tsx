
"use client";

import estilos from "./CaptchaLetras.module.css";

type Propiedades = {
  codigo: string;
  establecerCodigo: (valor: string) => void;
  version: number;
  actualizar: () => void;
};

export default function CaptchaLetras({
  codigo,
  establecerCodigo,
  version,
  actualizar,
}: Propiedades) {
  return (
    <div className={estilos.captcha}>
      <div className={estilos.cabecera}>
        <span>Verificación de seguridad</span>
        <span className={estilos.indicador}>
          CAPTCHA
        </span>
      </div>

      <p>
        Escribe las letras y números que aparecen en la imagen.
      </p>

      <div className={estilos.fila}>
        <div className={estilos.imagen}>
          <img
            src={`/api/captcha?version=${version}`}
            alt="Código de verificación de cinco caracteres"
            width={240}
            height={75}
          />
        </div>

        <button
          type="button"
          className={estilos.actualizar}
          onClick={actualizar}
          title="Generar otro código"
          aria-label="Generar otro CAPTCHA"
        >
          ↻
        </button>
      </div>

      <input
        type="text"
        value={codigo}
        onChange={(evento) =>
          establecerCodigo(
            evento.target.value
              .toUpperCase()
              .replace(/[^A-Z0-9]/g, "")
              .slice(0, 5)
          )
        }
        placeholder="Escribe el código"
        maxLength={5}
        autoComplete="off"
        spellCheck={false}
        required
        aria-label="Código CAPTCHA"
      />
    </div>
  );
}
