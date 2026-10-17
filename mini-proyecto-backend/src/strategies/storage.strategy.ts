// src/strategies/storage.strategy.ts - Patrón Strategy (Capítulo 12)
export interface StorageStrategy {
  saveFile(buffer: Buffer, fileName: string): Promise<string>;
  deleteFile(filePath: string): Promise<void>;
}

export class LocalStorageStrategy implements StorageStrategy {
  constructor(private uploadDir: string) {}

  public async saveFile(buffer: Buffer, fileName: string): Promise<string> {
    const destination = `${this.uploadDir}/${fileName}`.replace(/\\/g, '/');
    console.log(`[LocalStorage] Guardando ${buffer.length} bytes en ${destination}`);
    return `/uploads/${fileName}`;
  }

  public async deleteFile(filePath: string): Promise<void> {
    console.log(`[LocalStorage] Eliminando recurso ${filePath}`);
  }
}

export class CloudStorageStrategy implements StorageStrategy {
  constructor(private containerName: string) {}

  public async saveFile(buffer: Buffer, fileName: string): Promise<string> {
    console.log(`[CloudStorage] Almacenando ${fileName} (${buffer.length} bytes) en el contenedor ${this.containerName}`);
    return `/cloud-storage/${this.containerName}/${fileName}`;
  }

  public async deleteFile(filePath: string): Promise<void> {
    console.log(`[CloudStorage] Removiendo recurso ${filePath}`);
  }
}

export class AttachmentService {
  constructor(private strategy: StorageStrategy) {}

  public setStrategy(newStrategy: StorageStrategy): void {
    this.strategy = newStrategy;
  }

  public async processAttachment(buffer: Buffer, name: string): Promise<string> {
    return await this.strategy.saveFile(buffer, name);
  }
}
