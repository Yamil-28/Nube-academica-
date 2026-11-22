# Módulo 3 · Nube Académica — versión 3

Novedades: páginas reales «Espacios compartidos» (docente/estudiante) y «Almacenamiento» (administrador),
diseño renovado (diálogos, iconos, arrastrar y soltar, tarjetas de resumen), selector de personas para compartir
y guía de defensa (GUIA-DEFENSA.md).

## Instalar
    Expand-Archive -Path "$env:USERPROFILE\Downloads\modulo-nube-academica-v3.zip" -DestinationPath .\_nube_tmp -Force
    Copy-Item -Recurse -Force .\_nube_tmp\* .
    Remove-Item -Recurse -Force .\_nube_tmp
    Remove-Item componentes\nube\ExploradorArchivos.module.css, componentes\nube\VistaNube.module.css -ErrorAction SilentlyContinue
    npx tsc --noEmit

## Rutas
Estudiante: /estudiante/nube · /estudiante/compartidos
Docente:    /docente/nube · /docente/compartidos
Admin:      /administrador/nube · /administrador/almacenamiento
