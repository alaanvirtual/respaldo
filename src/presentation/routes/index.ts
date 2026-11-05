import { Router } from 'express';
import { healthRouter } from './health.routes';
import { createPerfumeRouter } from './perfume.routes';
import { createUserRouter } from './user.routes';
import { createAuthRouter } from './auth.routes';
import { PerfumeController } from '../controllers/PerfumeController';
import { UserController } from '../controllers/UserController';
import { AuthController } from '../controllers/AuthController';

export function createApiRouter(
  perfumeController: PerfumeController,
  userController: UserController,
  authController?: AuthController,
): Router {
  const apiRouter = Router();

  apiRouter.use('/health', healthRouter);
  apiRouter.use('/perfumes', createPerfumeRouter(perfumeController));
  apiRouter.use('/users', createUserRouter(userController));

  if (authController) {
    apiRouter.use('/auth', createAuthRouter(authController));
  }

  return apiRouter;
}
