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

  const asignacion = await prisma.asignacionDocente.findFirst({
    where: { idDocente: docente.id, materia: { activa: true }, periodo: { vigente: true, activo: true } },
    include: { periodo: true },
  });
  if (!asignacion) throw new Error("Se requiere una asignación docente vigente para la demo");
  const proyecto = await prisma.$transaction(async (tx) => {
    let p = await tx.proyecto.findFirst({ where: { titulo: "Proyecto demo", creadoPorId: estudiante.id, docenteId: docente.id } });
    if (!p) p = await tx.proyecto.create({
      data: { titulo: "Proyecto demo", descripcion: "Demostración de almacenamiento", docenteId: docente.id,
        creadoPorId: estudiante.id, materiaId: asignacion.idMateria, idPeriodo: asignacion.idPeriodo,
        gestion: asignacion.periodo.gestion, semestre: asignacion.periodo.semestre === "II" ? 2 : 1 },
    });
    const equipo = await tx.equipo.upsert({
      where: { proyectoId: p.id }, update: {},
      create: { proyectoId: p.id, nombre: "Equipo demo", creadoPorId: estudiante.id },
    });
    await tx.miembroEquipo.upsert({
      where: { equipoId_usuarioId: { equipoId: equipo.id, usuarioId: estudiante.id } },
      update: {}, create: { equipoId: equipo.id, usuarioId: estudiante.id, rolEquipo: "LIDER" },
    });
    return p;
  });

  console.log(`✔ Proyecto demo (id ${proyecto.id}) listo.`);
  console.log(`  Docente responsable : ${docente.usuario}`);
  console.log(`  Miembro             : ${estudiante.usuario}`);
  console.log(`  Sin acceso (prueba) : estudiante2`);
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());