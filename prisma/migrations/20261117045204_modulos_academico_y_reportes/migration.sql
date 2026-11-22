-- CreateEnum
CREATE TYPE "Semestre" AS ENUM ('I', 'II');

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
ALTER TABLE "reportes" ADD CONSTRAINT "reportes_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
