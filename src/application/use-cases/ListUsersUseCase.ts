import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserResponseDTO } from '../dtos/UserDTO';

export class ListUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(): Promise<UserResponseDTO[]> {
    const users = await this.userRepository.findAll();
    return users.map((user) => ({
      id: user.id,
      fullname: user.fullname,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }));
  }
}
