import { z } from 'zod';

export const adminCreateUserSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  lastName: z.string().max(100).optional().default(''),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  role: z.enum(['STUDENT', 'INSTRUCTOR', 'ADMIN']),
}).strict();

export const adminUpdateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  lastName: z.string().max(100).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional().nullable(),
  role: z.enum(['STUDENT', 'INSTRUCTOR', 'ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'PENDING_APPROVAL']).optional(),
  specialty: z.string().max(200).optional().nullable(),
  academyName: z.string().min(1).max(200).optional(),
  slug: z.string().min(3).max(100).regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones').optional(),
  description: z.string().max(5000).optional().nullable(),
  institution: z.string().max(200).optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable(),
  isCourtesy: z.boolean().optional(),
  courtesyPlanId: z.string().uuid().optional().nullable(),
}).strict();

export const adminManualEnrollmentSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  courseId: z.string().uuid('ID de curso inválido'),
  reason: z.string().max(500).optional(),
  notes: z.string().max(500).optional(),
}).strict();

export const adminManagePlanSchema = z.object({
  planId: z.enum(['starter', 'growth', 'scale'], { 
    errorMap: () => ({ message: "Plan inválido. Debe ser: starter, growth o scale" }) 
  }),
}).strict();

export const adminUpdateCourseSchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED', 'HIBERNATED', 'ARCHIVED']),
}).strict();
