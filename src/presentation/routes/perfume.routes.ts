import { Router } from 'express';
import { PerfumeController } from '../controllers/PerfumeController';
import { validateRequest } from '../middlewares/validateRequest';
import {
  createPerfumeSchema,
  getPerfumesQuerySchema,
  perfumeIdParamSchema,
  deductStockSchema,
} from '../schemas/perfume.schema';

export function createPerfumeRouter(controller: PerfumeController): Router {
  const router = Router();

  // POST /api/perfumes - Crear nueva fragancia
  router.post('/', validateRequest({ body: createPerfumeSchema.shape.body }), controller.create);

  // GET /api/perfumes - Listar fragancias con filtros
  router.get(
    '/',
    validateRequest({ query: getPerfumesQuerySchema.shape.query }),
    controller.getAll,
  );

  // GET /api/perfumes/:id - Detalle de fragancia
  router.get(
    '/:id',
    validateRequest({ params: perfumeIdParamSchema.shape.params }),
    controller.getById,
  );

  // POST /api/perfumes/:id/deduct-stock - Reducción de stock (regla de negocio / compras)
  router.post(
    '/:id/deduct-stock',
    validateRequest({
      params: deductStockSchema.shape.params,
      body: deductStockSchema.shape.body,
    }),
    controller.deductStock,
  );

  return router;
}
