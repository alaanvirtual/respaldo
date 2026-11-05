import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './docs/swaggerDocument';
import { errorHandler } from './middlewares/errorHandler';
import { AppError } from './errors/AppError';
import { createApiRouter } from './routes';
import { PerfumeController } from './controllers/PerfumeController';
import { UserController } from './controllers/UserController';
import { AuthController } from './controllers/AuthController';
import { CreatePerfumeUseCase } from '../application/use-cases/CreatePerfumeUseCase';
import { GetPerfumeByIdUseCase } from '../application/use-cases/GetPerfumeByIdUseCase';
import { ListPerfumesUseCase } from '../application/use-cases/ListPerfumesUseCase';
import { DeductStockUseCase } from '../application/use-cases/DeductStockUseCase';
import { CreateUserUseCase } from '../application/use-cases/CreateUserUseCase';
import { ListUsersUseCase } from '../application/use-cases/ListUsersUseCase';
import { GetUserByIdUseCase } from '../application/use-cases/GetUserByIdUseCase';
import { UpdateUserUseCase } from '../application/use-cases/UpdateUserUseCase';
import { DeleteUserUseCase } from '../application/use-cases/DeleteUserUseCase';
import { LoginUseCase } from '../application/use-cases/LoginUseCase';
import { IPerfumeRepository } from '../domain/repositories/IPerfumeRepository';
import { IUserRepository } from '../domain/repositories/IUserRepository';
import { InMemoryUserRepository } from '../infrastructure/persistence/repositories/InMemoryUserRepository';
import { logger } from '../infrastructure/logging/logger';

export interface AppDependencies {
  perfumeRepository: IPerfumeRepository;
  userRepository?: IUserRepository;
}

export function createApp(dependencies: AppDependencies): Application {
  const app: Application = express();

  // 1. Middlewares de Seguridad y Rendimiento
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );
  app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'] }));
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 2. Logging Estructurado de peticiones HTTP
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info(`[HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });
    next();
  });

  // 3. Inyección de Dependencias de Casos de Uso y Controladores
  const userRepo = dependencies.userRepository ?? new InMemoryUserRepository();

  const createPerfumeUseCase = new CreatePerfumeUseCase(dependencies.perfumeRepository);
  const getPerfumeByIdUseCase = new GetPerfumeByIdUseCase(dependencies.perfumeRepository);
  const listPerfumesUseCase = new ListPerfumesUseCase(dependencies.perfumeRepository);
  const deductStockUseCase = new DeductStockUseCase(dependencies.perfumeRepository);

  const perfumeController = new PerfumeController(
    createPerfumeUseCase,
    getPerfumeByIdUseCase,
    listPerfumesUseCase,
    deductStockUseCase,
  );

  const createUserUseCase = new CreateUserUseCase(userRepo);
  const listUsersUseCase = new ListUsersUseCase(userRepo);
  const getUserByIdUseCase = new GetUserByIdUseCase(userRepo);
  const updateUserUseCase = new UpdateUserUseCase(userRepo);
  const deleteUserUseCase = new DeleteUserUseCase(userRepo);
  const loginUseCase = new LoginUseCase(userRepo);

  const userController = new UserController(
    createUserUseCase,
    listUsersUseCase,
    getUserByIdUseCase,
    updateUserUseCase,
    deleteUserUseCase,
  );

  const authController = new AuthController(loginUseCase, createUserUseCase, getUserByIdUseCase);

  // 4. Documentación Interactiva Swagger / OpenAPI 3.0 (en /api/docs y /api/v1/docs)
  const serveSwagger = (prefix: string) => {
    app.get(`${prefix}/docs/swagger.json`, (_req: Request, res: Response) => {
      res.status(200).json(swaggerDocument);
    });
    app.get(`${prefix}/docs.json`, (_req: Request, res: Response) => {
      res.status(200).json(swaggerDocument);
    });
    app.use(`${prefix}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  };

  serveSwagger('/api');
  serveSwagger('/api/v1');

  // 5. Registro de Rutas Perimetrales de la API (en /api/v1 y /api para compatibilidad total)
  const apiRouter = createApiRouter(perfumeController, userController, authController);
  app.use('/api/v1', apiRouter);
  app.use('/api', apiRouter);

  // 6. Manejador de rutas no encontradas (404)
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(AppError.notFound(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
  });

  // 7. Manejador centralizado de errores
  app.use(errorHandler);

  return app;
}
