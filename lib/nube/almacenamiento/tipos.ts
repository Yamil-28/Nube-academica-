/** Contrato de almacenamiento. Hoy: disco local. Mañana: MinIO/S3 sin tocar el resto del módulo. */
export interface Almacenamiento {
  guardar(clave: string, contenido: ReadableStream<Uint8Array>): Promise<void>;
  leer(clave: string): Promise<ReadableStream<Uint8Array>>;
  eliminar(clave: string): Promise<void>;
}
