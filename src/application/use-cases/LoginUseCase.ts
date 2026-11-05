import { IUserRepository } from '../../domain/repositories/IUserRepository';
import {
  IPasswordHasher,
  BcryptPasswordHasher,
} from '../../infrastructure/security/PasswordHasher';
import { IJwtService, JwtService } from '../../infrastructure/security/JwtService';
import { LoginDTO, AuthResponseDTO } from '../dtos/AuthDTO';
import { AppError } from '../../presentation/errors/AppError';

export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher = new BcryptPasswordHasher(),
    private readonly jwtService: IJwtService = new JwtService(),
  ) {}

  public async execute(dto: LoginDTO): Promise<AuthResponseDTO> {
    const identifier = (dto.usernameOrEmail || dto.email || dto.username || '')
      .trim()
      .toLowerCase();

    if (!identifier) {
      throw AppError.badRequest('Debe proporcionar un correo electrónico o nombre de usuario.');
    }

    if (!dto.password) {
      throw AppError.badRequest('La contraseña es requerida.');
    }

    // Buscar por email o por username
    let user = await this.userRepository.findByEmail(identifier);
    if (!user) {
      user = await this.userRepository.findByUsername(identifier);
    }

    if (!user) {
      throw AppError.unauthorized('Credenciales inválidas. Verifique sus datos de acceso.');
    }

    const isPasswordValid = await this.passwordHasher.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw AppError.unauthorized('Credenciales inválidas. Verifique sus datos de acceso.');
    }

    const token = this.jwtService.sign({
      userId: user.id,
      role: user.role,
      email: user.email,
    });

    return {
      token,
      accessToken: token,
      user: {
        id: user.id,
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    };
  }
}
