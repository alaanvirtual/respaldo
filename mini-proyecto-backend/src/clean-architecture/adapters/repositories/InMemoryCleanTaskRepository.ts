// src/clean-architecture/adapters/repositories/InMemoryCleanTaskRepository.ts - Capa 3: Adaptador de Repositorio
import { ICleanTaskRepository } from '../../domain/repositories/ITaskRepository';
import { DomainTask } from '../../domain/entities/Task';

export class InMemoryCleanTaskRepository implements ICleanTaskRepository {
  private items = new Map<string, DomainTask>();

  public async save(task: DomainTask): Promise<void> {
    this.items.set(task.id, task);
  }

  public async findById(id: string): Promise<DomainTask | null> {
    return this.items.get(id) || null;
  }

  public async findByProjectId(projectId: string): Promise<DomainTask[]> {
    return Array.from(this.items.values()).filter((t) => t.projectId === projectId);
  }
}
