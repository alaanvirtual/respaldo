import { Request, Response, NextFunction } from 'express';
import { JwtService, TokenPayload } from '../../infrastructure/security/JwtService';
import { AppError } from '../errors/AppError';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

const jwtService = new JwtService();

/**
 * Middleware perimetral de autenticación JWT.
 * Valida la cabecera 'Authorization: Bearer <token>' y decodifica la identidad del usuario.
 */
export function authMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(
      AppError.unauthorized('Token de autorización no suministrado. Utilice el esquema Bearer.'),
    );
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next(
      AppError.unauthorized('Formato de autorización inválido. Debe ser: Bearer <token>.'),
    );
  }

  const token = parts[1];
  if (!token) {
    return next(AppError.unauthorized('Token de autorización no suministrado.'));
  }

  try {
    const payload = jwtService.verify(token);
    req.user = payload;
    return next();
  } catch {
    return next(AppError.unauthorized('Token de acceso inválido o expirado.'));
  }
}
