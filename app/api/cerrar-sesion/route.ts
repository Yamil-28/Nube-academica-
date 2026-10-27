
import { NextResponse } from "next/server";
import { cerrarSesion } from "@/lib/sesion";

export async function POST() {
  try {
    await cerrarSesion();

    return NextResponse.json({
      correcto: true,
      mensaje: "Sesión cerrada correctamente.",
    });
  } catch (error) {
    console.error("Error al cerrar sesión:", error);

    return NextResponse.json(
      {
        correcto: false,
        mensaje: "No se pudo cerrar la sesión.",
      },
      { status: 500 }
    );
  }
}
