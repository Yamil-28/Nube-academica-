-- CreateEnum
CREATE TYPE "EstadoProyecto" AS ENUM ('REGISTRADO', 'EN_DESARROLLO', 'EN_REVISION', 'FINALIZADO');

-- CreateTable
CREATE TABLE "proyectos" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "materiaId" INTEGER NOT NULL,
    "docenteId" INTEGER NOT NULL,
    "creadoPorId" INTEGER NOT NULL,
    "gestion" INTEGER NOT NULL,
    "semestre" INTEGER NOT NULL,
    "estado" "EstadoProyecto" NOT NULL DEFAULT 'REGISTRADO',
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaCierre" TIMESTAMP(3),

    CONSTRAINT "proyectos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avances_proyecto" (
    "id" SERIAL NOT NULL,
    "proyectoId" INTEGER NOT NULL,
    "autorId" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

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
CREATE INDEX "avances_proyecto_proyectoId_idx" ON "avances_proyecto"("proyectoId");

-- CreateIndex
CREATE INDEX "observaciones_proyecto_proyectoId_idx" ON "observaciones_proyecto"("proyectoId");

-- AddForeignKey
ALTER TABLE "avances_proyecto" ADD CONSTRAINT "avances_proyecto_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "proyectos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observaciones_proyecto" ADD CONSTRAINT "observaciones_proyecto_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "proyectos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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

