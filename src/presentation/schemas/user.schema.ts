import { z } from 'zod';

export const userRoleSchema = z.enum([
  'Administrador',
  'Operador de Envíos / Fraccionador',
  'Cliente',
  'Admin',
  'Customer',
]);

export const createUserSchema = z.object({
  body: z.object({
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
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1, 'El ID del usuario es requerido'),
  }),
  body: z.object({
    fullname: z.string().trim().min(2, 'Mínimo 2 caracteres').max(100).optional(),
    email: z.string().trim().email('Formato de correo inválido').optional(),
    role: userRoleSchema.optional(),
  }),
});

export const userIdParamSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1, 'El ID del usuario es requerido'),
  }),
});
