import { Request, Response } from 'express';
import path from 'node:path';
import { WorkerPool } from '../utils/worker_pool';

const workerExtension = path.extname(__filename) === '.ts' ? '.ts' : '.js';
const workerPath = path.join(__dirname, `../workers/analytics_worker${workerExtension}`);

// Inicializamos un pool de 4 hilos apuntando al worker
let pool: WorkerPool | null = null;

function getPoolInstance(): WorkerPool {
  if (!pool) {
    pool = new WorkerPool(workerPath, 4);
  }
  return pool;
}

export class AnalyticsController {
  public static async getProjectMetricsHandler(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const sampleSize = req.query.sampleSize ? parseInt(req.query.sampleSize as string, 10) : 50000;

      // Delegamos el cómputo intensivo al pool de Worker Threads
      const metrics = await getPoolInstance().runTask({ projectId, sampleSize });

      res.status(200).json({
        success: true,
        data: metrics
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error procesando analíticas del proyecto',
        error: error.message
      });
    }
  }

  public static async closePool(): Promise<void> {
    if (pool) {
      await pool.destroy();
      pool = null;
    }
  }
}
