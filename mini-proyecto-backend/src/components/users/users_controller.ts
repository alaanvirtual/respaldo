/// <reference path="../../@types/custom.d.ts" />
// src/components/users/users_controller.ts
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { UsersService } from './users_service';
import { Users } from './users_entity';
import { AppDataSource } from '../../utils/db';
import { encryptString, bcryptCompare, SERVER_CONST } from '../../utils/common';
import { hasPermission } from '../../utils/auth_util';
import { sendMail } from '../../utils/email_util';
import { CacheUtil } from '../../utils/cache_util';
import { UsersUtil } from '../../utils/users_util';

export { UsersUtil };

export class UserController {
  private service = new UsersService();

  // Autenticación de usuario y generación de tokens JWT
  public login = async (req: Request, res: Response): Promise<void> => {
    if (!AppDataSource.isInitialized) {
      res.status(503).json({
        statusCode: 503,
        status: 'error',
        message: 'Servicio de base de datos no disponible (PostgreSQL no conectado)'
      });
      return;
    }

    const { email, password } = req.body;
    const userRepo = AppDataSource.getRepository(Users);
    const user = await userRepo.findOne({ where: { email } });

    if (!user) {
      res.status(404).json({
        statusCode: 404,
        status: 'error',
        message: 'Correo electrónico no encontrado'
      });
      return;
    }

    const isPasswordValid = await bcryptCompare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({
        statusCode: 400,
        status: 'error',
        message: 'Contraseña incorrecta'
      });
      return;
    }

    const accessToken = jwt.sign(
      { user_id: user.user_id, email: user.email, username: user.username },
      SERVER_CONST.JWTSECRET,
      { expiresIn: SERVER_CONST.ACCESS_TOKEN_EXPIRY_TIME_SECONDS }
    );

    const refreshToken = jwt.sign(
      { user_id: user.user_id, email: user.email, username: user.username },
      SERVER_CONST.JWTSECRET,
      { expiresIn: SERVER_CONST.REFRESH_TOKEN_EXPIRY_TIME_SECONDS }
    );

