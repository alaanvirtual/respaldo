// src/components/tasks/tasks_service.ts
import { AppDataSource } from '../../utils/db';
import { Tasks } from './tasks_entity';
import { Projects } from '../projects/projects_entity';
import { Users } from '../users/users_entity';

export class TaskService {
  private taskRepo = AppDataSource.getRepository(Tasks);

  public async createTask(taskData: Partial<Tasks>, projectId: string, assignedUserId?: string): Promise<Tasks> {
    const task = this.taskRepo.create({
      ...taskData,
      project: { project_id: projectId } as Projects,
      ...(assignedUserId ? { assignedUser: { user_id: assignedUserId } as Users } : {})
    });
    return await this.taskRepo.save(task);
  }

  public async updateTaskStatus(taskId: string, status: string): Promise<Tasks | null> {
    const task = await this.taskRepo.findOneBy({ task_id: taskId });
    if (!task) return null;
    task.status = status;
    return await this.taskRepo.save(task);
  }

  public async getTaskById(taskId: string): Promise<Tasks | null> {
    return await this.taskRepo.findOne({
      where: { task_id: taskId },
      relations: ['project', 'assignedUser']
    });
  }

  public async getAllTasks(queryParams: any = {}): Promise<Tasks[]> {
    const qb = this.taskRepo.createQueryBuilder('task')
      .leftJoinAndSelect('task.project', 'project')
      .leftJoinAndSelect('task.assignedUser', 'assignedUser');

    if (queryParams.projectId) {
      qb.andWhere('project.project_id = :projectId', { projectId: queryParams.projectId });
    }
    if (queryParams.status) {
      qb.andWhere('task.status = :status', { status: queryParams.status });
    }
    if (queryParams.priority) {
      qb.andWhere('task.priority = :priority', { priority: queryParams.priority });
    }

    qb.orderBy('task.created_at', 'DESC');
    return await qb.getMany();
  }

  public async updateTask(taskId: string, data: Partial<Tasks>): Promise<Tasks | null> {
    const task = await this.taskRepo.findOne({ where: { task_id: taskId } });
    if (!task) return null;
    this.taskRepo.merge(task, data);
    return await this.taskRepo.save(task);
  }

  public async deleteTask(taskId: string): Promise<boolean> {
    const result = await this.taskRepo.delete(taskId);
    return (result.affected ?? 0) > 0;
  }
}
