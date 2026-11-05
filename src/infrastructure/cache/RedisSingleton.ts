import { logger } from '../logging/logger';
import { RedisCacheService, ICacheService } from './RedisCacheService';

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
}

/**
 * Patrón Creacional: Singleton para el Cliente de Caché Redis 7.
 * Capítulo 11 - Patrones de Diseño.
 * Garantiza una única instancia de cliente de caché en memoria y conexión Redis.
 */
export class RedisSingleton {
  private static instance: RedisSingleton | null = null;
  private readonly config: RedisConfig;
  private readonly cacheService: ICacheService;
  private connected: boolean = false;

  private constructor() {
    this.config = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
    };
    this.cacheService = new RedisCacheService();
    this.connected = true;
    logger.info(
      `[RedisSingleton] Instancia única de Redis inicializada para ${this.config.host}:${this.config.port}`,
    );
  }

  public static getInstance(): RedisSingleton {
    if (!RedisSingleton.instance) {
      RedisSingleton.instance = new RedisSingleton();
    }
    return RedisSingleton.instance;
  }

  public getCacheService(): ICacheService {
    return this.cacheService;
  }

  public getConfig(): RedisConfig {
    return { ...this.config };
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public async disconnect(): Promise<void> {
    if (!this.connected) return;
    await this.cacheService.clear();
    this.connected = false;
    logger.info('[RedisSingleton] Conexión con Redis 7 finalizada correctamente.');
  }

  public static resetInstance(): void {
    RedisSingleton.instance = null;
  }
}
