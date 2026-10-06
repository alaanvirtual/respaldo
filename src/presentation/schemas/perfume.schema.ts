import { z } from 'zod';
import { CONCENTRATIONS } from '../../domain/value-objects/Concentration';

export const createPerfumeSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'El nombre del perfume es obligatorio' }).trim().min(1, 'El nombre no puede estar vacío').max(120),
    brand: z.string({ required_error: 'La marca es obligatoria' }).trim().min(1, 'La marca no puede estar vacía').max(100),
    concentration: z.enum(CONCENTRATIONS as unknown as [string, ...string[]], {
      errorMap: () => ({ message: 'Concentración inválida. Debe ser EDT, EDP, Parfum o Extrait' }),
    }),
    sizeMl: z.number({ required_error: 'El tamaño en ml es obligatorio' }).positive('El tamaño debe ser mayor a 0 ml'),
    price: z.number({ required_error: 'El precio es obligatorio' }).positive('El precio debe ser mayor a 0'),
    stock: z.number({ required_error: 'El stock es obligatorio' }).int('El stock debe ser un número entero').min(0, 'El stock no puede ser negativo'),
  }),
});

export const getPerfumesQuerySchema = z.object({
  query: z.object({
    brand: z.string().trim().optional(),
    concentration: z.enum(CONCENTRATIONS as unknown as [string, ...string[]]).optional(),
    minPrice: z.coerce.number().positive().optional(),
    maxPrice: z.coerce.number().positive().optional(),
    inStockOnly: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
  }),
});

export const perfumeIdParamSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1, 'El ID del perfume es requerido'),
  }),
});

export const deductStockSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1, 'El ID del perfume es requerido'),
  }),
  body: z.object({
    quantity: z.number({ required_error: 'La cantidad a deducir es obligatoria' }).int('Debe ser entero').positive('La cantidad debe ser mayor a 0'),
  }),
});
