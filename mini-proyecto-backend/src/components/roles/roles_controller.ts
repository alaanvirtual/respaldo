// src/components/roles/roles_controller.ts
import { Request, Response } from 'express';
import { In } from 'typeorm';
import { RolesService } from './roles_service';
import { Rights } from '../../utils/common';
import { AppDataSource } from '../../utils/db';
import { Roles } from './roles_entity';

export class RolesUtil {
  // Retorna una lista plana de todos los permisos atómicos definidos en la aplicación
  public static getAllPermissionsFromRights(): string[] {
    const permissions: string[] = [];
    Object.values(Rights).forEach((moduleRights: any) => {
      if (moduleRights.ALL) {
        const rightsList = moduleRights.ALL.split(',');
        rightsList.forEach((r: string) => {
          if (!permissions.includes(r.trim())) {
            permissions.push(r.trim());
          }
        });
      }
    });
    return permissions;
  }

  // Obtiene los permisos combinados a partir de los roles asignados a un usuario
  public static async getAllRightsFromRoles(roleIds: string | string[] | undefined): Promise<string[]> {
    if (!roleIds || !AppDataSource.isInitialized) return [];
    const ids = Array.isArray(roleIds) ? roleIds : [roleIds];
    if (ids.length === 0) return [];

    const roleRepo = AppDataSource.getRepository(Roles);
    const foundRoles = await roleRepo.find({
      where: { role_id: In(ids) }
    });

    const rightsSet = new Set<string>();
    foundRoles.forEach((role) => {
      if (role.rights) {
        role.rights.split(',').forEach((r) => rightsSet.add(r.trim()));
      }
    });

    return Array.from(rightsSet);
  }
}

export class RoleController {
  private service = new RolesService();

  public getAllHandler = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.findAll(req.query);
    res.status(result.statusCode).json(result);
  };

  public getOneHandler = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await this.service.findOne(id);
    res.status(result.statusCode).json(result);
  };

  public getDetailsHandler = async (req: Request, res: Response): Promise<void> => {
    return this.getOneHandler(req, res);
  };

  public addHandler = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.create(req.body);
    res.status(result.statusCode).json(result);
  };

  public updateHandler = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await this.service.update(id, req.body);
    res.status(result.statusCode).json(result);
  };

  public deleteHandler = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await this.service.delete(id);
    res.status(result.statusCode).json(result);
  };
}
