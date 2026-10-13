// src/utils/projects_util.ts - Utilitario de Proyectos para Notificaciones (Capítulo 8)
import { AppDataSource } from './db';
import { Projects } from '../components/projects/projects_entity';
import { Users } from '../components/users/users_entity';
import { In } from 'typeorm';

export class ProjectsUtil {
  /**
   * Recupera los correos electrónicos de los miembros y propietario asignados a un proyecto
   */
  public static async getProjectMemberEmails(projectId: string): Promise<string[]> {
    if (!AppDataSource.isInitialized) return [];

    const projectRepo = AppDataSource.getRepository(Projects);
    const project = await projectRepo.findOne({
      where: { project_id: projectId },
      relations: ['owner']
    });

    if (!project) return [];

    const emails: string[] = [];

    // Agregar email del propietario del proyecto
    if (project.owner && project.owner.email) {
      emails.push(project.owner.email);
    }

    // Agregar emails de los usuarios colaboradores en user_ids
    if (Array.isArray(project.user_ids) && project.user_ids.length > 0) {
      const userRepo = AppDataSource.getRepository(Users);
      const members = await userRepo.find({
        where: { user_id: In(project.user_ids) }
      });
      members.forEach((m) => {
        if (m.email && !emails.includes(m.email)) {
          emails.push(m.email);
        }
      });
    }

    return emails;
  }
}
