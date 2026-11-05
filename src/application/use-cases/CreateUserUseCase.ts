import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import {
  IPasswordHasher,
  BcryptPasswordHasher,
} from '../../infrastructure/security/PasswordHasher';
import { CreateUserDTO, UserResponseDTO } from '../dtos/UserDTO';
import { AppError } from '../../presentation/errors/AppError';

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher = new BcryptPasswordHasher(),
  ) {}

  public async execute(dto: CreateUserDTO): Promise<UserResponseDTO> {
    const existingEmail = await this.userRepository.findByEmail(dto.email);
    if (existingEmail) {
      throw AppError.conflict(`El correo electrónico '${dto.email}' ya está registrado.`);
    }

    const existingUsername = await this.userRepository.findByUsername(dto.username);
    if (existingUsername) {
      throw AppError.conflict(`El nombre de usuario '${dto.username}' ya está en uso.`);
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);

    const user = User.create({
      fullname: dto.fullname,
      username: dto.username,
      email: dto.email,
      passwordHash,
      role: dto.role ?? 'Cliente',
    });

    await this.userRepository.save(user);

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
