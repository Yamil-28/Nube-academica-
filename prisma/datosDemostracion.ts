import { config } from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  type EstadoHito,
  type EstadoProyecto,
  type EstadoRevision,
  type Semestre,
} from "../app/generated/prisma/client";

/* ==========================================
   DATOS DE DEMOSTRACIÓN - SISCLOUD
   Carga periodos, materias (Figura 6), asignaciones
   y proyectos de ejemplo para demostrar Gestión
   académica e Informes y reportes.

   Ejecutar DESPUÉS de crearUsuarios.ts:
     npx tsx prisma/datosDemostracion.ts

   ⚠ Solo para una base de datos PROPIA de pruebas,
   nunca para la base compartida del equipo.
   Se puede ejecutar varias veces sin duplicar datos.
========================================== */

config({ path: ".env.local" });

const conexion = process.env.DATABASE_URL;
if (!conexion) throw new Error("No se encontró DATABASE_URL en .env.local");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: conexion }),
});

const CONTRASENA_DEMO = "Demo1234";

function fecha(texto: string) {
  return new Date(`${texto}T09:00:00-04:00`);
}

/* ==========================================
   USUARIOS ADICIONALES
========================================== */

const docentesDemo = [
  { usuario: "mrojas", nombre: "Marcelo Rojas" },
  { usuario: "lquispe", nombre: "Lucía Quispe" },
];

const estudiantesDemo = [
  { usuario: "aflores", nombre: "Ana Flores" },
  { usuario: "jmamani", nombre: "Juan Mamani" },
  { usuario: "cvargas", nombre: "Carla Vargas" },
  { usuario: "rcondori", nombre: "Rodrigo Condori" },
  { usuario: "dpacheco", nombre: "Daniela Pacheco" },
  { usuario: "lgutierrez", nombre: "Luis Gutiérrez" },
];

/* ==========================================
   MATERIAS (Figura 6 del documento)
========================================== */

const materias = [
  "Sistemas de Información II",
  "Redes Avanzadas",
  "Ingeniería de Sistemas II",
  "Big Data",
  "Desarrollo de Aplicaciones Móviles",
];

/* ==========================================
   ASIGNACIONES: [docente, materia, gestión, semestre]
========================================== */

const asignaciones: [string, string, number, Semestre][] = [
  ["docente", "Sistemas de Información II", 2026, "II"],
  ["docente", "Ingeniería de Sistemas II", 2026, "II"],
  ["mrojas", "Redes Avanzadas", 2026, "II"],
  ["mrojas", "Big Data", 2026, "II"],
  ["lquispe", "Desarrollo de Aplicaciones Móviles", 2026, "II"],
  ["docente", "Big Data", 2026, "I"],
];

/* ==========================================
   PROYECTOS DE EJEMPLO
========================================== */

type ProyectoDemo = {
  titulo: string;
  descripcion: string;
  materia: string;
  semestre: Semestre;
  docente: string;
  estado: EstadoProyecto;
  inicio: string;
  fin?: string;
  miembros: [string, string][]; // [usuario, rol en el equipo]
  hitos: [string, string, EstadoHito][]; // [título, fecha límite, estado]
  avances: {
    titulo: string;
    hito?: string;
    autor: string;
    fecha: string;
    revision: EstadoRevision;
    calificacion?: number;
    retro?: string;
  }[];
};

