// src/components/projects/projects_service.ts
import { AppDataSource } from '../../utils/db';
import { Projects } from './projects_entity';
import { Users } from '../users/users_entity';
import { Tasks } from '../tasks/tasks_entity';

export class ProjectService {
  private projectRepo = AppDataSource.getRepository(Projects);

  public async createProject(projectData: Partial<Projects>, ownerId: string): Promise<Projects> {
    const project = this.projectRepo.create({
      ...projectData,
      owner: { user_id: ownerId } as Users
    });
    return await this.projectRepo.save(project);
  }

  public async getProjectById(projectId: string): Promise<Projects | null> {
    return await this.projectRepo.findOne({
      where: { project_id: projectId },
      relations: ['owner', 'tasks']
    });
  }

  public async deleteProject(projectId: string): Promise<boolean> {
    const result = await this.projectRepo.delete(projectId);
    return (result.affected ?? 0) > 0;
  }

  public async updateProject(projectId: string, data: Partial<Projects>): Promise<Projects | null> {
    const project = await this.projectRepo.findOne({ where: { project_id: projectId } });
    if (!project) return null;
    this.projectRepo.merge(project, data);
    return await this.projectRepo.save(project);
  }

  public async getAllProjectsCustom(queryParams: any = {}): Promise<Projects[]> {
    const qb = this.projectRepo.createQueryBuilder('project')
      .leftJoinAndSelect('project.owner', 'owner')
      .leftJoinAndSelect('project.tasks', 'task')
      .select([
        'project.project_id',
        'project.name',
        'project.description',
        'project.status',
        'project.created_at',
        'owner.user_id',
        'owner.username',
        'owner.email',
        'task.task_id',
        'task.name',
        'task.status'
      ]);

    if (queryParams.status) {
      qb.andWhere('project.status = :status', { status: queryParams.status });
    }

    if (queryParams.search) {
      qb.andWhere('project.name ILIKE :search', { search: `%${queryParams.search}%` });
    }

    qb.orderBy('project.created_at', 'DESC');
    return await qb.getMany();
  }

  // Transacción ACID multi-objeto con QueryRunner (Capítulo 6, Sección 5)
  public async createProjectWithDefaultTask(projectData: any, ownerId: string): Promise<Projects> {
    const queryRunner = AppDataSource.createQueryRunner();

    // 1. Conexión e inicio explícito de la transacción SQL
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 2. Inserción de la entidad Proyecto
      const project = queryRunner.manager.create(Projects, {
        ...projectData,
        owner: { user_id: ownerId } as Users
      });
      const savedProject = await queryRunner.manager.save(project);

      // 3. Inserción de la Tarea Inicial por Defecto
      const defaultTask = queryRunner.manager.create(Tasks, {
        name: 'Planificación Inicial y Configuración',
        description: 'Tarea generada automáticamente al crear el proyecto',
        status: 'Not-Started',
        priority: 'High',
        project: savedProject,
        assignedUser: { user_id: ownerId } as Users
      });
      await queryRunner.manager.save(defaultTask);

      // 4. Confirmación atómica de todos los cambios
      await queryRunner.commitTransaction();
      return savedProject;
    } catch (error) {
      // 5. Reversión completa en caso de cualquier excepción (Rollback)
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // 6. Liberación obligatoria del cliente del pool de conexiones
      await queryRunner.release();
    }
  }
}
