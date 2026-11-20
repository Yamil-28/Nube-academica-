-- CreateEnum
CREATE TYPE "NivelPermisoArchivo" AS ENUM ('LECTURA', 'EDICION');

-- CreateTable
CREATE TABLE "tipo_recurso" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(40) NOT NULL,

    CONSTRAINT "tipo_recurso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carpeta" (
    "id" SERIAL NOT NULL,
    "proyectoId" INTEGER NOT NULL,
    "carpetaPadreId" INTEGER,
    "nombre" VARCHAR(255) NOT NULL,
    "creadaPorId" INTEGER NOT NULL,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eliminadaEn" TIMESTAMP(3),

    CONSTRAINT "carpeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "archivo" (
    "id" SERIAL NOT NULL,
    "proyectoId" INTEGER NOT NULL,
    "carpetaId" INTEGER,
    "tipoRecursoId" INTEGER,
    "propietarioId" INTEGER NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "extension" VARCHAR(20),
    "mime" VARCHAR(150),
    "tamanoBytes" BIGINT NOT NULL,
    "versionActual" INTEGER NOT NULL DEFAULT 1,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "eliminadoEn" TIMESTAMP(3),

    CONSTRAINT "archivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "version_archivo" (
    "id" SERIAL NOT NULL,
    "archivoId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "numeroVersion" INTEGER NOT NULL,
    "claveAlmacenamiento" TEXT NOT NULL,
    "tamanoBytes" BIGINT NOT NULL,
    "mime" VARCHAR(150),
    "comentario" TEXT,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "version_archivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permiso_archivo" (
    "archivoId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "nivel" "NivelPermisoArchivo" NOT NULL DEFAULT 'LECTURA',
    "otorgadoPorId" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permiso_archivo_pkey" PRIMARY KEY ("archivoId","usuarioId")
);

-- CreateTable
CREATE TABLE "cuota_almacenamiento" (
    "id" SERIAL NOT NULL,
    "proyectoId" INTEGER NOT NULL,
    "administradorId" INTEGER NOT NULL,
    "limiteBytes" BIGINT NOT NULL,
    "fechaAsignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cuota_almacenamiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proyecto" (
    "id" SERIAL NOT NULL,
    "titulo" VARCHAR(150) NOT NULL,
    "docenteId" INTEGER,
    "creadorId" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proyecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrante_proyecto" (
    "proyectoId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "rolEquipo" VARCHAR(80),

    CONSTRAINT "integrante_proyecto_pkey" PRIMARY KEY ("proyectoId","usuarioId")
);

-- CreateTable
CREATE TABLE "registro_actividad" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "accion" VARCHAR(60) NOT NULL,
    "entidad" VARCHAR(40) NOT NULL,
    "entidadId" INTEGER,
    "detalle" JSONB,
    "ip" VARCHAR(60),
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registro_actividad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tipo_recurso_nombre_key" ON "tipo_recurso"("nombre");

-- CreateIndex
CREATE INDEX "carpeta_proyectoId_carpetaPadreId_idx" ON "carpeta"("proyectoId", "carpetaPadreId");

-- CreateIndex
CREATE INDEX "archivo_proyectoId_carpetaId_idx" ON "archivo"("proyectoId", "carpetaId");

-- CreateIndex
CREATE UNIQUE INDEX "version_archivo_archivoId_numeroVersion_key" ON "version_archivo"("archivoId", "numeroVersion");

-- CreateIndex
CREATE UNIQUE INDEX "cuota_almacenamiento_proyectoId_key" ON "cuota_almacenamiento"("proyectoId");

-- CreateIndex
CREATE INDEX "registro_actividad_usuarioId_fecha_idx" ON "registro_actividad"("usuarioId", "fecha");

-- AddForeignKey
ALTER TABLE "carpeta" ADD CONSTRAINT "carpeta_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carpeta" ADD CONSTRAINT "carpeta_carpetaPadreId_fkey" FOREIGN KEY ("carpetaPadreId") REFERENCES "carpeta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivo" ADD CONSTRAINT "archivo_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivo" ADD CONSTRAINT "archivo_carpetaId_fkey" FOREIGN KEY ("carpetaId") REFERENCES "carpeta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivo" ADD CONSTRAINT "archivo_tipoRecursoId_fkey" FOREIGN KEY ("tipoRecursoId") REFERENCES "tipo_recurso"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivo" ADD CONSTRAINT "archivo_propietarioId_fkey" FOREIGN KEY ("propietarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "version_archivo" ADD CONSTRAINT "version_archivo_archivoId_fkey" FOREIGN KEY ("archivoId") REFERENCES "archivo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "version_archivo" ADD CONSTRAINT "version_archivo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permiso_archivo" ADD CONSTRAINT "permiso_archivo_archivoId_fkey" FOREIGN KEY ("archivoId") REFERENCES "archivo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permiso_archivo" ADD CONSTRAINT "permiso_archivo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuota_almacenamiento" ADD CONSTRAINT "cuota_almacenamiento_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrante_proyecto" ADD CONSTRAINT "integrante_proyecto_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
