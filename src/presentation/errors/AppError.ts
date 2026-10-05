export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public static badRequest(message: string, details?: unknown): AppError {
    return new AppError(message, 400, true, details);
  }

  public static unauthorized(message: string = 'No autorizado'): AppError {
    return new AppError(message, 401, true);
  }

  public static forbidden(message: string = 'Acceso denegado'): AppError {
    return new AppError(message, 403, true);
  }

  public static notFound(message: string = 'Recurso no encontrado'): AppError {
    return new AppError(message, 404, true);
  }

  public static conflict(message: string, details?: unknown): AppError {
    return new AppError(message, 409, true, details);
  }

  public static internal(message: string = 'Error interno del servidor'): AppError {
    return new AppError(message, 500, false);
  }
}
