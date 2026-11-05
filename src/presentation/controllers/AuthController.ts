import { Response, NextFunction } from 'express';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase';
import { CreateUserUseCase } from '../../application/use-cases/CreateUserUseCase';
import { GetUserByIdUseCase } from '../../application/use-cases/GetUserByIdUseCase';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { JwtService } from '../../infrastructure/security/JwtService';

export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly jwtService: JwtService = new JwtService(),
  ) {}

  public login = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.loginUseCase.execute(req.body);
      res.status(200).json({
        status: 'success',
        message: 'Sesión iniciada correctamente',
        data: result,
        token: result.token,
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  };

  public register = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = await this.createUserUseCase.execute(req.body);
      const token = this.jwtService.sign({
        userId: user.id,
        role: user.role,
        email: user.email,
      });

      res.status(201).json({
        status: 'success',
        message: 'Usuario registrado exitosamente',
        data: {
          user,
          token,
          accessToken: token,
        },
        token,
        accessToken: token,
        user,
      });
    } catch (error) {
      next(error);
    }
  };

  public profile = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ status: 'error', message: 'No autenticado' });
        return;
      }

      const user = await this.getUserByIdUseCase.execute(userId);
      res.status(200).json({
        status: 'success',
        data: user,
        user,
      });
    } catch (error) {
      next(error);
    }
  };
}
