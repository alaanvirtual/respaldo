import { Router, Response } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateRequest } from '../middlewares/validateRequest';
import { loginBodySchema, registerBodySchema } from '../schemas/auth.schema';
import { authMiddleware, AuthenticatedRequest } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';

export function createAuthRouter(controller: AuthController): Router {
  const router = Router();

  // POST /api/v1/auth/login - Inicio de sesión seguro con JWT (200, 401)
  router.post('/login', validateRequest({ body: loginBodySchema }), controller.login);

  // POST /api/v1/auth/register - Registro de nuevo usuario (201, 400)
  router.post('/register', validateRequest({ body: registerBodySchema }), controller.register);

  // GET /api/v1/auth/profile - Perfil de usuario autenticado mediante Bearer JWT (200, 401)
  router.get('/profile', authMiddleware, controller.profile);

  // GET /api/v1/auth/me - Alias para perfil
  router.get('/me', authMiddleware, controller.profile);

  // GET /api/v1/auth/admin-check - Ruta de verificación de RBAC (Rol Administrador)
  router.get(
    '/admin-check',
    authMiddleware,
    requireRole(['Administrador', 'Admin']),
    (req: AuthenticatedRequest, res: Response) => {
      res.status(200).json({
        status: 'success',
        message: 'Acceso autorizado como Administrador.',
        user: req.user,
      });
    },
  );

  // GET /api/v1/auth/fraccionador-check - Ruta de verificación de RBAC (Rol Fraccionador)
  router.get(
    '/fraccionador-check',
    authMiddleware,
    requireRole(['Operador de Envíos / Fraccionador', 'Administrador', 'Admin']),
    (req: AuthenticatedRequest, res: Response) => {
      res.status(200).json({
        status: 'success',
        message: 'Acceso autorizado para Operador de Envíos / Fraccionador.',
        user: req.user,
      });
    },
  );

  return router;
}
