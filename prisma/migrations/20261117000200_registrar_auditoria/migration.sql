CREATE TYPE "TipoEventoAuditoria" AS ENUM (
    'INICIO_SESION',
    'INICIO_SESION_FALLIDO',
    'CIERRE_SESION',
    'REGISTRO_USUARIO',
    'EDICION_USUARIO',
    'ACTIVACION_USUARIO',
    'DESACTIVACION_USUARIO',
    'RESTABLECIMIENTO_CONTRASENA',
    'ACCESO_DENEGADO'
);

CREATE TABLE "auditorias" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoEventoAuditoria" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "usuarioId" INTEGER,
    "usuarioNombre" TEXT,
    "entidadId" INTEGER,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "detalles" JSONB,

    CONSTRAINT "auditorias_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "auditorias_fecha_idx"
ON "auditorias"("fecha");

CREATE INDEX "auditorias_tipo_idx"
ON "auditorias"("tipo");

CREATE INDEX "auditorias_usuarioId_idx"
ON "auditorias"("usuarioId");

ALTER TABLE "auditorias"
ADD CONSTRAINT "auditorias_usuarioId_fkey"
FOREIGN KEY ("usuarioId")
REFERENCES "usuarios"("id")
ON DELETE SET NULL ON UPDATE CASCADE;