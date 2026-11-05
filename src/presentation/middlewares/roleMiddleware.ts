import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import { AppError } from '../errors/AppError';
import { UserRole } from '../../domain/entities/User';

function normalizeRole(role: string): string {
  if (role === 'Admin') return 'Administrador';
  if (role === 'Customer') return 'Cliente';
  return role;
}

/**
 * Middleware para autorización y control de acceso basado en roles (RBAC).
 * Verifica que el usuario autenticado posea uno de los roles autorizados.
 */
export function requireRole(allowedRoles: UserRole[]) {
  const normalizedAllowed = allowedRoles.map((r) => normalizeRole(r));

  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized('Usuario no autenticado en el sistema.'));
    }

    const userRole = normalizeRole(req.user.role);

    if (!normalizedAllowed.includes(userRole)) {
      return next(
        AppError.forbidden(
          `Acceso denegado. Se requiere uno de los siguientes roles: [${allowedRoles.join(', ')}].`,
        ),
      );
    }

    return next();
  };
}
