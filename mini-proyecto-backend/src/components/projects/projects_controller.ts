// src/components/projects/projects_controller.ts
import { Request, Response, NextFunction } from 'express';
import { ProjectService } from './projects_service';

export class ProjectController {
  private projectService = new ProjectService();

  // POST /api/projects - Crear un proyecto regular
  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ownerId = req.user?.user_id || req.user?.userId || '';
      const newProject = await this.projectService.createProject(req.body, ownerId);

      res.status(201).json({
        statusCode: 201,
        status: 'success',
        message: 'Proyecto creado exitosamente',
        data: newProject
      });
    } catch (error: any) {
      if (error.code === '23505') {
        res.status(409).json({
          statusCode: 409,
          status: 'error',
          message: 'Conflicto: Ya existe un proyecto registrado con ese nombre'
        });
        return;
      }
      next(error);
    }
  };

  // POST /api/projects/transaccion-atomica - Crear proyecto con tarea inicial garantizando ACID
  public createAtomicTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ownerId = req.user?.user_id || req.user?.userId || '';
      const newProject = await this.projectService.createProjectWithDefaultTask(req.body, ownerId);

      res.status(201).json({
        statusCode: 201,
        status: 'success',
        message: 'Proyecto y tarea inicial creados atómicamente con éxito',
        data: newProject
      });
    } catch (error: any) {
      if (error.code === '23505') {
        res.status(409).json({
          statusCode: 409,
          status: 'error',
          message: 'Conflicto: Ya existe un proyecto registrado con ese nombre'
        });
        return;
      }
      next(error);
    }
  };

  // GET /api/projects - Consultar proyectos con filtros avanzados
  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const projects = await this.projectService.getAllProjectsCustom(req.query);
      res.status(200).json({
        statusCode: 200,
        status: 'success',
        results: projects.length,
        data: projects
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/projects/:id - Consultar detalle de proyecto
  public getDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const project = await this.projectService.getProjectById(id);
      if (!project) {
        res.status(404).json({
          statusCode: 404,
          status: 'error',
          message: 'Proyecto no encontrado'
        });
        return;
      }
      res.status(200).json({
        statusCode: 200,
        status: 'success',
        data: project
      });
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/projects/:id - Actualizar proyecto
  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updated = await this.projectService.updateProject(id, req.body);
      if (!updated) {
        res.status(404).json({
          statusCode: 404,
          status: 'error',
          message: 'Proyecto no encontrado para actualizar'
        });
        return;
      }
      res.status(200).json({
        statusCode: 200,
        status: 'success',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/projects/:id - Eliminar proyecto
  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.projectService.deleteProject(id);
      if (!deleted) {
        res.status(404).json({
          statusCode: 404,
          status: 'error',
          message: 'Proyecto no encontrado para eliminar'
        });
        return;
      }
      res.status(200).json({
        statusCode: 200,
        status: 'success',
        message: 'Proyecto eliminado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  };
}
