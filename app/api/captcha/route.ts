
import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { randomInt } from "node:crypto";

const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generarCodigo() {
  return Array.from(
    { length: 5 },
    () => caracteres[randomInt(caracteres.length)]
  ).join("");
}

function crearImagen(codigo: string) {
  const letras = codigo.split("");

  const textos = letras.map((letra, indice) => {
    const x = 28 + indice * 40;
    const y = 47 + randomInt(-5, 6);
    const giro = randomInt(-12, 13);

    return `
      <text
        x="${x}"
        y="${y}"
        font-family="monospace"
        font-size="32"
        font-weight="bold"
        fill="#073b70"
        transform="rotate(${giro} ${x} ${y})"
      >${letra}</text>
    `;
  }).join("");

  const lineas = Array.from({ length: 5 }, () => {
    return `
      <line
        x1="${randomInt(240)}"
        y1="${randomInt(75)}"
        x2="${randomInt(240)}"
        y2="${randomInt(75)}"
        stroke="#8db3d6"
        stroke-width="1"
      />
    `;
  }).join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg"
         width="240" height="75" viewBox="0 0 240 75">
      <rect width="240" height="75" rx="10" fill="#edf5ff"/>
      ${lineas}
      ${textos}
    </svg>
  `;
}

export async function GET() {
  const secreto = process.env.CLAVE_SECRETA_CAPTCHA;

  if (!secreto || secreto.length < 32) {
    return NextResponse.json(
      { mensaje: "Falta configurar la clave del CAPTCHA." },
      { status: 500 }
    );
  }

  const codigo = generarCodigo();

  const token = await new SignJWT({ codigo })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(new TextEncoder().encode(secreto));

  const respuesta = new NextResponse(crearImagen(codigo), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });

  respuesta.cookies.set("captcha_siscloud", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 300,
  });

  return respuesta;
}
