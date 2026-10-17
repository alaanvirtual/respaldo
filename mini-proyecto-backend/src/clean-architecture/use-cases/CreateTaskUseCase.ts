// src/clean-architecture/use-cases/CreateTaskUseCase.ts - Capa 2: Caso de Uso de Aplicación (Capítulo 13)
import { DomainTask } from '../domain/entities/Task';
import { ICleanTaskRepository } from '../domain/repositories/ITaskRepository';
import { v4 as uuidv4 } from 'uuid';

export interface CreateTaskDTO {
  title: string;
  projectId: string;
  assignedUserId: string;
}

export class CreateTaskUseCase {
  constructor(private readonly taskRepository: ICleanTaskRepository) {}

  public async execute(dto: CreateTaskDTO): Promise<DomainTask> {
    const taskId = uuidv4();
    const task = new DomainTask(
      taskId,
      dto.title,
      dto.projectId,
      dto.assignedUserId,
      'PENDING'
    );

    await this.taskRepository.save(task);
    return task;
  }
}
