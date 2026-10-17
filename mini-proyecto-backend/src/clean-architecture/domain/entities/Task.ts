// src/clean-architecture/domain/entities/Task.ts - Capa 1: Entidades y Reglas de Negocio (Capítulo 13)
export type CleanTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export class DomainTask {
  constructor(
    public readonly id: string,
    public title: string,
    public projectId: string,
    public assignedUserId: string,
    public status: CleanTaskStatus = 'PENDING',
    public createdAt: Date = new Date()
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.title || this.title.trim().length < 3) {
      throw new Error('El título de la tarea debe poseer al menos 3 caracteres.');
    }
    if (!this.projectId) {
      throw new Error('La tarea debe estar asociada a un proyecto válido.');
    }
  }

  public complete(): void {
    this.status = 'COMPLETED';
  }
}
