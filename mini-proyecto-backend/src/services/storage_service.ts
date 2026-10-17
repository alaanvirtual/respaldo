// src/services/storage_service.ts - Servicios de almacenamiento para Factory (Capítulo 11)
import path from 'path';

export interface IStorageService {
  uploadFile(filePath: string, destinationKey: string): Promise<string>;
  deleteFile(destinationKey: string): Promise<boolean>;
}

export class DiskStorageService implements IStorageService {
  constructor(private uploadDir: string) {}

  public async uploadFile(filePath: string, destinationKey: string): Promise<string> {
    const fullDestination = path.join(this.uploadDir, destinationKey).replace(/\\/g, '/');
    console.log(`[DiskStorage] Guardando archivo ${filePath} en ${fullDestination}`);
    return fullDestination;
  }

  public async deleteFile(destinationKey: string): Promise<boolean> {
    console.log(`[DiskStorage] Eliminando archivo ${destinationKey}`);
    return true;
  }
}

export class S3StorageService implements IStorageService {
  constructor(private bucket: string, private region: string) {}

  public async uploadFile(filePath: string, destinationKey: string): Promise<string> {
    const s3Url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${destinationKey}`;
    console.log(`[S3Storage] Subiendo ${filePath} hacia bucket ${s3Url}`);
    return s3Url;
  }

  public async deleteFile(destinationKey: string): Promise<boolean> {
    console.log(`[S3Storage] Eliminando objeto ${destinationKey} de bucket ${this.bucket}`);
    return true;
  }
}
