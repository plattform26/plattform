import { z } from 'zod';

// Esquema para opciones de preguntas
export const quizQuestionOptionSchema = z.object({
  optionText: z.string().min(1, 'El texto de la opción es requerido').max(1000),
  isCorrect: z.boolean().default(false),
  orderIndex: z.number().int().min(1).optional(),
});

// 1. Lessons
export const createLessonSchema = z.object({
  courseId: z.string().uuid('ID de curso inválido'),
  moduleId: z.string().uuid('ID de módulo inválido').optional().nullable(),
  title: z.string().min(1, 'El título es requerido').max(200),
  subtitle: z.string().max(200).optional().nullable(),
  contentText: z.string().max(50000).optional().nullable(),
  videoUrl: z.string().url('URL de video inválida').optional().nullable(),
  contentType: z.enum(['TEXT', 'VIDEO', 'QUIZ']).default('TEXT'),
  orderIndex: z.number().int().min(0).optional(),
  durationMinutes: z.number().int().min(0).optional().nullable(),
  isPreview: z.boolean().default(false),
}).strict();

export const updateLessonSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  subtitle: z.string().max(200).optional().nullable(),
  contentText: z.string().max(50000).optional().nullable(),
  videoUrl: z.string().url().optional().nullable(),
  contentType: z.enum(['TEXT', 'VIDEO', 'QUIZ']).optional(),
  orderIndex: z.number().int().min(0).optional(),
  durationMinutes: z.coerce.number().int().min(0).optional().nullable(),
  moduleId: z.string().uuid().optional().nullable(),
  isPreview: z.boolean().optional(),
  summary: z.string().max(2000).optional().nullable(),
  funFact: z.string().max(500).optional().nullable(),
}).strict();

// 2. Modules
export const createModuleSchema = z.object({
  courseId: z.string().uuid('ID de curso inválido'),
  title: z.string().min(1, 'El título es requerido').max(200),
  orderIndex: z.number().int().min(0).optional(),
}).strict();

export const updateModuleSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  orderIndex: z.number().int().min(0).optional(),
}).strict();

// 3. Quizzes (Individual)
export const createQuizSchema = z.object({
  courseId: z.string().uuid('ID de curso inválido'),
  lessonId: z.string().uuid('ID de lección inválido').optional().nullable(),
  title: z.string().min(1, 'El título es requerido').max(200),
  passingScore: z.number().min(0).max(100).default(70),
  totalScore: z.number().refine(val => [10, 100].includes(val), 'El puntaje total debe ser 10 o 100'),
  scoreDistribution: z.enum(['MANUAL', 'AUTOMATIC']).default('AUTOMATIC'),
}).strict();

// 4. Quiz Questions
export const createQuizQuestionSchema = z.object({
  quizId: z.string().uuid('ID de quiz inválido'),
  questionText: z.string().min(1, 'La pregunta es requerida').max(5000),
  questionType: z.enum(['SINGLE', 'MULTIPLE']).default('SINGLE'),
  optionsJson: z.array(quizQuestionOptionSchema).min(2, 'Se requieren al menos 2 opciones'),
  correctAnswer: z.any().optional().nullable(),
  points: z.coerce.number().int().min(0).max(100).default(10),
  orderIndex: z.coerce.number().int().min(0).default(0),
}).strict();

export const updateQuizQuestionSchema = createQuizQuestionSchema.partial().extend({
  id: z.string().uuid('ID de pregunta inválido'),
}).strict();

// 5. Sync Quiz (Full atomic update)
export const syncQuizSchema = z.object({
  title: z.string().min(1).max(200).optional().nullable(),
  passingScore: z.number().min(0).max(100).optional().nullable(),
  totalScore: z.literal(100),
  scoreDistribution: z.enum(['MANUAL', 'AUTOMATIC']).optional().nullable(),
  questions: z.array(z.object({
    questionText: z.string().min(1).max(5000),
    questionType: z.enum(['SINGLE', 'MULTIPLE']),
    optionsJson: z.array(quizQuestionOptionSchema).min(2),
    correctAnswer: z.any(),
    points: z.number().min(0).max(100),
  })).min(1, 'El examen debe tener al menos una pregunta'),
}).strict();
