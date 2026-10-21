// src/utils/db.ts
import { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm';
import { IServerConfig } from './config';
import config from '../../server_config.json';
import { Roles } from '../components/roles/roles_entity';
import { Users } from '../components/users/users_entity';
import { Projects } from '../components/projects/projects_entity';
import { Tasks } from '../components/tasks/tasks_entity';
import { Comments } from '../components/comments/comments_entity';

const db_config = config.db_config;

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || db_config.host,
  port: Number(process.env.DB_PORT) || db_config.port,
  username: process.env.DB_USER || db_config.username,
  password: process.env.DB_PASSWORD || db_config.password,
  database: process.env.DB_NAME || db_config.dbname,
  entities: [Roles, Users, Projects, Tasks, Comments],
  synchronize: true, // Sincroniza esquemas físicamente en PostgreSQL
  logging: false
});

let isConnecting = false;

export class DatabaseUtil {
  public server_config: IServerConfig = config;
  public static dataSource: DataSource = AppDataSource;

  constructor() {
    this.connectDatabase();
  }

  public connectDatabase(): Promise<DataSource> {
    if (AppDataSource.isInitialized) {
      return Promise.resolve(AppDataSource);
    }
    if (isConnecting) {
      return Promise.resolve(AppDataSource);
    }
    isConnecting = true;
    return AppDataSource.initialize()
      .then((ds) => {
        isConnecting = false;
        console.log('Connected to the database with all entities synchronized');
        return ds;
      })
      .catch((error) => {
        isConnecting = false;
        console.log('[WARN Database] Base de datos PostgreSQL no conectada en localhost:5432:', error.message || error);
        return AppDataSource;
      });
  }

  public getRepository<Entity extends ObjectLiteral>(entity: EntityTarget<Entity>): Repository<Entity> {
    try {
      return AppDataSource.getRepository(entity);
    } catch {
      return null as any;
    }
  }
}
