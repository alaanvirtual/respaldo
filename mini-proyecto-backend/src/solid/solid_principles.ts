// src/solid/solid_principles.ts - Demostración exhaustiva de los principios SOLID (Capítulo 13)

// ==========================================
// 1. Single Responsibility Principle (SRP)
// ==========================================
export class TaskValidator {
  public static validateTitle(title: string): void {
    if (!title || title.trim().length < 3) {
      throw new Error('El título de la tarea debe tener al menos 3 caracteres.');
    }
  }
}

export interface INotificationPort {
  notifyTaskCreated(task: any, userEmail: string): Promise<void>;
}

export class TaskServiceWithSRP {
  constructor(
    private readonly repository: any,
    private readonly notificationPort: INotificationPort
  ) {}

  public async createTask(title: string, userEmail: string): Promise<any> {
    TaskValidator.validateTitle(title);
    const task = { id: 'task-' + Date.now(), title, userEmail, createdAt: new Date() };
    if (this.repository?.save) {
      await this.repository.save(task);
    }
    await this.notificationPort.notifyTaskCreated(task, userEmail);
    return task;
  }
}

// ==========================================
// 2. Open / Closed Principle (OCP)
// ==========================================
export interface ICostCalculator {
  calculateCost(task: { estimatedHours: number }): number;
}

export class StandardCostCalculator implements ICostCalculator {
  calculateCost(task: { estimatedHours: number }): number {
    return task.estimatedHours * 50;
  }
}

export class UrgentCostCalculator implements ICostCalculator {
  calculateCost(task: { estimatedHours: number }): number {
    return task.estimatedHours * 50 * 1.5; // Recargo del 50% por urgencia
  }
}

export class TaskCostService {
  constructor(private readonly calculator: ICostCalculator) {}

  public processCost(task: { estimatedHours: number }): number {
    return this.calculator.calculateCost(task);
  }
}

// ==========================================
// 3. Liskov Substitution Principle (LSP)
// ==========================================
export interface IBaseRepository<T> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<void>;
}

export class InMemoryRepository<T extends { id: string }> implements IBaseRepository<T> {
  protected items = new Map<string, T>();

  async findById(id: string): Promise<T | null> {
    return this.items.get(id) || null;
  }

  async save(entity: T): Promise<void> {
    this.items.set(entity.id, entity);
  }
}

// ==========================================
// 4. Interface Segregation Principle (ISP)
// ==========================================
export interface ITaskReader {
  getById(id: string): Promise<any | null>;
  listAll(): Promise<any[]>;
}

export interface ITaskWriter {
  save(task: any): Promise<void>;
  delete(id: string): Promise<void>;
}

export class TaskQueryService {
  constructor(private readonly reader: ITaskReader) {}

  public async fetchActiveTasks(): Promise<any[]> {
    return await this.reader.listAll();
  }
}

// ==========================================
// 5. Dependency Inversion Principle (DIP)
// ==========================================
export class HighLevelTaskCoordinator {
  // Depende de la abstracción ITaskReader, no de una base de datos concreta
  constructor(private readonly reader: ITaskReader) {}

  public async getSummary(): Promise<{ total: number }> {
    const list = await this.reader.listAll();
    return { total: list.length };
  }
}