    res.status(200).json({
      statusCode: 200,
      status: 'success',
      data: { accessToken, refreshToken }
    });
  };

  // Obtener lista de usuarios (protegido por RBAC y eliminando contraseña)
  public getAllHandler = async (req: Request, res: Response): Promise<void> => {
    if (req.user && !hasPermission(req.user.rights, 'get_all_users')) {
      res.status(403).json({
        statusCode: 403,
        status: 'error',
        message: 'No tiene permisos para consultar usuarios'
      });
      return;
    }

    const result = await this.service.findAll(req.query);
    if (result.statusCode === 200 && Array.isArray(result.data)) {
      result.data.forEach((user: any) => delete user.password);
    }
    res.status(result.statusCode).json(result);
  };

  // Consulta de usuario por ID con lectura previa de caché (Cache-Aside - Capítulo 7)
  public getOneHandler = async (req: Request, res: Response): Promise<void> => {
    if (req.user && !hasPermission(req.user.rights, 'get_details_user')) {
      res.status(403).json({
        statusCode: 403,
        status: 'error',
        message: 'No tiene permisos para consultar detalles de usuario'
      });
      return;
    }

    const userId = req.params.id;

    // 1. Intentar recuperar desde caché de Redis
    const userFromCache = await CacheUtil.get('User', userId);
    if (userFromCache) {
      res.status(200).json({
        statusCode: 200,
        status: 'success',
        cached: true,
        data: userFromCache
      });
      return;
    }

    // 2. Fallo de Caché (Cache Miss): consultar base de datos PostgreSQL
    const result = await this.service.findOne(userId);
    if (result.statusCode === 200 && result.data) {
      // Eliminar campo sensible antes de guardar en caché
      delete (result.data as any).password;
      // 3. Almacenar resultado en caché para futuras peticiones
      await CacheUtil.set('User', userId, result.data);
    }
    res.status(result.statusCode).json(result);
  };

  public getDetailsHandler = async (req: Request, res: Response): Promise<void> => {
    return this.getOneHandler(req, res);
  };

  // Crear nuevo usuario (con hashing de contraseña)
  public addHandler = async (req: Request, res: Response): Promise<void> => {
    const userData = { ...req.body };
    if (userData.password) {
      userData.password = await encryptString(userData.password);
    }
    if (Array.isArray(userData.role_ids) && userData.role_ids.length > 0) {
      userData.role_id = userData.role_ids[0];
    }

    const result = await this.service.create(userData);
    if (result.statusCode === 201 && result.data) {
      delete (result.data as any).password;
      // Almacenar en caché al crearse
      await CacheUtil.set('User', (result.data as any).user_id, result.data);
    }
    res.status(result.statusCode).json(result);
  };

  // Actualizar usuario con invalidación/actualización de caché
  public updateHandler = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateData = { ...req.body };
    if (updateData.password) {
      updateData.password = await encryptString(updateData.password);
    }

    const result = await this.service.update(id, updateData);
    if (result.statusCode === 200 && result.data) {
      delete (result.data as any).password;
      // Actualizar la caché
      await CacheUtil.set('User', id, result.data);
    }
    res.status(result.statusCode).json(result);
  };

  // Eliminación de usuario con invalidación automática de caché (Capítulo 7)
  public deleteHandler = async (req: Request, res: Response): Promise<void> => {
    if (req.user && !hasPermission(req.user.rights, 'delete_user')) {
      res.status(403).json({
        statusCode: 403,
        status: 'error',
        message: 'No tiene permisos para eliminar usuarios'
      });
      return;
    }

    const { id } = req.params;
    const result = await this.service.delete(id);

    if (result.statusCode === 200) {
      // Invalidar y remover la entidad eliminada de Redis
      await CacheUtil.remove('User', id);
    }
    res.status(result.statusCode).json(result);
  };

  // Solicitud de recuperación de contraseña por correo
  public forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    const user = await UsersUtil.getUserByEmail(email);
    if (!user) {
      res.status(404).json({
        statusCode: 404,
        status: 'error',
        message: 'Correo electrónico no registrado'
      });
      return;
    }

    const resetToken = jwt.sign({ email: user.email }, SERVER_CONST.JWTSECRET, { expiresIn: '1h' });
    const resetLink = `http://127.0.0.1:3000/reset-password?token=${resetToken}`;
    const mailOptions = {
      to: email,
      subject: 'Recuperación de Contraseña - Sistema PMS',
      html: `
        <h2>Hola ${user.fullname || user.username},</h2>
        <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para continuar (válido por 1 hora):</p>
        <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
        <p>Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
      `
    };

    const emailSent = await sendMail(mailOptions.to, mailOptions.subject, mailOptions.html);
    if (emailSent) {
      res.status(200).json({
        statusCode: 200,
        status: 'success',
        message: 'Enlace de recuperación enviado al correo electrónico'
      });
    } else {
      res.status(500).json({
        statusCode: 500,
        status: 'error',
        message: 'Fallo al enviar el correo de recuperación'
      });
    }
  };

  // Restablecer contraseña con token temporal
  public resetPassword = async (req: Request, res: Response): Promise<void> => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      res.status(400).json({
        statusCode: 400,
        status: 'error',
        message: 'Token y nueva contraseña son obligatorios'
      });
      return;
    }

    try {
      const decoded = jwt.verify(token, SERVER_CONST.JWTSECRET) as any;
      const user = await UsersUtil.getUserByEmail(decoded.email);
      if (!user) {
        res.status(404).json({
          statusCode: 404,
          status: 'error',
          message: 'Usuario no encontrado'
        });
        return;
      }

      user.password = await encryptString(newPassword);
      const userRepo = AppDataSource.getRepository(Users);
      await userRepo.save(user);

      // Invalidar en caché
      await CacheUtil.remove('User', user.user_id);

      res.status(200).json({
        statusCode: 200,
        status: 'success',
        message: 'Contraseña actualizada exitosamente'
      });
    } catch (error) {
      res.status(400).json({
        statusCode: 400,
        status: 'error',
        message: 'Token de restablecimiento inválido o expirado'
      });
    }
  };
}
