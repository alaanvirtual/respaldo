// src/domain/task-state.entity.ts - Patrón State para Ciclo de Vida de Tareas (Capítulo 12)
export interface TaskContext {
  setState(state: TaskState): void;
  getTaskId(): string;
}

export interface TaskState {
  startWork(context: TaskContext): void;
  submitForReview(context: TaskContext): void;
  approve(context: TaskContext): void;
  getStatusName(): string;
}

export class DraftTaskState implements TaskState {
  startWork(context: TaskContext): void {
    console.log(`[PMS] Tarea ${context.getTaskId()}: Iniciando desarrollo.`);
    context.setState(new InProgressTaskState());
  }

  submitForReview(context: TaskContext): void {
    throw new Error('Transición no permitida desde estado borrador.');
  }

  approve(context: TaskContext): void {
    throw new Error('Transición no permitida desde estado borrador.');
  }

  getStatusName(): string {
    return 'DRAFT';
  }
}

export class InProgressTaskState implements TaskState {
  startWork(context: TaskContext): void {
    console.log(`[PMS] Tarea ${context.getTaskId()} ya está en progreso.`);
  }

  submitForReview(context: TaskContext): void {
    console.log(`[PMS] Tarea ${context.getTaskId()}: Enviada a revisión.`);
    context.setState(new InReviewTaskState());
  }

  approve(context: TaskContext): void {
    throw new Error('Debe pasar por revisión antes de aprobar.');
  }

  getStatusName(): string {
    return 'IN_PROGRESS';
  }
}

export class InReviewTaskState implements TaskState {
  startWork(context: TaskContext): void {
    throw new Error('Tarea en revisión no puede reiniciarse directamente.');
  }

  submitForReview(context: TaskContext): void {
    console.log(`[PMS] Tarea ${context.getTaskId()} ya está en revisión.`);
  }

  approve(context: TaskContext): void {
    console.log(`[PMS] Tarea ${context.getTaskId()}: Aprobada exitosamente.`);
    context.setState(new CompletedTaskState());
  }

  getStatusName(): string {
    return 'IN_REVIEW';
  }
}

export class CompletedTaskState implements TaskState {
  startWork(context: TaskContext): void {
    throw new Error('Tarea completada no admite cambios.');
  }

  submitForReview(context: TaskContext): void {
    throw new Error('Tarea ya completada.');
  }

  approve(context: TaskContext): void {
    throw new Error('Tarea ya completada.');
  }

  getStatusName(): string {
    return 'COMPLETED';
  }
}

export class StatefulTaskEntity implements TaskContext {
  private state: TaskState;

  constructor(private id: string) {
    this.state = new DraftTaskState();
  }

  setState(state: TaskState): void {
    this.state = state;
  }

  getTaskId(): string {
    return this.id;
  }

  getStatus(): string {
    return this.state.getStatusName();
  }

  startWork(): void {
    this.state.startWork(this);
  }

  submitForReview(): void {
    this.state.submitForReview(this);
  }

  approve(): void {
    this.state.approve(this);
  }
}

// Alias para exportación compatible
export { StatefulTaskEntity as TaskEntity };
