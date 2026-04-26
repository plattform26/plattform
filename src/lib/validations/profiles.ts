import { z } from 'zod';

export const studentUpdateProfileSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100),
  lastName: z.string().min(1, 'Apellidos requeridos').max(100),
}).strict();

export const instructorUpdateProfileSchema = z.object({
  academyName: z.string().min(1, 'Nombre de academia requerido').max(200).optional(),
  slug: z.string().min(3).max(100).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(5000).optional().nullable(),
  institution: z.string().max(200).optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  bannerUrl: z.string().url().optional().nullable(),
  linkedinUrl: z.string()
    .refine(
      val => !val || val === '' || /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-_%]+\/?$/.test(val),
      { message: 'Debe ser un perfil válido de LinkedIn (https://linkedin.com/in/tu-perfil)' }
    )
    .optional().nullable(),
  specialty: z.string().max(200).optional().nullable(),
}).strict();

export const instructorUpdatePersonalSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  specialty: z.string().max(200).optional().nullable(),
}).strict();

export const quizAttemptSchema = z.object({
  courseId: z.string().uuid('ID de curso inválido').optional().nullable(),
  answers: z.record(z.string().uuid(), z.string().uuid('ID de opción inválido')),
}).strict();
