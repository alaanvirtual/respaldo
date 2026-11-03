import { Request, Response, NextFunction } from 'express';
import { CreateUserUseCase } from '../../application/use-cases/CreateUserUseCase';
import { ListUsersUseCase } from '../../application/use-cases/ListUsersUseCase';
import { GetUserByIdUseCase } from '../../application/use-cases/GetUserByIdUseCase';
import { UpdateUserUseCase } from '../../application/use-cases/UpdateUserUseCase';
import { DeleteUserUseCase } from '../../application/use-cases/DeleteUserUseCase';
import { HateoasBuilder } from '../utils/hateoas';

export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.createUserUseCase.execute(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Usuario registrado exitosamente',
        data: user,
        _links: HateoasBuilder.forUser(user.id),
      });
    } catch (error) {
      next(error);
    }
  };

  public list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.listUsersUseCase.execute();
      res.status(200).json({
        status: 'success',
        results: users.length,
        data: users,
        _links: HateoasBuilder.forUserCollection(),
      });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.getUserByIdUseCase.execute(req.params.id!);
      res.status(200).json({
        status: 'success',
        data: user,
        _links: HateoasBuilder.forUser(user.id),
      });
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.updateUserUseCase.execute(req.params.id!, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Usuario actualizado exitosamente',
        data: user,
        _links: HateoasBuilder.forUser(user.id),
      });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deleteUserUseCase.execute(req.params.id!);
      res.status(200).json({
        status: 'success',
        message: 'Usuario eliminado exitosamente',
        _links: HateoasBuilder.forUserCollection(),
      });
    } catch (error) {
      next(error);
    }
  };
}
