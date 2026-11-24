import Image from "next/image";
import { UserRound } from "lucide-react";

export default function AvatarPerfil({ revision, ancho, icono }: {
  revision?: string;
  ancho: number;
  icono: number;
}) {
  if (!revision) return <UserRound size={icono} aria-hidden="true" />;

  return (
    <Image
      src={`/api/perfil/foto?v=${revision}`}
      width={ancho}
      height={ancho}
      alt=""
      unoptimized
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
}
