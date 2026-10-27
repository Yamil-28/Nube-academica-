
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function crearPrisma() {
  const conexion = process.env.DATABASE_URL;

  if (!conexion) {
    throw new Error("No se encontró DATABASE_URL en .env.local");
  }

  const adaptador = new PrismaPg({
    connectionString: conexion,
  });

  return new PrismaClient({
    adapter: adaptador,
  });
}

export const prisma =
  globalPrisma.prisma ?? crearPrisma();

if (process.env.NODE_ENV !== "production") {
  globalPrisma.prisma = prisma;
}
