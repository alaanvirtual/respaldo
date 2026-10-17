// src/repositories/task_repository.ts - Interfaces y repositorio base para decoradores
export interface TaskEntity {
  id: string;
  title: string;
  description: string;
  status?: string;
}

export interface ITaskRepository {
  create(task: TaskEntity): Promise<TaskEntity>;
  findById(id: string): Promise<TaskEntity | null>;
}

export class InMemoryTaskRepository implements ITaskRepository {
  private items = new Map<string, TaskEntity>();

  public async create(task: TaskEntity): Promise<TaskEntity> {
    this.items.set(task.id, { ...task });
    return { ...task };
  }

  public async findById(id: string): Promise<TaskEntity | null> {
    const found = this.items.get(id);
    return found ? { ...found } : null;
  }
}
