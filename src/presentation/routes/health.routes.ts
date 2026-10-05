import { Router, Request, Response } from 'express';

export const healthRouter = Router();

/**
 * @route   GET /api/health
 * @desc    Health check del sistema y verificación de operatividad
 * @access  Public
 */
healthRouter.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    system: 'BL FRAGANCIAS API',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
  });
});
