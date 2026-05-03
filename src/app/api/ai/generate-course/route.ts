import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkAiQuota } from '@/lib/ai-quota';
import OpenAI from 'openai';
import slugify from 'slugify';
import mammoth from 'mammoth';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);


export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let generatedData: any = null;
  try {
    const session = await getSession();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const promptText = formData.get('promptText') as string;
    const files = formData.getAll('files') as File[];

    const { getEffectivePlan } = await import('@/lib/plan-utils');
    const activePlan = await getEffectivePlan(session.userId);

    if (!activePlan || !activePlan.aiEnabled) {
      return NextResponse.json({ error: 'Actualiza a un plan con IA para usar esta función.' }, { status: 403 });
    }

    // --- VALIDACIÓN DE CAPACIDAD (CURSOS) ---
    const { validateCourseLimit } = await import('@/lib/utils/plan-validation');
    const limitCheck = await validateCourseLimit(session.userId);
    if (!limitCheck.allowed) {
      return NextResponse.json({ 
        error: 'No puedes generar más cursos. ' + limitCheck.message,
        code: 'LIMIT_REACHED'
      }, { status: 403 });
    }

    const isScale = (activePlan && activePlan.name.toLowerCase() === 'scale') || session.role === 'ADMIN';

    if (files.length > 0 && !isScale) {
        return NextResponse.json({ error: 'La carga de documentos es exclusiva del plan Scale.' }, { status: 403 });
    }

    // --- RATE LIMITING (PRISMA GUARD) ---
    const quotaCheck = await checkAiQuota(session.userId);
    if (!quotaCheck.allowed) {
      const messages = {
        hourly_limit: 'Has alcanzado el límite horario de generaciones con IA (5 por hora). Intenta de nuevo en unos minutos.',
        monthly_limit: 'Has alcanzado el límite mensual de generaciones con IA (30 por mes). Contáctanos en soporte@plattform.mx si necesitas una ampliación.',
      };
      
      return NextResponse.json(
        { 
          error: messages[quotaCheck.reason!], 
          reason: quotaCheck.reason,
          resetAt: quotaCheck.resetAt 
        }, 
        { status: 429 }
      );
    }

    // --- RESERVA DE CUOTA (Job Initial Record) ---
    const job = await prisma.aIGenerationJob.create({
      data: {
        instructorId: session.userId,
        promptInput: { text: promptText },
        generationType: 'SCALE_PRO_AI_V3',
        status: 'PROCESSING'
      }
    });

    if (files.length > 5) {
        return NextResponse.json({ error: 'Límite de 5 documentos excedido.' }, { status: 400 });
    }

    // --- PARSING DOCUMENTS (Secure Binary Guard) ---
    let contextText = '';
    if (files.length > 0) {
      try {
        for (const file of files) {
          console.log(`--- PROCESANDO ARCHIVO: ${file.name} (${file.type}) ---`);
          
          if (file.size > 10 * 1024 * 1024) throw new Error(`El archivo ${file.name} excede los 10MB.`);
          
          const buffer = Buffer.from(await file.arrayBuffer());
          console.log(`Tamaño del buffer recibido: ${buffer?.length || 0} bytes`);

          // VALIDACIÓN ESTRICTA DE BUFFER
          if (!buffer || buffer.length === 0) {
            throw new Error(`El buffer del archivo ${file.name} está vacío o es inválido.`);
          }
          
          if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
              console.log('Iniciando PDF Parsing con pdf2json...');
              const PDFParser = require('pdf2json');
              const parser = new PDFParser();
              
              await new Promise((resolve, reject) => {
                parser.on('pdfParser_dataReady', () => {
                  const text = parser.getRawTextContent();
                  contextText += `\n--- PDF: ${file.name} ---\n${text}\n`;
                  resolve(null);
                });
                parser.on('error', (err: any) => reject(err));
                parser.parseBuffer(buffer);
              });
              console.log('PDF procesado con éxito.');
          } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
              console.log('Iniciando Word Parsing (Mammoth)...');
              const result = await mammoth.extractRawText({ buffer });
              contextText += `\n--- CONTENIDO DE WORD: ${file.name} ---\n${result.value}\n`;
              console.log('Word procesado con éxito.');
          } else {
              console.log(`Tipo de archivo no soportado para parsing profundo: ${file.type}`);
          }
        }
      } catch (parseError: any) {
        console.error('--- ERROR EN BINARY GUARD (Parsing) ---');
        console.error('Message:', parseError.message);
        console.error('Stack:', parseError.stack);
        return NextResponse.json({ 
          error: 'Error crítico al procesar documentos.', 
          details: parseError.message,
          phase: 'BINARY_PARSING'
        }, { status: 400 });
      }
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Falta configuración de IA (API KEY).' }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const systemPrompt = `
      Eres un experto diseñador instruccional de élite (Pedagogía 3.0). Tu misión es transformar material en un curso magistral de alta calidad.
      
      REGLA DE ORO: CALIDAD > CANTIDAD. 
      - No rellenes contenido. Si el material da para 4 módulos magistrales, no inventes 10 mediocres.
      - Analiza la profundidad del contexto y decide la cantidad ÓPTIMA de módulos (Mínimo 3, Máximo 10).
      - Las lecciones deben tener contenido HTML profundo.
      - IMPORTANTE: Los campos "summary" y "funFact" DEBEN ser un solo String plano (puedes usar saltos de línea), NUNCA una lista o array.

      REQUISITOS DEL EXAMEN FINAL:
      - Genera entre 10 y 30 preguntas proporcionales a la extensión del curso.
      - Las preguntas deben validar el conocimiento real, no ser triviales.

      ESTRUCTURA DE SALIDA (JSON ESTRICTO):
      {
        "title": "Título del Curso",
        "description": "...",
        "modules": [
          {
            "title": "Nombre del Módulo",
            "lessons": [
              { 
                "title": "Nombre de la Lección",
                "subtitle": "Una frase corta que complemente el título",
                "durationMinutes": 10, 
                "keyPoints": "3 a 5 puntos esenciales de la lección",
                "funFact": "Un dato curioso o 'Sabías que' relacionado con el tema",
                "content": "Contenido HTML enriquecido y profesional"
              }
            ]
          }
        ],
        "finalExam": {
          "title": "Evaluación Final",
          "passingScore": 80,
          "questions": [
            {
              "questionText": "¿Cuál es la capital de Francia?",
              "options": [
                { "text": "París", "isCorrect": true },
                { "text": "Londres", "isCorrect": false },
                { "text": "Madrid", "isCorrect": false },
                { "text": "Berlín", "isCorrect": false }
              ]
            }
          ]
        }
      }

      CRÍTICO: Un módulo sin lecciones es un error inaceptable. Cada módulo DEBE contener al menos 2 lecciones detalladas con contenido educativo real.
      CRÍTICO (DATOS): No omitas los campos "subtitle", "keyPoints" ni "funFact". Si no hay un dato curioso obvio, infiere uno relevante para aumentar el engagement.
      CRÍTICO (EXAMEN): Cada pregunta DEBE tener exactamente 4 opciones de respuesta. No omitas el campo "options" bajo ninguna circunstancia.
    `;

    const fullPrompt = contextText 
      ? `PROMPT DEL INSTRUCTOR: ${promptText}\n\nMATERIAL DE REFERENCIA (DOCUMENTOS):\n${contextText}` 
      : `PROMPT DEL INSTRUCTOR: ${promptText}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: fullPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const generatedData = JSON.parse(response.choices[0].message.content || '{}');

    // --- DB PERSISTENCE ---
    console.log('--- AI JSON RECEIVED (DEBUG) ---');
    console.dir(generatedData, { depth: null });

    const course = await prisma.$transaction(async (tx) => {
      const baseSlug = slugify(generatedData.title || 'curso-ia', { lower: true, strict: true });
      const slug = `${baseSlug}-${Math.floor(Math.random() * 10000)}`;

      // Auditoría Profunda de Módulos (Misión: Restauración de Contenido)
      console.log('--- AUDITORÍA DE MÓDULOS Y LECCIONES ---');
      if (generatedData.modules) {
        console.dir(generatedData.modules, { depth: null });
      }

      const newCourse = await tx.course.create({
        data: {
          instructorId: session.userId,
          title: generatedData.title || 'Curso Autogenerado',
          slug,
          description: generatedData.description || '',
          price: 999,
          category: 'STRATEGY_BUSINESS', // Fixed from 'OTHER' to valid enum
          status: 'DRAFT',
          visibility: 'PUBLIC'
        }
      });

      console.log('--- TX: Iniciando creación de módulos y lecciones ---');
      if (generatedData.modules && Array.isArray(generatedData.modules)) {
        for (let m = 0; m < generatedData.modules.length; m++) {
          const modDef = generatedData.modules[m];
          if (!modDef.title) continue;

          // Creación de Módulo con Lecciones Anidadas (Pasando explícitamente el courseId)
          await tx.courseModule.create({
            data: { 
              courseId: newCourse.id, 
              title: modDef.title, 
              orderIndex: m + 1,
              lessons: {
                create: (modDef.lessons || []).map((les: any, lIdx: number) => {
                  // Sanitizar contenido (Flatten arrays a texto plano)
                  const cleanContent = Array.isArray(les.content) ? les.content.join('\n') : (les.content || '');
                  const cleanSummary = Array.isArray(les.keyPoints || les.summary) ? (les.keyPoints || les.summary).join('\n') : (les.keyPoints || les.summary || '');
                  const cleanFunFact = Array.isArray(les.funFact) ? les.funFact.join('\n') : (les.funFact || '');
                  const cleanSubtitle = Array.isArray(les.subtitle) ? les.subtitle.join('\n') : (les.subtitle || '');

                  return {
                    courseId: newCourse.id, // <--- Propagación Explícita de ID
                    title: les.title || `Lección ${lIdx + 1}`,
                    subtitle: cleanSubtitle,
                    contentText: cleanContent,
                    summary: cleanSummary,
                    funFact: cleanFunFact,
                    durationMinutes: les.durationMinutes || 10,
                    contentType: 'TEXT',
                    orderIndex: lIdx + 1
                  };
                })
              }
            }
          });
        }
      }

      console.log('--- ESTRUCTURA DE CONTENIDO PERSISTIDA ATÓMICAMENTE ---');

      // Mandatory Final Exam (Structural Security - Atomic Fixed)
      console.log('--- AUDITORÍA DE QUIZ ---');
      if (generatedData.finalExam) {
        console.dir(generatedData.finalExam, { depth: null });
      } else {
        console.error('ALERTA: La IA no generó el campo finalExam');
      }

      if (generatedData.finalExam && Array.isArray(generatedData.finalExam.questions) && generatedData.finalExam.questions.length > 0) {
        const questions = generatedData.finalExam.questions;
        
        // Freno de Seguridad Estricto: Si faltan opciones, abortamos para proteger la calidad.
        const allQuestionsHaveOptions = questions.every((q: any) => 
          Array.isArray(q.options) && q.options.length >= 2
        );

        if (!allQuestionsHaveOptions) {
          console.error('--- FALLO DE INTEGRIDAD: Preguntas sin opciones detectadas ---');
          throw new Error('El motor de IA generó preguntas incompletas (sin opciones). Abortando generación para evitar basura en la DB.');
        }

        // 1. Buscar la última lección del curso para vincular el quiz
        const lastLesson = await tx.courseLesson.findFirst({
          where: { courseId: newCourse.id },
          orderBy: [
            { module: { orderIndex: 'desc' } },
            { orderIndex: 'desc' }
          ]
        });

        if (!lastLesson) {
          console.error('--- FALLO DE ESTRUCTURA: No se encontró lección para el quiz ---');
          throw new Error('El motor de IA generó el curso pero no hay lecciones válidas para colgar el examen final.');
        }

        // 2. Creación Atómica: Quiz + Questions + Options (Relational & JSON Hybrid)
        await tx.quiz.create({
          data: {
            courseId: newCourse.id,
            lessonId: lastLesson.id, // ← VINCULACIÓN CRÍTICA PARA VISIBILIDAD
            title: generatedData.finalExam.title || 'Evaluación Final',
            passingScore: generatedData.finalExam.passingScore || 80,
            totalScore: 100,
            questions: {
              create: questions.map((q: any, i: number) => {
                const points = i === questions.length - 1 
                  ? (100 - (Math.floor(100 / questions.length) * (questions.length - 1))) 
                  : Math.floor(100 / questions.length);
                
                // Mapeo detallado de opciones para el formato JSON legado y relacional
                const optionsData = q.options.map((opt: any, idx: number) => ({
                  optionText: opt.text || `Alternativa ${idx + 1}`,
                  isCorrect: !!opt.isCorrect,
                  orderIndex: idx + 1
                }));

                return {
                  questionText: q.questionText,
                  questionType: 'SINGLE',
                  points: points,
                  orderIndex: i + 1,
                  correctAnswer: JSON.stringify(optionsData.find((o: any) => o.isCorrect) || optionsData[0]),
                  optionsJson: optionsData, // Backfill para el frontend legacy
                  options: {
                    create: optionsData // Persistencia en tabla relacional real
                  }
                };
              })
            }
          }
        });
        console.log('--- QUIZ ATÓMICO PERSISTIDO CON ÉXITO ---');
      }

      await tx.aIGenerationJob.update({
        where: { id: job.id },
        data: {
          courseId: newCourse.id,
          status: 'COMPLETED',
          responseJson: generatedData
        }
      });

      return newCourse;
    }, { timeout: 60000 }); // Large timeout for final complex course generation

    return NextResponse.json({ success: true, courseId: course.id });

  } catch (error: any) {
    console.error('--- FORENSIC ERROR CAPTURED ---');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    
    // --- CLEANUP: Mark job as FAILED if possible ---
    if (typeof job !== 'undefined' && job?.id) {
      await prisma.aIGenerationJob.update({
        where: { id: job.id },
        data: { status: 'FAILED' }
      }).catch(e => console.error('Error updating job to FAILED:', e));
    }

    return NextResponse.json({ 
      error: 'Error en la persistencia del curso generado.', 
      details: error.message
    }, { status: 500 });
  }
}
