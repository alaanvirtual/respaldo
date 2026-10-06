import { logger } from '../logging/logger';

export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  getOrSet<T>(key: string, ttlSeconds: number, fetchFn: () => Promise<T>): Promise<T>;
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number | null;
}

/**
 * Servicio de Caché con implementación del patrón Cache-Aside.
 * Dispone de almacenamiento en memoria reactivo preparado para desacoplamiento y
 * delegación a clúster Redis en entornos productivos.
 */
export class RedisCacheService implements ICacheService {
  private readonly storage = new Map<string, CacheEntry<unknown>>();
  private readonly defaultTtl: number;

  constructor(defaultTtlSeconds: number = 3600) {
    this.defaultTtl = defaultTtlSeconds;
  }

  public async get<T>(key: string): Promise<T | null> {
    const entry = this.storage.get(key);
    if (!entry) {
      return null;
    }

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.storage.delete(key);
      logger.debug(`Cache expirado para la clave: ${key}`);
      return null;
    }

    logger.debug(`Cache HIT para clave: ${key}`);
    return entry.value as T;
  }

  public async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const ttl = ttlSeconds ?? this.defaultTtl;
    const expiresAt = ttl > 0 ? Date.now() + ttl * 1000 : null;

    this.storage.set(key, { value, expiresAt });
    logger.debug(`Cache SET para clave: ${key} (TTL: ${ttl}s)`);
  }

  public async delete(key: string): Promise<void> {
    this.storage.delete(key);
    logger.debug(`Cache INVALIDADO para clave: ${key}`);
  }

  public async clear(): Promise<void> {
    this.storage.clear();
    logger.debug('Cache limpiado por completo.');
  }

  /**
   * Implementación canónica del patrón Cache-Aside:
   * 1. Consulta la clave en la caché.
   * 2. Si existe (Cache Hit), la retorna inmediatamente.
   * 3. Si no existe (Cache Miss), ejecuta la función de origen de datos,
   *    guarda el resultado en la caché y lo retorna.
   */
  public async getOrSet<T>(key: string, ttlSeconds: number, fetchFn: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    logger.debug(`Cache MISS para clave: ${key}. Consultando fuente de datos primaria...`);
    const freshData = await fetchFn();
    await this.set<T>(key, freshData, ttlSeconds);
    return freshData;
  }
}
