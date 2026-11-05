import { z } from 'zod';
import { userRoleSchema } from './user.schema';

export const loginBodySchema = z
  .object({
    email: z.string().trim().email('Formato de correo inválido').optional(),
    username: z.string().trim().min(3).optional(),
    usernameOrEmail: z.string().trim().min(3).optional(),
    password: z
      .string({ required_error: 'La contraseña es obligatoria' })
      .min(1, 'La contraseña no puede estar vacía'),
  })
  .refine((data) => Boolean(data.email || data.username || data.usernameOrEmail), {
    message: 'Debe proporcionar al menos un correo electrónico o nombre de usuario',
    path: ['email'],
  });

export const loginSchema = z.object({
  body: loginBodySchema,
});

export const registerBodySchema = z.object({
  fullname: z
    .string({ required_error: 'El nombre completo es obligatorio' })
    .trim()
    .min(2, 'Mínimo 2 caracteres')
    .max(100),
  username: z
    .string({ required_error: 'El nombre de usuario es obligatorio' })
    .trim()
    .min(3, 'Mínimo 3 caracteres')
    .max(50),
  email: z
    .string({ required_error: 'El correo electrónico es obligatorio' })
    .trim()
    .email('Formato de correo inválido'),
  password: z
    .string({ required_error: 'La contraseña es obligatoria' })
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role: userRoleSchema.optional(),
});

export const registerSchema = z.object({
  body: registerBodySchema,
});
