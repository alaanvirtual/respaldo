// src/utils/cache_util.ts - Utilitario de Almacenamiento en Caché (Capítulo 7)
import { createClient, RedisClientType } from 'redis';

export class CacheUtil {
  private static client: RedisClientType | null = null;
  private static isConnected = false;
  private static inMemoryFallback = new Map<string, any>();

  constructor() {
    CacheUtil.initClient();
  }

  public static initClient(): void {
    if (CacheUtil.client) return;

    try {
      const url = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
      CacheUtil.client = createClient({ url }) as RedisClientType;

      CacheUtil.client.on('error', (err: any) => {
        CacheUtil.isConnected = false;
      });

      CacheUtil.client.on('connect', () => {
        CacheUtil.isConnected = true;
        console.log('[OK] Conectado exitosamente a Redis Server');
      });

      CacheUtil.client.connect().catch(() => {
        CacheUtil.isConnected = false;
      });
    } catch {
      CacheUtil.isConnected = false;
    }
  }

  /**
   * Recupera una entidad almacenada en caché mediante Redis o memoria local
   */
  public static async get(cacheName: string, key: string): Promise<any | null> {
    const fullKey = `${cacheName}:${key}`;
    if (CacheUtil.isConnected && CacheUtil.client) {
      try {
        if (CacheUtil.client.json) {
          const data = await CacheUtil.client.json.get(fullKey);
          if (data) return data;
        }
        const strData = await CacheUtil.client.get(fullKey);
        return strData ? JSON.parse(strData) : null;
      } catch {
        return CacheUtil.inMemoryFallback.get(fullKey) || null;
      }
    }
    return CacheUtil.inMemoryFallback.get(fullKey) || null;
  }

  /**
   * Almacena una entidad en caché utilizando el namespace especificado
   */
  public static async set(cacheName: string, key: string, value: any): Promise<void> {
    const fullKey = `${cacheName}:${key}`;
    CacheUtil.inMemoryFallback.set(fullKey, value);

    if (CacheUtil.isConnected && CacheUtil.client) {
      try {
        if (CacheUtil.client.json) {
          await CacheUtil.client.json.set(fullKey, '.', value);
        } else {
          await CacheUtil.client.set(fullKey, JSON.stringify(value));
        }
      } catch {
        // Continúa con la copia en memoria
      }
    }
  }

  /**
   * Elimina una clave de la caché (Invalidación)
   */
  public static async remove(cacheName: string, key: string): Promise<void> {
    const fullKey = `${cacheName}:${key}`;
    CacheUtil.inMemoryFallback.delete(fullKey);

    if (CacheUtil.isConnected && CacheUtil.client) {
      try {
        await CacheUtil.client.del(fullKey);
      } catch {
        // Continúa con la copia en memoria
      }
    }
  }
}
