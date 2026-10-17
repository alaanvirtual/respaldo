// src/commands/task.commands.ts - Patrón Command con capacidad de Undo (Capítulo 12)
export interface Command {
  execute(): Promise<void>;
  undo(): Promise<void>;
}

export class AssignUserCommand implements Command {
  constructor(
    private taskId: string,
    private newUserId: string,
    private previousUserId: string | null,
    private taskService: any
  ) {}

  async execute(): Promise<void> {
    if (this.taskService?.assign) {
      await this.taskService.assign(this.taskId, this.newUserId);
    }
    console.log(`[Command] Usuario ${this.newUserId} asignado a tarea ${this.taskId}`);
  }

  async undo(): Promise<void> {
    if (this.previousUserId) {
      if (this.taskService?.assign) {
        await this.taskService.assign(this.taskId, this.previousUserId);
      }
      console.log(`[Undo] Revertido a usuario ${this.previousUserId}`);
    } else {
      if (this.taskService?.unassign) {
        await this.taskService.unassign(this.taskId);
      }
      console.log(`[Undo] Asignación removida`);
    }
  }
}

export class CommandManager {
  private history: Command[] = [];

  async run(command: Command): Promise<void> {
    await command.execute();
    this.history.push(command);
  }

  async undoLast(): Promise<void> {
    const cmd = this.history.pop();
    if (cmd) {
      await cmd.undo();
    }
  }

  getHistoryLength(): number {
    return this.history.length;
  }
}
