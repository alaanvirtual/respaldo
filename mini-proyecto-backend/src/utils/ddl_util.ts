// src/utils/ddl_util.ts
import { AppDataSource } from './db';
import { Roles } from '../components/roles/roles_entity';
import { Users } from '../components/users/users_entity';
import { encryptString, Rights } from './common';

export class DDLUtil {
  public static async initDefaultData(): Promise<void> {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      const roleRepo = AppDataSource.getRepository(Roles);
      const userRepo = AppDataSource.getRepository(Users);

      // 1. Crear Rol por Defecto 'SuperAdmin' si no existe
      let superAdminRole = await roleRepo.findOne({ where: { name: 'SuperAdmin' } });
      if (!superAdminRole) {
        // Unimos todos los permisos de la aplicación
        const allPermissions: string[] = [];
        Object.values(Rights).forEach((m: any) => {
          if (m.ALL) allPermissions.push(m.ALL);
        });

        superAdminRole = roleRepo.create({
          name: 'SuperAdmin',
          description: 'Acceso total con todos los derechos del sistema',
          rights: allPermissions.join(',')
        });
        await roleRepo.save(superAdminRole);
        console.log('Resultado de Agregar Rol por Defecto:\n', JSON.stringify({
          statusCode: 201,
          status: 'success',
          data: { role_id: superAdminRole.role_id, name: superAdminRole.name }
        }, null, 2));
      }

      // 2. Crear Usuario Maestro por Defecto 'superadmin' si no existe
      let superAdminUser = await userRepo.findOne({ where: { username: 'superadmin' } });
      if (!superAdminUser) {
        const hashedPassword = await encryptString('Admin@1234');
        superAdminUser = userRepo.create({
          fullname: 'Administrador Maestro',
          username: 'superadmin',
          email: 'admin@pms.local',
          password: hashedPassword,
          role_id: superAdminRole.role_id
        });
        await userRepo.save(superAdminUser);
        console.log('Resultado de Agregar Usuario por Defecto:\n', JSON.stringify({
          statusCode: 201,
          status: 'success',
          data: { user_id: superAdminUser.user_id, username: superAdminUser.username }
        }, null, 2));
      }

      console.log('[DDLUtil] Sembrado inicial completado con éxito.');
    } catch (error) {
      console.error('[DDLUtil Error]:', error);
    }
  }
}
