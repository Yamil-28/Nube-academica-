CREATE TABLE "fotos_perfil" (
    "usuarioId" INTEGER NOT NULL,
    "imagen" BYTEA NOT NULL,
    "revision" UUID NOT NULL,
    CONSTRAINT "fotos_perfil_pkey" PRIMARY KEY ("usuarioId"),
    CONSTRAINT "fotos_perfil_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
