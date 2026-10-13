// src/components/projects/projects_routes.ts
import { Express } from 'express';
import { ProjectController } from './projects_controller';
import { authorize } from '../../utils/auth_util';
import { body } from 'express-validator';
import { validate } from '../../utils/validator';

export const validateCreateProject = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre del proyecto es obligatorio')
    .isLength({ min: 3, max: 60 }).withMessage('El nombre debe contener entre 3 y 60 caracteres'),
  body('startDate')
    .optional()
    .isISO8601().withMessage('La fecha de inicio debe tener un formato ISO8601 válido'),
  body('endDate')
    .optional()
    .isISO8601().withMessage('La fecha de fin debe tener un formato ISO8601 válido')
    .custom((endDate, { req }) => {
      if (req.body.startDate && new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error('La fecha de fin debe ser estrictamente posterior a la fecha de inicio');
      }
      return true;
    })
];

export class ProjectRoutes {
  private baseEndPoint = '/api/projects';

  constructor(app: Express) {
    const controller = new ProjectController();

    // Endpoint para transacción ACID atómica
    app.post(
      `${this.baseEndPoint}/transaccion-atomica`,
      authorize,
      validate(validateCreateProject),
      controller.createAtomicTransaction
    );

    // Endpoints RESTful estándar de proyectos
    app.route(this.baseEndPoint)
      .get(authorize, controller.getAll)
      .post(authorize, validate(validateCreateProject), controller.create);

    app.route(`${this.baseEndPoint}/:id`)
      .get(authorize, controller.getDetails)
      .put(authorize, controller.update)
      .delete(authorize, controller.delete);
  }
}
