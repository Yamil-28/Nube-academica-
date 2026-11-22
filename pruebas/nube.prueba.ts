import assert from "node:assert/strict";
import { puede, permisosDe } from "../lib/nube/politica";
import { clasificar, extensionDe, limpiarNombre, validarArchivo } from "../lib/nube/archivos";
import { AlmacenamientoLocal } from "../lib/nube/almacenamiento/local";
import { ErrorNube } from "../lib/nube/tipos";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

// --- Política por actor (Tabla 6 + D-06)
assert.ok(puede("MIEMBRO", "subir") && puede("MIEMBRO", "compartir") && !puede("MIEMBRO", "administrarCuota"));
assert.ok(puede("DOCENTE_RESPONSABLE", "descargar") && !puede("DOCENTE_RESPONSABLE", "subir") && !puede("DOCENTE_RESPONSABLE", "eliminar"));
assert.ok(puede("ADMINISTRACION", "administrarCuota") && puede("ADMINISTRACION", "ver") && !puede("ADMINISTRACION", "subir"));
assert.ok(!puede(null, "ver"));
assert.equal(permisosDe("MIEMBRO").subir, true);

// --- Nombres y validaciones
assert.equal(limpiarNombre("  ../../etc/passwd "), "....etcpasswd");
assert.equal(limpiarNombre("informe: final?.pdf"), "informe final.pdf");
assert.equal(limpiarNombre(".gitignore"), ".gitignore");
for (const mal of ["", "   ", "..", ".", 5 as unknown]) assert.throws(() => limpiarNombre(mal), ErrorNube);
assert.equal(extensionDe("a.tar.GZ"), "gz"); assert.equal(extensionDe(".env"), null); assert.equal(extensionDe("x."), null);
assert.throws(() => validarArchivo("virus.exe", 10), /No se permiten/);
assert.throws(() => validarArchivo("a.pdf", 0), /vacío/);
assert.throws(() => validarArchivo("a.pdf", 10 ** 10), /Supera/);
assert.equal(clasificar("ts"), "Código fuente"); assert.equal(clasificar("pdf"), "Documento"); assert.equal(clasificar(null), "Otro");

(async () => {
// --- Almacenamiento: guardar/leer/eliminar y path traversal
const alm = new AlmacenamientoLocal(mkdtempSync(path.join(tmpdir(), "nube-")));
const datos = new TextEncoder().encode("hola nube académica");
await alm.guardar("proyectos/1/abc", new Blob([datos]).stream() as ReadableStream<Uint8Array>);
const leido = await new Response(await alm.leer("proyectos/1/abc")).text();
assert.equal(leido, "hola nube académica");
await assert.rejects(() => alm.guardar("proyectos/1/abc", new Blob([datos]).stream() as ReadableStream<Uint8Array>)); // flag wx: no sobrescribe
await assert.rejects(() => alm.leer("../../etc/passwd"), /inválida/);
await alm.eliminar("proyectos/1/abc");
await assert.rejects(() => alm.leer("proyectos/1/abc"));
console.log("✔ todas las pruebas pasaron");
})();
