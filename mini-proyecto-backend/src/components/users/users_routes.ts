// src/components/users/users_routes.ts
import { Express } from 'express';
import { UserController } from './users_controller';
import { validate } from '../../utils/validator';
import { authorize } from '../../utils/auth_util';
import { body } from 'express-validator';

export const validUserInput = [
  body('fullname').trim().notEmpty().withMessage('El nombre completo es obligatorio'),
  body('username').trim().notEmpty().isLength({ min: 4, max: 30 }).withMessage('El usuario debe tener entre 4 y 30 caracteres'),
  body('email').isEmail().withMessage('Debe proporcionar un correo electrónico válido'),
  body('password')
    .isLength({ min: 6, max: 20 }).withMessage('La contraseña debe tener entre 6 y 20 caracteres')
    .isStrongPassword({ minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
    .withMessage('La contraseña debe incluir al menos una mayúscula, una minúscula, un número y un símbolo especial'),
  body('role_ids').optional().isArray().withMessage('Debe proporcionar un arreglo de UUIDs de roles válidos')
];

export const validLoginInput = [
  body('email').isEmail().withMessage('Correo electrónico inválido'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria')
];

export class UserRoutes {
  private baseEndPoint = '/api/users';

  constructor(app: Express) {
    const controller = new UserController();

    // Endpoints de autenticación
    app.post(`${this.baseEndPoint}/login`, validate(validLoginInput), controller.login);
    app.post(`${this.baseEndPoint}/forgot-password`, body('email').isEmail().withMessage('Debe ser un email válido'), controller.forgotPassword);
    app.post(`${this.baseEndPoint}/reset-password`, controller.resetPassword);

    // Endpoints de gestión de usuarios
    app.route(this.baseEndPoint)
      .get(authorize, controller.getAllHandler)
      .post(validate(validUserInput), controller.addHandler);

    app.route(`${this.baseEndPoint}/:id`)
      .get(authorize, controller.getOneHandler)
      .put(authorize, controller.updateHandler)
      .delete(authorize, controller.deleteHandler);
  }
}
