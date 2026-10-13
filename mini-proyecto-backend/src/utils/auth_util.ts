/// <reference path="../@types/custom.d.ts" />
// src/utils/auth_util.ts - Utilitario y Middleware de Autenticación JWT (Capítulos 5 y 9)
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { SERVER_CONST } from './common';
import { RolesUtil } from '../components/roles/roles_controller';
import { UsersUtil } from './users_util';

export type AuthenticatedRequest = Request;

export class AuthUtil {
  public static generateAccessToken(payload: any): string {
    return jwt.sign(payload, SERVER_CONST.JWTSECRET, {
      expiresIn: SERVER_CONST.ACCESS_TOKEN_EXPIRY_TIME_SECONDS
    });
  }

  public static verifyToken(token: string): any {
    return jwt.verify(token, SERVER_CONST.JWTSECRET);
  }
}

export const authorize = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ statusCode: 401, status: 'error', message: 'Token de autorización ausente' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = AuthUtil.verifyToken(token) as any;
    let rights: string[] = [];

    if (decoded.role === 'SuperAdmin') {
      rights = RolesUtil.getAllPermissionsFromRights();
    }

    const username = decoded.username || decoded.userId;
    const user = await UsersUtil.getUserFromUsername(username);
    if (user) {
      const userRights = await RolesUtil.getAllRightsFromRoles(user.role_id || (user as any).role_ids);
      rights = Array.from(new Set([...rights, ...userRights]));
    }

    req.user = {
      user_id: user?.user_id || decoded.userId || 'admin-uuid',
      userId: user?.user_id || decoded.userId || 'admin-uuid',
      username: user?.username || username || 'admin',
      email: user?.email || decoded.email || 'admin@pms.local',
      rights
    };
    next();
  } catch (error) {
    return res.status(401).json({ statusCode: 401, status: 'error', message: 'Token de autorización inválido o expirado' });
  }
};

export const hasPermission = (userRights: string[] | undefined, requiredRight: string): boolean => {
  if (!userRights || !Array.isArray(userRights)) return false;
  return userRights.includes(requiredRight);
};
