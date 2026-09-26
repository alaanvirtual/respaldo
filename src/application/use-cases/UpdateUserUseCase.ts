import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UpdateUserDTO, UserResponseDTO } from '../dtos/UserDTO';
import { AppError } from '../../presentation/errors/AppError';

export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(id: string, dto: UpdateUserDTO): Promise<UserResponseDTO> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw AppError.notFound(`Usuario con ID '${id}' no encontrado.`);
    }

    if (dto.email && dto.email.toLowerCase() !== user.email.toLowerCase()) {
      const emailExists = await this.userRepository.findByEmail(dto.email);
      if (emailExists) {
        throw AppError.conflict(
          `El correo electrónico '${dto.email}' ya está registrado por otro usuario.`,
        );
      }
    }

    if (dto.fullname || dto.email) {
      user.updateProfile(dto.fullname ?? user.fullname, dto.email ?? user.email);
    }

    if (dto.role) {
      user.changeRole(dto.role);
    }

    await this.userRepository.update(user);

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
