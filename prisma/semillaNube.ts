// Crea los datos de DEMO para probar la Nube Académica (se puede ejecutar varias veces).
// Uso:  npx tsx prisma/semillaNube.ts
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient, Rol } from "../app/generated/prisma/client";

config({ path: ".env.local" });
const conexion = process.env.DATABASE_URL;
if (!conexion) throw new Error("No se encontró DATABASE_URL en .env.local");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: conexion }) });

async function main() {
  // Segundo estudiante, que NO será miembro del proyecto (sirve para probar el acceso denegado)
  await prisma.usuario.upsert({
    where: { usuario: "estudiante2" },
    update: {},
    create: {
      usuario: "estudiante2", nombre: "Estudiante Dos", rol: Rol.ESTUDIANTE, activo: true,
      contrasena: await bcrypt.hash("Estudiante123", 12),
    },
  });

  const docente = await prisma.usuario.findUnique({ where: { usuario: "docente" } });
  const estudiante = await prisma.usuario.findUnique({ where: { usuario: "estudiante" } });
  if (!docente || !estudiante) throw new Error("Primero ejecuta: npx tsx prisma/crearUsuarios.ts");

  let proyecto = await prisma.proyecto.findFirst({ where: { titulo: "Proyecto demo" } });
  if (!proyecto) {
    proyecto = await prisma.proyecto.create({
      data: { titulo: "Proyecto demo", docenteId: docente.id, creadorId: estudiante.id },
    });
  }
  await prisma.miembroProyecto.upsert({
    where: { proyectoId_usuarioId: { proyectoId: proyecto.id, usuarioId: estudiante.id } },
    update: {},
    create: { proyectoId: proyecto.id, usuarioId: estudiante.id, rolEquipo: "Líder" },
  });

  console.log(`✔ Proyecto demo (id ${proyecto.id}) listo.`);
  console.log(`  Docente responsable : ${docente.usuario}`);
  console.log(`  Miembro             : ${estudiante.usuario}`);
  console.log(`  Sin acceso (prueba) : estudiante2`);
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
