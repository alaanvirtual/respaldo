// src/utils/users_util.ts
import { UsersService } from '../components/users/users_service';
import { Users } from '../components/users/users_entity';
import { AppDataSource } from './db';
import { CacheUtil } from './cache_util';

export class UsersUtil {
  public static async getUserFromUsername(username: string): Promise<Users | null> {
    if (!AppDataSource.isInitialized) return null;
    const repo = AppDataSource.getRepository(Users);
    return await repo.findOne({ where: { username } });
  }

  public static async getUserByEmail(email: string): Promise<Users | null> {
    if (!AppDataSource.isInitialized) return null;
    const repo = AppDataSource.getRepository(Users);
    return await repo.findOne({ where: { email } });
  }

  /**
   * Precarga masiva de usuarios en la caché de Redis al arrancar el servidor (Cache Warm-up)
   */
  public static async putAllUsersInCache(): Promise<void> {
    if (!AppDataSource.isInitialized) return;
    const userService = new UsersService();
    const result = await userService.findAll({});
    if (result.statusCode === 200 && Array.isArray(result.data)) {
      const users = result.data;
      users.forEach((user: any) => {
        const sanitized = { ...user };
        delete sanitized.password; // Sanitizar contraseña
        CacheUtil.set('User', user.user_id, sanitized);
      });
      console.log('[OK Cache Warm-up] Todos los usuarios han sido cargados exitosamente en la caché');
    }
  }
}
