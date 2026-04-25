import { z } from 'zod';

export const createCheckoutSessionSchema = z.object({
  courseId: z.string().uuid('ID de curso inválido'),
  couponCode: z.string().max(50, 'Código demasiado largo').optional().nullable(),
}).strict();

export const createSubscriptionSessionSchema = z.object({
  planId: z.string().uuid('ID de plan inválido'),
}).strict();

export const withdrawSchema = z.object({
  amount: z.number().positive('El monto debe ser mayor a cero'),
}).strict();

export const instructorCouponSchema = z.object({
  code: z.string().min(3, 'Mínimo 3 caracteres').max(50, 'Máximo 50 caracteres').transform(val => val.toUpperCase()),
  discountPercent: z.number().min(1, 'Mínimo 1%').max(100, 'Máximo 100%'),
  courseId: z.string().uuid('ID de curso inválido'),
  expiresAt: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    { message: 'Fecha inválida' }
  ).optional().nullable(),
  maxUses: z.preprocess(
    (val) => (val === '' ? undefined : val), 
    z.coerce.number().int().positive().optional().nullable()
  ),
}).strict();

export const validateCouponSchema = z.object({
  code: z.string().min(1, 'Código requerido').max(50),
  courseId: z.string().uuid('ID de curso inválido'),
}).strict();
