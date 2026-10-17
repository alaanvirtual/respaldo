// src/factories/storage_factory.ts - Patrón Factory para almacenamiento (Capítulo 11)
import { DiskStorageService, S3StorageService, IStorageService } from '../services/storage_service';

export type StorageType = 'local' | 's3';

export class StorageFactory {
  public static createStorage(type: StorageType): IStorageService {
    switch (type) {
      case 'local': {
        const uploadDir = process.env.LOCAL_UPLOAD_DIR || '/var/uploads';
        return new DiskStorageService(uploadDir);
      }
      case 's3': {
        const bucket = process.env.AWS_S3_BUCKET || 'pms-default-bucket';
        const region = process.env.AWS_REGION || 'us-east-1';
        return new S3StorageService(bucket, region);
      }
      default:
        throw new Error(`Tipo de almacenamiento no soportado: ${type}`);
    }
  }
}
