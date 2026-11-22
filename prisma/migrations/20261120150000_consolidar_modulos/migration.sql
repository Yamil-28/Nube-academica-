BEGIN;

LOCK TABLE "integrante_proyecto", "proyecto", "seg_avances", "seg_miembros", "seg_proyectos", "seg_hitos", "archivo", "carpeta", "cuota_almacenamiento", "reportes" IN ACCESS EXCLUSIVE MODE;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "integrante_proyecto")
        OR EXISTS (SELECT 1 FROM "proyecto")
        OR EXISTS (SELECT 1 FROM "seg_avances")
        OR EXISTS (SELECT 1 FROM "seg_miembros")
        OR EXISTS (SELECT 1 FROM "seg_proyectos")
        OR EXISTS (SELECT 1 FROM "seg_hitos")
        OR EXISTS (SELECT 1 FROM "archivo")
        OR EXISTS (SELECT 1 FROM "carpeta")
        OR EXISTS (SELECT 1 FROM "cuota_almacenamiento")
        OR EXISTS (SELECT 1 FROM "reportes" WHERE "idProyecto" IS NOT NULL) THEN
        RAISE EXCEPTION 'Consolidacion detenida: existen datos vinculados a proyectos anteriores';
    END IF;
END $$;

-- CreateEnum
CREATE TYPE "RolEquipo" AS ENUM ('LIDER', 'INTEGRANTE');

-- DropForeignKey
ALTER TABLE "archivo" DROP CONSTRAINT "archivo_proyectoId_fkey";

-- DropForeignKey
ALTER TABLE "carpeta" DROP CONSTRAINT "carpeta_proyectoId_fkey";

-- DropForeignKey
ALTER TABLE "cuota_almacenamiento" DROP CONSTRAINT "cuota_almacenamiento_proyectoId_fkey";

-- DropForeignKey
ALTER TABLE "integrante_proyecto" DROP CONSTRAINT "integrante_proyecto_proyectoId_fkey";

-- DropForeignKey
ALTER TABLE "reportes" DROP CONSTRAINT "reportes_idProyecto_fkey";

-- DropForeignKey
ALTER TABLE "seg_avances" DROP CONSTRAINT "seg_avances_idAutor_fkey";

-- DropForeignKey
ALTER TABLE "seg_avances" DROP CONSTRAINT "seg_avances_idHito_fkey";

-- DropForeignKey
ALTER TABLE "seg_avances" DROP CONSTRAINT "seg_avances_idProyecto_fkey";

-- DropForeignKey
ALTER TABLE "seg_avances" DROP CONSTRAINT "seg_avances_idRevisor_fkey";

-- DropForeignKey
ALTER TABLE "seg_hitos" DROP CONSTRAINT "seg_hitos_idProyecto_fkey";

-- DropForeignKey
ALTER TABLE "seg_miembros" DROP CONSTRAINT "seg_miembros_idProyecto_fkey";

-- DropForeignKey
ALTER TABLE "seg_miembros" DROP CONSTRAINT "seg_miembros_idUsuario_fkey";

-- DropForeignKey
ALTER TABLE "seg_proyectos" DROP CONSTRAINT "seg_proyectos_idDocente_fkey";

-- DropForeignKey
ALTER TABLE "seg_proyectos" DROP CONSTRAINT "seg_proyectos_idMateria_fkey";

-- DropForeignKey
ALTER TABLE "seg_proyectos" DROP CONSTRAINT "seg_proyectos_idPeriodo_fkey";

-- DropTable
DROP TABLE "integrante_proyecto";

-- DropTable
DROP TABLE "proyecto";

-- DropTable
DROP TABLE "seg_avances";

-- DropTable
DROP TABLE "seg_miembros";

-- DropTable
DROP TABLE "seg_proyectos";

DROP TYPE "EstadoProyecto";
CREATE TYPE "EstadoProyecto" AS ENUM ('REGISTRADO', 'EN_DESARROLLO', 'EN_REVISION', 'FINALIZADO');

