import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError';
import { DomainError } from '../../domain/errors/DomainError';
import { InsufficientStockError } from '../../domain/errors/InsufficientStockError';
import { logger } from '../../infrastructure/logging/logger';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  // 1. Errores operacionales controlados (AppError)
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error(`[AppError No Operacional] ${err.message}`, {
        stack: err.stack,
        details: err.details,
      });
    }

    res.status(err.statusCode).json({
      status: 'error',
      statusCode: err.statusCode,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  // 2. Errores de validación Zod (Validación perimetral)
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }));

    res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Fallo en la validación de la solicitud',
      details: formattedErrors,
    });
    return;
  }

  // 3. Errores del Dominio (Clean Architecture Invariants)
  if (err instanceof DomainError) {
    const statusCode = err instanceof InsufficientStockError ? 409 : 400;

    res.status(statusCode).json({
      status: 'error',
      statusCode,
      message: err.message,
    });
    return;
  }

  // 4. Errores no controlados (500 Internal Server Error)
  logger.error(`[UnhandledError] ${err.message}`, {
    url: req.originalUrl,
    method: req.method,
    stack: err.stack,
  });

  const isProduction = process.env.NODE_ENV === 'production';

  res.status(500).json({
    status: 'error',
    statusCode: 500,
    message: 'Error interno en el servidor de BL FRAGANCIAS',
    ...(isProduction ? {} : { stack: err.stack }),
  });
}
