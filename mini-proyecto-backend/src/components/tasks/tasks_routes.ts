// src/components/tasks/tasks_routes.ts
import { Express } from 'express';
import { TaskController } from './tasks_controller';
import { authorize } from '../../utils/auth_util';
import { body } from 'express-validator';
import { validate } from '../../utils/validator';

export const validateCreateTask = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre de la tarea es obligatorio')
    .isLength({ min: 3, max: 60 }).withMessage('El nombre debe tener entre 3 y 60 caracteres')
];

export class TaskRoutes {
  private baseEndPoint = '/api/tasks';

  constructor(app: Express) {
    const controller = new TaskController();

    // Endpoint especializado para actualización de estado
    app.patch(`${this.baseEndPoint}/:id/status`, authorize, controller.updateStatusHandler);

    // Endpoints REST estándar
    app.route(this.baseEndPoint)
      .get(authorize, controller.getAllHandler)
      .post(authorize, validate(validateCreateTask), controller.addHandler);

    app.route(`${this.baseEndPoint}/:id`)
      .get(authorize, controller.getDetailsHandler)
      .put(authorize, controller.updateHandler)
      .delete(authorize, controller.deleteHandler);
  }
}
