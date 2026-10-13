// src/components/comments/comments_controller.ts
import { Request, Response } from 'express';
import { CommentsService } from './comments_service';

export class CommentController {
  private service = new CommentsService();

  public getAllHandler = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.findAll(req.query);
    res.status(result.statusCode).json(result);
  };

  public getDetailsHandler = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await this.service.findOne(id);
    res.status(result.statusCode).json(result);
  };

  public addHandler = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.create(req.body);
    res.status(result.statusCode).json(result);
  };

  public updateHandler = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await this.service.update(id, req.body);
    res.status(result.statusCode).json(result);
  };

  public deleteHandler = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await this.service.delete(id);
    res.status(result.statusCode).json(result);
  };
}
