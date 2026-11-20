-- CreateEnum
CREATE TYPE "RolEquipo" AS ENUM ('LIDER', 'INTEGRANTE');

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

-- CreateIndex
CREATE UNIQUE INDEX "equipos_proyectoId_key" ON "equipos"("proyectoId");

-- CreateIndex
CREATE INDEX "equipos_creadoPorId_idx" ON "equipos"("creadoPorId");

-- CreateIndex
CREATE INDEX "miembros_equipo_usuarioId_idx" ON "miembros_equipo"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "miembros_equipo_equipoId_usuarioId_key" ON "miembros_equipo"("equipoId", "usuarioId");

-- AddForeignKey
ALTER TABLE "equipos" ADD CONSTRAINT "equipos_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "proyectos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "miembros_equipo" ADD CONSTRAINT "miembros_equipo_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "equipos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

