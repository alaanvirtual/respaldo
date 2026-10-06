import { Request, Response, NextFunction } from 'express';
import { CreatePerfumeUseCase } from '../../application/use-cases/CreatePerfumeUseCase';
import { GetPerfumeByIdUseCase } from '../../application/use-cases/GetPerfumeByIdUseCase';
import { ListPerfumesUseCase } from '../../application/use-cases/ListPerfumesUseCase';
import { DeductStockUseCase } from '../../application/use-cases/DeductStockUseCase';
import { AppError } from '../errors/AppError';
import { wsServer } from '../websockets/WebSocketServer';

export class PerfumeController {
  constructor(
    private readonly createPerfumeUseCase: CreatePerfumeUseCase,
    private readonly getPerfumeByIdUseCase: GetPerfumeByIdUseCase,
    private readonly listPerfumesUseCase: ListPerfumesUseCase,
    private readonly deductStockUseCase: DeductStockUseCase,
  ) {}

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.createPerfumeUseCase.execute(req.body);
      
      // Notificación reactiva vía WebSockets
      wsServer.broadcast('PERFUME_CREATED', {
        id: result.id,
        name: result.name,
        brand: result.brand,
        stock: result.stock,
      });

      res.status(201).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { brand, concentration, minPrice, maxPrice, inStockOnly } = req.query as {
        brand?: string;
        concentration?: 'EDT' | 'EDP' | 'Parfum' | 'Extrait';
        minPrice?: number;
        maxPrice?: number;
        inStockOnly?: boolean;
      };

      const results = await this.listPerfumesUseCase.execute({
        brand,
        concentration,
        minPrice,
        maxPrice,
        inStockOnly,
      });

      res.status(200).json({
        status: 'success',
        results: results.length,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const result = await this.getPerfumeByIdUseCase.execute(id);

      if (!result) {
        throw AppError.notFound(`Perfume con ID '${id}' no encontrado.`);
      }

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public deductStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const { quantity } = req.body as { quantity: number };

      const result = await this.deductStockUseCase.execute(id, quantity);

      // Notificación reactiva vía WebSockets de cambio de stock
      wsServer.broadcast('PERFUME_STOCK_DEDUCTED', {
        id: result.id,
        deductedQuantity: quantity,
        newStock: result.stock,
      });

      res.status(200).json({
        status: 'success',
        message: `Se dedujeron ${quantity} unidades correctamente.`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
