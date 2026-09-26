import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { AppError } from '../../presentation/errors/AppError';

export class DeleteUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw AppError.notFound(`Usuario con ID '${id}' no encontrado.`);
    }

    await this.userRepository.delete(id);
  }
}
