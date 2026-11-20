# Guía de defensa · Módulo 3 «Nube Académica» (SISCloud)

## 1. En una frase
La Nube Académica es el espacio donde cada proyecto guarda, organiza, versiona y comparte sus archivos, con permisos distintos para Estudiante, Docente y Administrador. Resuelve el problema del Cap. 1: documentos y código **dispersos**, sin control de versiones ni de acceso.

## 2. Requisitos que cubre (Cap. 3)
| Código | Requisito | Dónde se ve |
|---|---|---|
| RF05 | Crear y organizar espacios de almacenamiento por proyecto (con límite) | Cuota por proyecto · pantalla *Almacenamiento* (admin) |
| RF06 | Subir, descargar y consultar archivos autorizados | Explorador de archivos |
| RF07 | Organizar con carpetas y subcarpetas | Botón *Nueva carpeta* + migas de pan |
| RF08 | Compartir archivos y administrar permisos | Diálogo *Compartir* + pantalla *Compartidos conmigo* |
| RF09 | Consultar versiones y modificaciones | Diálogo *Versiones* |
| HU05–HU08 | Historias de usuario de los RF anteriores | — |
| RNF01 | Seguridad / control de acceso | `politica.ts` + validación en cada endpoint |
| RNF04 | Integridad (relaciones coherentes) | Llaves foráneas en Prisma |
| RNF06 | Modularidad | Capas separadas (sección 4) |
| RNF08 | Trazabilidad | Tabla `registro_actividad` |

## 3. Actores y permisos (coincide con el diagrama de casos de uso)
| Acción | Estudiante (miembro) | Docente (responsable) | Administrador |
|---|---|---|---|
| Ver / descargar | ✔ | ✔ | ✔ |
| Subir, carpetas, renombrar, eliminar | ✔ | ✖ | ✖ |
| Nueva versión / ver historial | ✔ / ✔ | ✖ / ✔ | ✖ / ✔ |
| Compartir con otros | ✔ | ✖ | ✖ |
| Cuotas de almacenamiento | ✖ | ✖ | ✔ |
El administrador **supervisa pero no edita** proyectos (decisión D-06). Todo está en un solo archivo: `lib/nube/politica.ts`.

## 4. Dónde está mi módulo (arquitectura en 4 capas)
```
Interfaz     componentes/nube/  → ExploradorArchivos, Dialogo, PanelVersiones, PanelCompartir,
                                  PanelCuotas, VistaNube, VistaCompartidos, VistaAlmacenamiento
             app/{estudiante,docente}/nube · compartidos   app/administrador/nube · almacenamiento
API REST     app/api/nube/…     → 10 rutas (archivos, carpetas, versiones, permisos, cuotas, compartidos…)
Lógica       lib/nube/servicio.ts   ← el corazón: reglas de negocio
             lib/nube/politica.ts   ← matriz de permisos     lib/nube/acceso.ts ← rol/relación con el proyecto
             lib/nube/archivos.ts   ← validaciones           lib/nube/auditoria.ts ← bitácora
Datos        prisma/schema.prisma  → carpeta, archivo, version_archivo, permiso_archivo,
                                     cuota_almacenamiento, tipo_recurso (+ proyecto, integrante, registro_actividad)
             lib/nube/almacenamiento/ → guarda los bytes (disco local, intercambiable por S3/MinIO)
```
**Por qué así:** la lógica no depende de Next ni de HTTP, así que se reutiliza (Seguimiento puede llamar `subirArchivo` para los avances, D-10) y se prueba aparte.

## 5. Qué pasa cuando un estudiante sube un archivo
1. `ExploradorArchivos` → `lib/nube/cliente.ts` envía el archivo (multipart) a `POST /api/nube/proyectos/:id/archivos`.
2. `manejar()` (http.ts) toma la sesión (`contexto.ts` → tu `lib/sesion.ts`) y atrapa errores.
3. `servicio.subirArchivo`: ① ¿es miembro y puede «subir»? ② limpia el nombre y bloquea `.exe` ③ ¿existe uno igual? → pide subir como versión ④ ¿cabe en la cuota?
4. Guarda el contenido con nombre **UUID** (no el real) en `storage/`.
5. Crea `archivo` + `version_archivo` v1 en la base. Si falla, **borra el archivo huérfano**.
6. Registra la acción en `registro_actividad`.

## 6. Decisiones de seguridad (lo que más luce en la defensa)
- **Permisos en el servidor**, no solo en la interfaz: aunque alguien manipule el navegador, la API responde 403/404.
- **404 en lugar de 403** si no eres del proyecto: no revela que existe.
- **Descargas siempre como adjunto** + `nosniff`: un HTML malicioso subido jamás se ejecuta en el sitio.
- **Protección contra path traversal** en el almacenamiento y nombres de archivo saneados.
- **Extensiones peligrosas bloqueadas**, tamaño máximo y cuota por proyecto.
- **Eliminación lógica**: nada se borra de golpe; se puede recuperar.
- **Auditoría** de cada acción relevante.

## 7. Guion de demostración (5 minutos)
1. **Estudiante** → *Nube Académica*: crea carpeta «Informes», arrastra un PDF (v1), súbelo de nuevo (error de duplicado), sube nueva versión (v2) y abre *Versiones*.
2. **Compartir** el archivo con el docente (selector de personas, «Solo lectura»).
3. **Docente** → *Espacios compartidos*: aparece el archivo; descárgalo. En *Archivos* solo hay botones de consulta.
4. **Administrador** → *Almacenamiento*: baja el límite a 1 MB. Vuelve como estudiante y sube algo grande → «sin espacio».
5. (Opcional) Muestra en la consola del navegador que el docente recibe **403** al intentar subir, y en la base `SELECT * FROM registro_actividad`.

## 8. Preguntas probables
- **¿Por qué no guardan los archivos en la base de datos?** Los binarios pesan y encarecen respaldos; la base guarda metadatos y el disco/objeto-storage guarda el contenido. La capa `almacenamiento/` permite pasar a MinIO/S3 sin tocar lo demás.
- **¿Cómo controlan las versiones?** Cada subida crea una fila en `version_archivo` (número correlativo, autor, fecha, comentario); el archivo apunta a la versión actual y las anteriores siguen descargables.
- **¿Qué evita que un estudiante vea proyectos ajenos?** `acceso.ts` resuelve su relación con el proyecto en cada petición; sin relación, 404.
- **¿Y si se corta el servidor a mitad de una subida?** Se guarda primero el contenido y luego el registro; si el registro falla se borra el contenido. Un archivo nunca aparece sin su contenido.
- **¿Por qué el admin no puede editar?** Decisión D-06: supervisa y administra el espacio, no altera el trabajo de los equipos.
- **¿Cómo se prueba?** Pruebas automáticas de la política de permisos, validaciones y almacenamiento (`pruebas/nube.prueba.ts`) más pruebas manuales por rol.

## 9. Limitaciones y trabajo futuro (dilas tú primero)
- Almacenamiento en disco local (pasar a MinIO/S3 en producción) y subida en un solo envío (para archivos muy grandes, subida por partes).
- Falta una tarea de purga de archivos eliminados y un análisis antivirus.
- `proyecto` e `integrante_proyecto` son tablas temporales mientras se integran con los módulos de Equipos y Seguimiento; el cambio queda aislado en `acceso.ts`.
- El repositorio Git del alcance del Cap. 1 no forma parte de este módulo.