const proyectos: ProyectoDemo[] = [
  {
    titulo: "Plataforma de gestión académica en la nube",
    descripcion: "Sistema web para centralizar proyectos, archivos y seguimiento académico.",
    materia: "Sistemas de Información II",
    semestre: "II",
    docente: "docente",
    estado: "EN_DESARROLLO",
    inicio: "2026-08-10",
    miembros: [["estudiante", "líder"], ["aflores", "integrante"]],
    hitos: [
      ["Levantamiento de requisitos", "2026-09-05", "COMPLETADO"],
      ["Diseño de base de datos", "2026-10-10", "EN_PROGRESO"],
      ["Prototipo funcional", "2026-11-20", "PENDIENTE"],
    ],
    avances: [
      { titulo: "Documento de requisitos", hito: "Levantamiento de requisitos", autor: "estudiante", fecha: "2026-09-03", revision: "APROBADO", calificacion: 90, retro: "Requisitos claros y bien priorizados." },
      { titulo: "Primer borrador del modelo ER", hito: "Diseño de base de datos", autor: "aflores", fecha: "2026-10-08", revision: "PENDIENTE" },
    ],
  },
  {
    titulo: "Sistema de inventario para laboratorios",
    descripcion: "Control de equipos y préstamos de los laboratorios de la Carrera.",
    materia: "Sistemas de Información II",
    semestre: "II",
    docente: "docente",
    estado: "EN_REVISION",
    inicio: "2026-08-12",
    miembros: [["jmamani", "líder"], ["cvargas", "integrante"]],
    hitos: [
      ["Análisis del proceso actual", "2026-09-01", "COMPLETADO"],
      ["Desarrollo del módulo de préstamos", "2026-10-15", "COMPLETADO"],
      ["Pruebas con usuarios", "2026-11-15", "EN_PROGRESO"],
    ],
    avances: [
      { titulo: "Diagrama de procesos AS-IS", hito: "Análisis del proceso actual", autor: "jmamani", fecha: "2026-08-30", revision: "APROBADO", calificacion: 85 },
      { titulo: "Módulo de préstamos v1", hito: "Desarrollo del módulo de préstamos", autor: "cvargas", fecha: "2026-10-14", revision: "OBSERVADO", calificacion: 70, retro: "Falta validar fechas de devolución." },
      { titulo: "Módulo de préstamos v2", hito: "Desarrollo del módulo de préstamos", autor: "cvargas", fecha: "2026-10-25", revision: "APROBADO", calificacion: 88 },
    ],
  },
  {
    titulo: "Análisis de requerimientos para biblioteca digital",
    descripcion: "Estudio de factibilidad y requerimientos para la biblioteca digital EMI.",
    materia: "Ingeniería de Sistemas II",
    semestre: "II",
    docente: "docente",
    estado: "REGISTRADO",
    inicio: "2026-10-01",
    miembros: [["rcondori", "líder"], ["dpacheco", "integrante"]],
    hitos: [
      ["Entrevistas a usuarios", "2026-11-25", "PENDIENTE"],
      ["Especificación de requisitos", "2026-12-10", "PENDIENTE"],
    ],
    avances: [],
  },
  {
    titulo: "Monitoreo de red del campus con SNMP",
    descripcion: "Monitoreo del estado de los equipos de red del campus.",
    materia: "Redes Avanzadas",
    semestre: "II",
    docente: "mrojas",
    estado: "EN_DESARROLLO",
    inicio: "2026-08-15",
    miembros: [["lgutierrez", "líder"], ["estudiante", "integrante"]],
    hitos: [
      ["Inventario de dispositivos", "2026-09-10", "COMPLETADO"],
      ["Configuración de agentes SNMP", "2026-10-20", "EN_PROGRESO"],
      ["Panel de monitoreo", "2026-11-30", "PENDIENTE"],
    ],
    avances: [
      { titulo: "Inventario de switches y routers", hito: "Inventario de dispositivos", autor: "lgutierrez", fecha: "2026-09-08", revision: "APROBADO", calificacion: 92 },
      { titulo: "Configuración de agentes en laboratorio", hito: "Configuración de agentes SNMP", autor: "estudiante", fecha: "2026-10-18", revision: "OBSERVADO", calificacion: 65, retro: "Documentar las comunidades SNMP usadas." },
    ],
  },
  {
    titulo: "Análisis de deserción estudiantil con Big Data",
    descripcion: "Modelo predictivo de deserción a partir de datos históricos.",
    materia: "Big Data",
    semestre: "II",
    docente: "mrojas",
    estado: "FINALIZADO",
    inicio: "2026-08-05",
    fin: "2026-11-05",
    miembros: [["aflores", "líder"], ["jmamani", "integrante"]],
    hitos: [
      ["Limpieza de datos", "2026-09-05", "COMPLETADO"],
      ["Entrenamiento del modelo", "2026-10-05", "COMPLETADO"],
      ["Informe final", "2026-11-05", "COMPLETADO"],
    ],
    avances: [
      { titulo: "Conjunto de datos depurado", hito: "Limpieza de datos", autor: "aflores", fecha: "2026-09-04", revision: "APROBADO", calificacion: 94 },
      { titulo: "Modelo de clasificación", hito: "Entrenamiento del modelo", autor: "jmamani", fecha: "2026-10-03", revision: "APROBADO", calificacion: 91 },
      { titulo: "Informe final del proyecto", hito: "Informe final", autor: "aflores", fecha: "2026-11-04", revision: "APROBADO", calificacion: 96 },
    ],
  },
  {
    titulo: "App móvil de asistencia con código QR",
    descripcion: "Registro de asistencia a clases mediante códigos QR.",
    materia: "Desarrollo de Aplicaciones Móviles",
    semestre: "II",
    docente: "lquispe",
    estado: "EN_DESARROLLO",
    inicio: "2026-08-20",
    miembros: [["cvargas", "líder"], ["rcondori", "integrante"]],
    hitos: [
      ["Diseño de interfaces", "2026-09-20", "COMPLETADO"],
      ["Lectura de códigos QR", "2026-10-30", "EN_PROGRESO"],
    ],
    avances: [
      { titulo: "Prototipo de pantallas", hito: "Diseño de interfaces", autor: "cvargas", fecha: "2026-09-18", revision: "APROBADO", calificacion: 87 },
      { titulo: "Lector QR con la cámara", hito: "Lectura de códigos QR", autor: "rcondori", fecha: "2026-10-28", revision: "PENDIENTE" },
    ],
  },
  {
    titulo: "Dashboard de indicadores académicos",
    descripcion: "Tablero con indicadores de rendimiento por materia.",
    materia: "Big Data",
    semestre: "I",
    docente: "docente",
    estado: "FINALIZADO",
    inicio: "2026-02-15",
    fin: "2026-06-20",
    miembros: [["dpacheco", "líder"], ["lgutierrez", "integrante"]],
    hitos: [
      ["Definición de indicadores", "2026-03-20", "COMPLETADO"],
      ["Tablero interactivo", "2026-06-15", "COMPLETADO"],
    ],
    avances: [
      { titulo: "Catálogo de indicadores", hito: "Definición de indicadores", autor: "dpacheco", fecha: "2026-03-18", revision: "APROBADO", calificacion: 89 },
      { titulo: "Tablero final", hito: "Tablero interactivo", autor: "lgutierrez", fecha: "2026-06-12", revision: "APROBADO", calificacion: 93 },
    ],
  },
  {
    titulo: "Chatbot de orientación estudiantil",
    descripcion: "Asistente conversacional para consultas frecuentes de estudiantes.",
    materia: "Desarrollo de Aplicaciones Móviles",
    semestre: "II",
    docente: "lquispe",
    estado: "REGISTRADO", // El esquema integrado no contempla cancelación. Ejemplo replanificado.
    inicio: "2026-08-25",
    miembros: [["jmamani", "líder"]],
    hitos: [["Prototipo conversacional", "2026-10-01", "PENDIENTE"]],
    avances: [],
  },
];

