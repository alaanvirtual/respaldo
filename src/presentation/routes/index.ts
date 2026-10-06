import { Router } from 'express';
import { healthRouter } from './health.routes';
import { createPerfumeRouter } from './perfume.routes';
import { createUserRouter } from './user.routes';
import { PerfumeController } from '../controllers/PerfumeController';
import { UserController } from '../controllers/UserController';

export function createApiRouter(
  perfumeController: PerfumeController,
  userController: UserController,
): Router {
  const apiRouter = Router();

  apiRouter.use('/health', healthRouter);
  apiRouter.use('/perfumes', createPerfumeRouter(perfumeController));
  apiRouter.use('/users', createUserRouter(userController));

  return apiRouter;
}
