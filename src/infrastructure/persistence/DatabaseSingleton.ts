import { DatabaseConfig, getDatabaseConfig } from './typeorm.config';
import { logger } from '../logging/logger';

/**
 * Patrón Creacional: Singleton para la conexión a la Base de Datos PostgreSQL.
 * Capítulo 11 - Patrones de Diseño.
 * Garantiza una única instancia de configuración y conexión para evitar
 * el agotamiento de conexiones en el pool de PostgreSQL.
 */
export class DatabaseSingleton {
  private static instance: DatabaseSingleton | null = null;
  private readonly config: DatabaseConfig;
  private connected: boolean = false;

  private constructor() {
    this.config = getDatabaseConfig();
    logger.info(
      `[DatabaseSingleton] Inicializando instancia única para ${this.config.host}:${this.config.port}/${this.config.database}`,
    );
  }

  public static getInstance(): DatabaseSingleton {
    if (!DatabaseSingleton.instance) {
      DatabaseSingleton.instance = new DatabaseSingleton();
    }
    return DatabaseSingleton.instance;
  }

  public getConfig(): DatabaseConfig {
    return { ...this.config };
  }

  public async connect(): Promise<void> {
    if (this.connected) {
      logger.debug('[DatabaseSingleton] Conexión ya activa.');
      return;
    }
    // Simulación de conexión exitosa al pool PostgreSQL
    this.connected = true;
    logger.info(
      `[DatabaseSingleton] Pool de conexiones PostgreSQL activo en ${this.config.host}:${this.config.port}`,
    );
  }

  public async disconnect(): Promise<void> {
    if (!this.connected) return;
    this.connected = false;
    logger.info('[DatabaseSingleton] Pool de conexiones PostgreSQL cerrado correctamente.');
  }

  public isConnected(): boolean {
    return this.connected;
  }

  /**
   * Método para pruebas que permite reiniciar la instancia Singleton.
   */
  public static resetInstance(): void {
    DatabaseSingleton.instance = null;
  }
}
