
BEGIN;

-- Completar la tabla proyectos
ALTER TABLE "proyectos"
    ADD COLUMN "idPeriodo" INTEGER,
    ADD COLUMN "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN "actualizadoEn" TIMESTAMP(3);
-- Completar la fecha de actualización de proyectos existentes
UPDATE "proyectos"
SET "actualizadoEn" = CURRENT_TIMESTAMP
WHERE "actualizadoEn" IS NULL;

-- Establecer la columna como obligatoria
ALTER TABLE "proyectos"
    ALTER COLUMN "actualizadoEn" SET NOT NULL;
-- Completar la tabla avances_proyecto
ALTER TABLE "avances_proyecto"
    ADD COLUMN "idHito" INTEGER,
    ADD COLUMN "titulo" TEXT NOT NULL DEFAULT 'Avance',
    ADD COLUMN "enlace" TEXT,
    ADD COLUMN "revisionEstado" "EstadoRevision" NOT NULL DEFAULT 'PENDIENTE',
    ADD COLUMN "retroalimentacion" TEXT,
    ADD COLUMN "calificacion" INTEGER,
    ADD COLUMN "idRevisor" INTEGER,
    ADD COLUMN "revisadoEn" TIMESTAMP(3);

-- Índices adicionales
CREATE INDEX "proyectos_materiaId_idx"
    ON "proyectos"("materiaId");

CREATE INDEX "proyectos_idPeriodo_idx"
    ON "proyectos"("idPeriodo");

-- Relaciones de proyectos
ALTER TABLE "proyectos"
    ADD CONSTRAINT "proyectos_materiaId_fkey"
    FOREIGN KEY ("materiaId") REFERENCES "materias"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "proyectos"
    ADD CONSTRAINT "proyectos_docenteId_fkey"
    FOREIGN KEY ("docenteId") REFERENCES "usuarios"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "proyectos"
    ADD CONSTRAINT "proyectos_creadoPorId_fkey"
    FOREIGN KEY ("creadoPorId") REFERENCES "usuarios"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "proyectos"
    ADD CONSTRAINT "proyectos_idPeriodo_fkey"
    FOREIGN KEY ("idPeriodo") REFERENCES "periodos_academicos"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Relaciones de equipos y miembros
ALTER TABLE "equipos"
    ADD CONSTRAINT "equipos_creadoPorId_fkey"
    FOREIGN KEY ("creadoPorId") REFERENCES "usuarios"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "miembros_equipo"
    ADD CONSTRAINT "miembros_equipo_usuarioId_fkey"
    FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Relaciones de hitos y avances
ALTER TABLE "seg_hitos"
    ADD CONSTRAINT "seg_hitos_idProyecto_fkey"
    FOREIGN KEY ("idProyecto") REFERENCES "proyectos"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "avances_proyecto"
    ADD CONSTRAINT "avances_proyecto_autorId_fkey"
    FOREIGN KEY ("autorId") REFERENCES "usuarios"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "avances_proyecto"
    ADD CONSTRAINT "avances_proyecto_idHito_fkey"
    FOREIGN KEY ("idHito") REFERENCES "seg_hitos"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "avances_proyecto"
    ADD CONSTRAINT "avances_proyecto_idRevisor_fkey"
    FOREIGN KEY ("idRevisor") REFERENCES "usuarios"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "observaciones_proyecto"
    ADD CONSTRAINT "observaciones_proyecto_docenteId_fkey"
    FOREIGN KEY ("docenteId") REFERENCES "usuarios"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Relaciones de reportes
ALTER TABLE "reportes"
    ADD CONSTRAINT "reportes_idProyecto_fkey"
    FOREIGN KEY ("idProyecto") REFERENCES "proyectos"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Relaciones de almacenamiento
ALTER TABLE "carpeta"
    ADD CONSTRAINT "carpeta_proyectoId_fkey"
    FOREIGN KEY ("proyectoId") REFERENCES "proyectos"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "archivo"
    ADD CONSTRAINT "archivo_proyectoId_fkey"
    FOREIGN KEY ("proyectoId") REFERENCES "proyectos"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "cuota_almacenamiento"
    ADD CONSTRAINT "cuota_almacenamiento_proyectoId_fkey"
    FOREIGN KEY ("proyectoId") REFERENCES "proyectos"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