/* ==========================================
   CARGA
========================================== */

async function main() {
  // 1. Usuarios adicionales (no modifica admin, docente ni estudiante)
  const hash = await bcrypt.hash(CONTRASENA_DEMO, 12);

  for (const [lista, rol] of [
    [docentesDemo, "DOCENTE"],
    [estudiantesDemo, "ESTUDIANTE"],
  ] as const) {
    for (const datos of lista) {
      await prisma.usuario.upsert({
        where: { usuario: datos.usuario },
        update: {},
        create: { ...datos, contrasena: hash, rol, activo: true },
      });
    }
  }

  const usuarios = new Map(
    (await prisma.usuario.findMany({ select: { id: true, usuario: true } })).map(
      (u) => [u.usuario, u.id]
    )
  );

  const idUsuario = (usuario: string) => {
    const id = usuarios.get(usuario);
    if (!id) {
      throw new Error(
        `Falta el usuario "${usuario}". Ejecuta primero: npx tsx prisma/crearUsuarios.ts`
      );
    }
    return id;
  };

  // 2. Periodos académicos (II/2026 vigente)
  const periodos = new Map<string, number>();

  for (const semestre of ["I", "II"] as Semestre[]) {
    const periodo = await prisma.periodoAcademico.upsert({
      where: { gestion_semestre: { gestion: 2026, semestre } },
      update: {},
      create: { gestion: 2026, semestre },
    });
    periodos.set(semestre, periodo.id);
  }

  await prisma.periodoAcademico.updateMany({ data: { vigente: false } });
  await prisma.periodoAcademico.update({
    where: { id: periodos.get("II")! },
    data: { vigente: true, activo: true },
  });

  // 3. Materias de la Figura 6
  const idsMaterias = new Map<string, number>();

  for (const nombre of materias) {
    const materia = await prisma.materia.upsert({
      where: { nombre },
      update: {},
      create: { nombre, nivel: 6, descripcion: "Materia de la carrera" },
    });
    idsMaterias.set(nombre, materia.id);
  }

  // 4. Asignaciones docente - materia - periodo
  for (const [docente, materia, , semestre] of asignaciones) {
    const datos = {
      idDocente: idUsuario(docente),
      idMateria: idsMaterias.get(materia)!,
      idPeriodo: periodos.get(semestre)!,
    };

    await prisma.asignacionDocente.upsert({
      where: { idDocente_idMateria_idPeriodo: datos },
      update: {},
      create: datos,
    });
  }

  // 5. Proyectos con equipo, hitos y avances
  let creados = 0;

  for (const p of proyectos) {
    const existe = await prisma.proyecto.findFirst({ where: { titulo: p.titulo } });
    if (existe) continue;

    const proyecto = await prisma.proyecto.create({
      data: {
        titulo: p.titulo,
        descripcion: p.descripcion,
        materiaId: idsMaterias.get(p.materia)!,
        idPeriodo: periodos.get(p.semestre),
        docenteId: idUsuario(p.docente),
        creadoPorId: idUsuario(p.miembros[0][0]),
        gestion: 2026,
        semestre: p.semestre === "I" ? 1 : 2,
        estado: p.estado,
        fechaInicio: fecha(p.inicio),
        fechaCierre: p.fin ? fecha(p.fin) : null,
        equipo: {
          create: {
            nombre: `Equipo - ${p.titulo}`,
            creadoPorId: idUsuario(p.miembros[0][0]),
            miembros: { create: p.miembros.map(([usuario, rolEquipo]) => ({
              usuarioId: idUsuario(usuario),
              rolEquipo: rolEquipo === "líder" ? "LIDER" as const : "INTEGRANTE" as const,
            })) },
          },
        },
        hitos: {
          create: p.hitos.map(([titulo, limite, estado]) => ({
            titulo,
            fechaLimite: fecha(limite),
            estado,
          })),
        },
      },
      include: { hitos: true },
    });

    for (const a of p.avances) {
      const revisado = a.revision !== "PENDIENTE";

      await prisma.avanceProyecto.create({
        data: {
          proyectoId: proyecto.id,
          idHito: proyecto.hitos.find((h) => h.titulo === a.hito)?.id,
          autorId: idUsuario(a.autor),
          titulo: a.titulo,
          revisionEstado: a.revision,
          calificacion: a.calificacion,
          retroalimentacion: a.retro,
          idRevisor: revisado ? idUsuario(p.docente) : null,
          revisadoEn: revisado ? fecha(a.fecha) : null,
          fecha: fecha(a.fecha),
           descripcion: a.titulo,
        },
      });
    }

    creados++;
  }

  console.log("Datos de demostración cargados:");
  console.log(`  · ${docentesDemo.length + estudiantesDemo.length} usuarios adicionales (contraseña: ${CONTRASENA_DEMO})`);
  console.log(`  · 2 periodos (II/2026 vigente), ${materias.length} materias, ${asignaciones.length} asignaciones`);
  console.log(`  · ${creados} proyectos nuevos (de ${proyectos.length})`);
}

main()
  .catch((error) => {
    console.error("Error al cargar los datos de demostración:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
