import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { validateRequest } from '../middlewares/validateRequest';
import { createUserSchema, updateUserSchema, userIdParamSchema } from '../schemas/user.schema';

export function createUserRouter(controller: UserController): Router {
  const router = Router();

  // POST /api/users - Registrar usuario
  router.post('/', validateRequest({ body: createUserSchema.shape.body }), controller.create);

  // GET /api/users - Listar todos los usuarios
  router.get('/', controller.list);

  // GET /api/users/:id - Detalle de usuario por ID
  router.get(
    '/:id',
    validateRequest({ params: userIdParamSchema.shape.params }),
    controller.getById,
  );

  // PUT /api/users/:id - Actualizar datos de usuario
  router.put(
    '/:id',
    validateRequest({
      params: updateUserSchema.shape.params,
      body: updateUserSchema.shape.body,
    }),
    controller.update,
  );

  // DELETE /api/users/:id - Eliminar usuario
  router.delete(
    '/:id',
    validateRequest({ params: userIdParamSchema.shape.params }),
    controller.delete,
  );

  return router;
}
