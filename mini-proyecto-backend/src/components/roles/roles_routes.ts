// src/components/roles/roles_routes.ts
import { Express } from 'express';
import { RoleController, RolesUtil } from './roles_controller';
import { validate } from '../../utils/validator';
import { body } from 'express-validator';

const validRoleInput = [
  body('name').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('description').optional().isLength({ max: 200 }).withMessage('La descripción supera el límite de 200 caracteres'),
  body('rights').optional().custom((value: string) => {
    if (!value) return true;
    const accessRights = value.split(',');
    const validRights = RolesUtil.getAllPermissionsFromRights();
    const areAllRightsValid = accessRights.every(right => validRights.includes(right.trim()));
    if (!areAllRightsValid) {
      throw new Error('Permisos o derechos inválidos');
    }
    return true;
  })
];

export class RoleRoutes {
  private baseEndPoint = '/api/roles';

  constructor(app: Express) {
    const controller = new RoleController();

    app.route(this.baseEndPoint)
      .get(controller.getAllHandler)
      .post(validate(validRoleInput), controller.addHandler);

    app.route(this.baseEndPoint + '/:id')
      .get(controller.getOneHandler)
      .put(validate(validRoleInput), controller.updateHandler)
      .delete(controller.deleteHandler);
  }
}
