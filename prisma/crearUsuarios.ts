
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Rol } from "../app/generated/prisma/client";
import bcrypt from "bcryptjs";

config({ path: ".env.local" });

const conexion = process.env.DATABASE_URL;

if (!conexion) {
  throw new Error("No se encontró DATABASE_URL en .env.local");
}

const adaptador = new PrismaPg({
  connectionString: conexion,
});

const prisma = new PrismaClient({
  adapter: adaptador,
});

async function crearUsuarios() {
  const usuarios = [
    {
      usuario: "admin",
      nombre: "Administrador SISCloud",
      contrasena: "Admin123",
      rol: Rol.ADMINISTRADOR,
    },
    {
      usuario: "docente",
      nombre: "Docente SISCloud",
      contrasena: "Docente123",
      rol: Rol.DOCENTE,
    },
    {
      usuario: "estudiante",
      nombre: "Estudiante SISCloud",
      contrasena: "Estudiante123",
      rol: Rol.ESTUDIANTE,
    },
  ];

  for (const datos of usuarios) {
    const contrasenaCifrada = await bcrypt.hash(
      datos.contrasena,
      12
    );

    await prisma.usuario.upsert({
      where: {
        usuario: datos.usuario,
      },
      update: {
        nombre: datos.nombre,
        contrasena: contrasenaCifrada,
        rol: datos.rol,
        activo: true,
      },
      create: {
        usuario: datos.usuario,
        nombre: datos.nombre,
        contrasena: contrasenaCifrada,
        rol: datos.rol,
        activo: true,
      },
    });

    console.log(
      `Usuario ${datos.usuario} creado o actualizado correctamente.`
    );
  }
}

crearUsuarios()
  .then(() => {
    console.log("Los tres usuarios están registrados en Neon.");
  })
  .catch((error) => {
    console.error("Error al crear usuarios:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
