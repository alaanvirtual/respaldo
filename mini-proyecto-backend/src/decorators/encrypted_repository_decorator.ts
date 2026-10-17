// src/decorators/encrypted_repository_decorator.ts - Patrón Decorator (Capítulo 11)
import { ITaskRepository, TaskEntity } from '../repositories/task_repository';
import { cryptoUtil } from '../utils/crypto_util';

export class EncryptedTaskRepositoryDecorator implements ITaskRepository {
  constructor(private readonly innerRepository: ITaskRepository) {}

  public async create(task: TaskEntity): Promise<TaskEntity> {
    // Cifrado de datos sensibles antes de persistir
    const encryptedDescription = cryptoUtil.encrypt(task.description);
    const taskToSave: TaskEntity = { ...task, description: encryptedDescription };

    const savedTask = await this.innerRepository.create(taskToSave);

    // Descifrado para retornar la entidad limpia al consumidor
    return { ...savedTask, description: task.description };
  }

  public async findById(id: string): Promise<TaskEntity | null> {
    const task = await this.innerRepository.findById(id);
    if (!task) return null;

    // Descifrado al recuperar del almacenamiento
    const decryptedDescription = cryptoUtil.decrypt(task.description);
    return { ...task, description: decryptedDescription };
  }
}
