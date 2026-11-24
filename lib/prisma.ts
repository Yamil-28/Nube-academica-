
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

  const url = new URL(conexion);
  if (url.hostname.endsWith(".neon.tech") && url.searchParams.get("sslmode") === "require" && !url.searchParams.has("uselibpqcompat")) {
    url.searchParams.set("sslmode", "verify-full");
  }

  const adaptador = new PrismaPg({
    connectionString: url.href,
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