-- CreateTable
CREATE TABLE "proyectos" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "materiaId" INTEGER NOT NULL,
    "docenteId" INTEGER NOT NULL,
    "creadoPorId" INTEGER NOT NULL,
    "idPeriodo" INTEGER,
    "gestion" INTEGER NOT NULL,
    "semestre" INTEGER NOT NULL,
    "estado" "EstadoProyecto" NOT NULL DEFAULT 'REGISTRADO',
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaCierre" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proyectos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "proyectoId" INTEGER NOT NULL,
    "creadoPorId" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "miembros_equipo" (
    "id" SERIAL NOT NULL,
    "equipoId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "rolEquipo" "RolEquipo" NOT NULL DEFAULT 'INTEGRANTE',
    "fechaIngreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "miembros_equipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avances_proyecto" (
    "id" SERIAL NOT NULL,
    "proyectoId" INTEGER NOT NULL,
    "autorId" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idHito" INTEGER,
    "titulo" TEXT NOT NULL DEFAULT 'Avance',
    "enlace" TEXT,
    "revisionEstado" "EstadoRevision" NOT NULL DEFAULT 'PENDIENTE',
    "retroalimentacion" TEXT,
    "calificacion" INTEGER,
    "idRevisor" INTEGER,
    "revisadoEn" TIMESTAMP(3),

    CONSTRAINT "avances_proyecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "observaciones_proyecto" (
    "id" SERIAL NOT NULL,
    "proyectoId" INTEGER NOT NULL,
    "docenteId" INTEGER NOT NULL,
    "texto" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "observaciones_proyecto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "proyectos_docenteId_idx" ON "proyectos"("docenteId");

-- CreateIndex
CREATE INDEX "proyectos_creadoPorId_idx" ON "proyectos"("creadoPorId");

-- CreateIndex
CREATE INDEX "proyectos_materiaId_idx" ON "proyectos"("materiaId");

-- CreateIndex
CREATE INDEX "proyectos_idPeriodo_idx" ON "proyectos"("idPeriodo");

-- CreateIndex
CREATE UNIQUE INDEX "equipos_proyectoId_key" ON "equipos"("proyectoId");

-- CreateIndex
CREATE INDEX "equipos_creadoPorId_idx" ON "equipos"("creadoPorId");

-- CreateIndex
CREATE INDEX "miembros_equipo_usuarioId_idx" ON "miembros_equipo"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "miembros_equipo_equipoId_usuarioId_key" ON "miembros_equipo"("equipoId", "usuarioId");

-- CreateIndex
CREATE INDEX "avances_proyecto_proyectoId_idx" ON "avances_proyecto"("proyectoId");

-- CreateIndex
CREATE INDEX "observaciones_proyecto_proyectoId_idx" ON "observaciones_proyecto"("proyectoId");

-- AddForeignKey
ALTER TABLE "proyectos" ADD CONSTRAINT "proyectos_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "materias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyectos" ADD CONSTRAINT "proyectos_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyectos" ADD CONSTRAINT "proyectos_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyectos" ADD CONSTRAINT "proyectos_idPeriodo_fkey" FOREIGN KEY ("idPeriodo") REFERENCES "periodos_academicos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipos" ADD CONSTRAINT "equipos_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "proyectos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipos" ADD CONSTRAINT "equipos_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "miembros_equipo" ADD CONSTRAINT "miembros_equipo_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "equipos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "miembros_equipo" ADD CONSTRAINT "miembros_equipo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seg_hitos" ADD CONSTRAINT "seg_hitos_idProyecto_fkey" FOREIGN KEY ("idProyecto") REFERENCES "proyectos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avances_proyecto" ADD CONSTRAINT "avances_proyecto_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "proyectos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avances_proyecto" ADD CONSTRAINT "avances_proyecto_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avances_proyecto" ADD CONSTRAINT "avances_proyecto_idHito_fkey" FOREIGN KEY ("idHito") REFERENCES "seg_hitos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avances_proyecto" ADD CONSTRAINT "avances_proyecto_idRevisor_fkey" FOREIGN KEY ("idRevisor") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observaciones_proyecto" ADD CONSTRAINT "observaciones_proyecto_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "proyectos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observaciones_proyecto" ADD CONSTRAINT "observaciones_proyecto_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes" ADD CONSTRAINT "reportes_idProyecto_fkey" FOREIGN KEY ("idProyecto") REFERENCES "proyectos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carpeta" ADD CONSTRAINT "carpeta_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "proyectos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivo" ADD CONSTRAINT "archivo_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "proyectos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuota_almacenamiento" ADD CONSTRAINT "cuota_almacenamiento_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "proyectos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
