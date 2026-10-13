// src/components/tasks/tasks_controller.ts
import { Request, Response, NextFunction } from 'express';
import { TaskService } from './tasks_service';
import { ProjectsUtil } from '../../utils/projects_util';
import { NotificationUtil } from '../../utils/notification_util';
import { CacheUtil } from '../../utils/cache_util';

export class TaskController {
  private taskService = new TaskService();

  // POST /api/tasks - Crear tarea y notificar asíncronamente (Capítulo 8)
  public addHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId, assignedUserId, ...taskData } = req.body;
      const targetProjectId = projectId || req.body.project_id;
      const targetUserId = assignedUserId || req.body.user_id || req.user?.user_id;

      if (!targetProjectId) {
        res.status(400).json({
          statusCode: 400,
          status: 'error',
          message: 'El identificador de proyecto (projectId) es obligatorio'
        });
        return;
      }

      const newTask = await this.taskService.createTask(taskData, targetProjectId, targetUserId);

      // Guardar en caché de Redis (Capítulo 7)
      await CacheUtil.set('Task', newTask.task_id, newTask);

      // Encolar notificaciones asíncronas para cada miembro del proyecto (Capítulo 8)
      try {
        const memberEmails = await ProjectsUtil.getProjectMemberEmails(targetProjectId);
        for (const email of memberEmails) {
          await NotificationUtil.enqueueEmail(
            email,
            `Nueva Tarea Creada: ${newTask.name}`,
            `<p>Hola, se ha creado la tarea <b>${newTask.name}</b> en tu proyecto asignado.</p>`
          );
        }
      } catch (notifyErr: any) {
        console.warn('[WARN Notification] No se pudo encolar notificación:', notifyErr.message);
      }

      res.status(201).json({
        statusCode: 201,
        status: 'success',
        message: 'Tarea creada exitosamente',
        data: newTask
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/tasks - Consultar tareas
  public getAllHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tasks = await this.taskService.getAllTasks(req.query);
      res.status(200).json({
        statusCode: 200,
        status: 'success',
        results: tasks.length,
        data: tasks
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/tasks/:id - Consultar detalle de tarea con lectura previa de caché (Capítulo 7)
  public getDetailsHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      // 1. Verificar en caché
      const cachedTask = await CacheUtil.get('Task', id);
      if (cachedTask) {
        res.status(200).json({
          statusCode: 200,
          status: 'success',
          cached: true,
          data: cachedTask
        });
        return;
      }

      // 2. Consulta en base de datos
      const task = await this.taskService.getTaskById(id);
      if (!task) {
        res.status(404).json({
          statusCode: 404,
          status: 'error',
          message: 'Tarea no encontrada'
        });
        return;
      }

      // 3. Guardar en caché
      await CacheUtil.set('Task', id, task);

      res.status(200).json({
        statusCode: 200,
        status: 'success',
        data: task
      });
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/tasks/:id - Actualizar datos de tarea e invalidar caché
  public updateHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updated = await this.taskService.updateTask(id, req.body);
      if (!updated) {
        res.status(404).json({
          statusCode: 404,
          status: 'error',
          message: 'Tarea no encontrada para actualizar'
        });
        return;
      }

      // Actualizar en caché
      await CacheUtil.set('Task', id, updated);

      res.status(200).json({
        statusCode: 200,
        status: 'success',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  };

  // PATCH /api/tasks/:id/status - Actualizar estado y notificar cambio (Capítulos 6 y 8)
  public updateStatusHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status) {
        res.status(400).json({
          statusCode: 400,
          status: 'error',
          message: 'El nuevo estado (status) es requerido'
        });
        return;
      }

      const updated = await this.taskService.updateTaskStatus(id, status);
      if (!updated) {
        res.status(404).json({
          statusCode: 404,
          status: 'error',
          message: 'Tarea no encontrada'
        });
        return;
      }

      // Actualizar en caché
      await CacheUtil.set('Task', id, updated);

      // Notificar cambio de estado asíncronamente
      try {
        if (updated.project?.project_id) {
          const memberEmails = await ProjectsUtil.getProjectMemberEmails(updated.project.project_id);
          for (const email of memberEmails) {
            await NotificationUtil.enqueueEmail(
              email,
              `Estado de Tarea Actualizado: ${updated.name}`,
              `<p>La tarea <b>${updated.name}</b> ha cambiado su estado a <b>${status}</b>.</p>`
            );
          }
        }
      } catch (err: any) {
        console.warn('[WARN Notification]:', err.message);
      }

      res.status(200).json({
        statusCode: 200,
        status: 'success',
        message: 'Estado de la tarea actualizado exitosamente',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/tasks/:id - Eliminar tarea e invalidar caché
  public deleteHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.taskService.deleteTask(id);
      if (!deleted) {
        res.status(404).json({
          statusCode: 404,
          status: 'error',
          message: 'Tarea no encontrada para eliminar'
        });
        return;
      }

      // Invalidar en caché
      await CacheUtil.remove('Task', id);

      res.status(200).json({
        statusCode: 200,
        status: 'success',
        message: 'Tarea eliminada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  };
}
