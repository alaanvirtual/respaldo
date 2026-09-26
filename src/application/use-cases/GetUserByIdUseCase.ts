import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserResponseDTO } from '../dtos/UserDTO';
import { AppError } from '../../presentation/errors/AppError';

export class GetUserByIdUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(id: string): Promise<UserResponseDTO> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw AppError.notFound(`Usuario con ID '${id}' no encontrado.`);
    }

    return {
      id: user.id,
      fullname: user.fullname,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
