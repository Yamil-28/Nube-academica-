-- CreateEnum
CREATE TYPE "Semestre" AS ENUM ('I', 'II');

-- CreateEnum
CREATE TYPE "EstadoProyecto" AS ENUM ('PLANIFICADO', 'EN_PROGRESO', 'EN_REVISION', 'COMPLETADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "EstadoHito" AS ENUM ('PENDIENTE', 'EN_PROGRESO', 'COMPLETADO');

-- CreateEnum
CREATE TYPE "EstadoRevision" AS ENUM ('PENDIENTE', 'APROBADO', 'OBSERVADO');

-- CreateTable
CREATE TABLE "periodos_academicos" (
    "id" SERIAL NOT NULL,
    "gestion" INTEGER NOT NULL,
    "semestre" "Semestre" NOT NULL,
    "vigente" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "periodos_academicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materias" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT,
    "nombre" TEXT NOT NULL,
    "nivel" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL DEFAULT '',
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "materias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asignaciones_docentes" (
    "id" SERIAL NOT NULL,
    "idDocente" INTEGER NOT NULL,
    "idMateria" INTEGER NOT NULL,
    "idPeriodo" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asignaciones_docentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seg_proyectos" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL DEFAULT '',
    "idMateria" INTEGER,
    "idPeriodo" INTEGER,
    "idDocente" INTEGER NOT NULL,
    "estado" "EstadoProyecto" NOT NULL DEFAULT 'PLANIFICADO',
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seg_proyectos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seg_miembros" (
    "idProyecto" INTEGER NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "rolEquipo" TEXT NOT NULL DEFAULT 'integrante',

    CONSTRAINT "seg_miembros_pkey" PRIMARY KEY ("idProyecto","idUsuario")
);

-- CreateTable
CREATE TABLE "seg_hitos" (
    "id" SERIAL NOT NULL,
    "idProyecto" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL DEFAULT '',
    "fechaLimite" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoHito" NOT NULL DEFAULT 'PENDIENTE',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seg_hitos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seg_avances" (
    "id" SERIAL NOT NULL,
    "idProyecto" INTEGER NOT NULL,
    "idHito" INTEGER,
    "idAutor" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL DEFAULT '',
    "enlace" TEXT,
    "revisionEstado" "EstadoRevision" NOT NULL DEFAULT 'PENDIENTE',
    "retroalimentacion" TEXT,
    "calificacion" INTEGER,
    "idRevisor" INTEGER,
    "revisadoEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seg_avances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reportes" (
    "id" SERIAL NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "idProyecto" INTEGER,
    "tipoReporte" TEXT NOT NULL,
    "formato" TEXT NOT NULL,
    "fechaGeneracion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reportes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "periodos_academicos_gestion_semestre_key" ON "periodos_academicos"("gestion", "semestre");

-- CreateIndex
CREATE UNIQUE INDEX "materias_codigo_key" ON "materias"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "materias_nombre_key" ON "materias"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "asignaciones_docentes_idDocente_idMateria_idPeriodo_key" ON "asignaciones_docentes"("idDocente", "idMateria", "idPeriodo");

-- CreateIndex
CREATE INDEX "reportes_fechaGeneracion_idx" ON "reportes"("fechaGeneracion");

-- AddForeignKey
ALTER TABLE "asignaciones_docentes" ADD CONSTRAINT "asignaciones_docentes_idDocente_fkey" FOREIGN KEY ("idDocente") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_docentes" ADD CONSTRAINT "asignaciones_docentes_idMateria_fkey" FOREIGN KEY ("idMateria") REFERENCES "materias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_docentes" ADD CONSTRAINT "asignaciones_docentes_idPeriodo_fkey" FOREIGN KEY ("idPeriodo") REFERENCES "periodos_academicos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seg_proyectos" ADD CONSTRAINT "seg_proyectos_idMateria_fkey" FOREIGN KEY ("idMateria") REFERENCES "materias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seg_proyectos" ADD CONSTRAINT "seg_proyectos_idPeriodo_fkey" FOREIGN KEY ("idPeriodo") REFERENCES "periodos_academicos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seg_proyectos" ADD CONSTRAINT "seg_proyectos_idDocente_fkey" FOREIGN KEY ("idDocente") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seg_miembros" ADD CONSTRAINT "seg_miembros_idProyecto_fkey" FOREIGN KEY ("idProyecto") REFERENCES "seg_proyectos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seg_miembros" ADD CONSTRAINT "seg_miembros_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seg_hitos" ADD CONSTRAINT "seg_hitos_idProyecto_fkey" FOREIGN KEY ("idProyecto") REFERENCES "seg_proyectos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seg_avances" ADD CONSTRAINT "seg_avances_idProyecto_fkey" FOREIGN KEY ("idProyecto") REFERENCES "seg_proyectos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seg_avances" ADD CONSTRAINT "seg_avances_idHito_fkey" FOREIGN KEY ("idHito") REFERENCES "seg_hitos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seg_avances" ADD CONSTRAINT "seg_avances_idAutor_fkey" FOREIGN KEY ("idAutor") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seg_avances" ADD CONSTRAINT "seg_avances_idRevisor_fkey" FOREIGN KEY ("idRevisor") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes" ADD CONSTRAINT "reportes_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes" ADD CONSTRAINT "reportes_idProyecto_fkey" FOREIGN KEY ("idProyecto") REFERENCES "seg_proyectos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
