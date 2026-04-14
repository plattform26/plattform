import { Resend } from 'resend';
import prisma from './prisma';

/**
 * Misión: Centralización e Infraestructura de Negocio (Fase 2)
 * Este archivo centraliza todas las comunicaciones por email de Plattform.
 * Incluye lógica de Rate Limiting para alertas SOS.
 */

const resend = new Resend(process.env.RESEND_API_KEY);
const from = process.env.EMAIL_FROM || 'Plattform <soporte@plattform.mx>';
const appUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3001').replace(/\/$/, '');
const adminEmail = process.env.ADMIN_EMAIL || 'soporte@plattform.mx';

// Helper to resolve URL with priority: provided baseUrl > Env Var
const resolveUrl = (baseUrl?: string) => (baseUrl || appUrl).replace(/\/$/, '');
const adminName = 'Diego'; // Admin name as requested
// Deployment Trigger: Domain sync for plattform-rouge.vercel.app

// Plantilla Base (Elegante y Profesional)
const getBaseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #f9fafb; }
    .container { max-width: 600px; margin: 40px auto; padding: 40px; background: white; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
    .header { margin-bottom: 32px; text-align: center; }
    .logo { font-size: 24px; font-weight: 800; color: #06b6d4; letter-spacing: -0.025em; font-style: italic; }
    .footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid #f3f4f6; text-align: center; font-size: 12px; color: #6b7280; }
    .button { display: inline-block; padding: 12px 32px; background-color: #06b6d4; color: white !important; text-decoration: none; border-radius: 12px; font-weight: 600; margin-top: 24px; transition: all 0.2s; }
    .content { font-size: 16px; }
    h1 { font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 16px; }
    .highlight { color: #06b6d4; font-weight: 700; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">PLATTFORM</div>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; 2026 Plattform. La infraestructura para el conocimiento online.</p>
      <p>Soporte: <a href="mailto:soporte@plattform.mx" style="color: #06b6d4; text-decoration: none;">soporte@plattform.mx</a></p>
    </div>
  </div>
</body>
</html>
`;

/* ==========================================
   ALERTA SOS (CON RATE LIMITING)
   ========================================== */

export async function sendAdminTechnicalAlert(type: string, message: string, details?: string, baseUrl?: string) {
  try {
    const url = resolveUrl(baseUrl);
    // Rate Limiting: Máximo un correo por hora para el mismo tipo de error
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const recentAlert = await prisma.systemAlert.findFirst({
      where: {
        type,
        createdAt: { gte: oneHourAgo }
      }
    });

    // Registrar el error en la DB siempre (para auditoría)
    await prisma.systemAlert.create({
      data: { type, message: `${message} | Details: ${details || 'N/A'}` }
    });

    if (recentAlert) {
      console.log(`[SOS_ALERT] Rate limit activo para ${type}. Alerta registrada en DB pero no enviada por email.`);
      return;
    }

    await resend.emails.send({
      from,
      to: adminEmail,
      subject: `🚨 ALERTA SOS: ${type}`,
      html: getBaseTemplate(`
        <h1 style="color: #ef4444;">Fallo detectado en el sistema</h1>
        <p>Se ha detectado un error crítico que requiere atención inmediata.</p>
        <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 12px; margin: 24px 0;">
          <p><strong>Tipo:</strong> ${type}</p>
          <p><strong>Mensaje:</strong> ${message}</p>
          ${details ? `<p><strong>Detalles:</strong> <code style="font-size: 12px;">${details}</code></p>` : ''}
        </div>
        <p>Este es el primer aviso de este tipo en la última hora. Los fallos subsecuentes solo se registrarán en la base de datos para evitar spam.</p>
        <a href="${url}/dashboard/admin" class="button" style="background-color: #ef4444;">Ir al Panel Admin</a>
      `)
    });
  } catch (error) {
    console.error('Error enviando alerta SOS:', error);
  }
}

/* ==========================================
   GESTIÓN DE INSTRUCTORES (QA)
   ========================================== */

export async function sendInstructorRegistrationNoticeToAdmin(instructorName: string, userId: string, baseUrl?: string) {
  const url = resolveUrl(baseUrl);
  const adminLink = `${url}/dashboard/admin/users/${userId}`;

  await resend.emails.send({
    from,
    to: adminEmail,
    subject: `👨‍🏫 Nueva Solicitud de Instructor: ${instructorName}`,
    html: getBaseTemplate(`
      <h1>Nueva solicitud de registro</h1>
      <p>El usuario <span class="highlight">${instructorName}</span> se ha registrado como instructor y está esperando aprobación.</p>
      <p>Por favor, revisa su perfil y academy slug para asegurar el cumplimiento de los estándares de calidad.</p>
      <a href="${adminLink}" class="button">Revisar Candidato</a>
    `)
  });
}

export async function sendStudentRegistrationNoticeToAdmin(studentName: string, studentEmail: string, baseUrl?: string) {
  const url = resolveUrl(baseUrl);
  await resend.emails.send({
    from,
    to: adminEmail,
    subject: `🆕 Nuevo Alumno Registrado: ${studentName}`,
    html: getBaseTemplate(`
      <h1>Hola ${adminName}, tenemos un nuevo alumno</h1>
      <p>Se ha registrado un nuevo estudiante en la plataforma:</p>
      <div style="background: #f0f9ff; border: 1px solid #bae6fd; padding: 16px; border-radius: 12px; margin: 24px 0;">
        <p><strong>Nombre:</strong> ${studentName}</p>
        <p><strong>Email:</strong> ${studentEmail}</p>
      </div>
      <a href="${url}/dashboard/admin/users" class="button">Gestionar Usuarios</a>
    `)
  });
}

export async function sendInstructorApprovalEmail(email: string, name: string, baseUrl?: string) {
  const url = resolveUrl(baseUrl);
  await resend.emails.send({
    from,
    to: email,
    subject: '¡Felicidades! Tu cuenta de Instructor ha sido aprobada',
    html: getBaseTemplate(`
      <h1>¡Bienvenido a la red de Instructores!</h1>
      <p>Hola ${name}, nos alegra informarte que tu cuenta ha sido revisada y aprobada por nuestro equipo.</p>
      <p>Ya tienes acceso total para crear cursos, configurar tu academia y empezar a transformar vidas con tu conocimiento.</p>
      <a href="${url}/dashboard/instructor/courses/new" class="button">Crear mi primer curso</a>
    `)
  });
}

/* ==========================================
   VENTAS Y NOTIFICACIONES DE NEGOCIO
   ========================================== */

export async function sendSaleNotificationToInstructor(email: string, studentName: string, courseTitle: string, baseUrl?: string) {
  const url = resolveUrl(baseUrl);
  await resend.emails.send({
    from,
    to: email,
    subject: `💰 ¡Nueva venta! ${studentName} se ha unido a tu curso`,
    html: getBaseTemplate(`
      <h1>¡Tienes un nuevo alumno!</h1>
      <p>Tu curso <span class="highlight">${courseTitle}</span> sigue creciendo.</p>
      <p>El alumno <span class="highlight">${studentName}</span> acaba de inscribirse. ¡Sigue así!</p>
      <a href="${url}/dashboard/instructor/revenue" class="button">Ver mis ingresos</a>
    `)
  });
}

export async function sendWithdrawalRequestToAdmin(instructorId: string, instructorName: string, email: string, amount: number, baseUrl?: string) {
  const url = resolveUrl(baseUrl);
  await resend.emails.send({
    from,
    to: adminEmail,
    subject: `💸 Solicitud de Retiro: ${instructorName}`,
    html: getBaseTemplate(`
      <h1>Solicitud de pago recibida</h1>
      <p>El instructor <span class="highlight">${instructorName}</span> (${instructorId}) ha solicitado un retiro de sus comisiones.</p>
      <p><strong>Monto solicitado:</strong> $${amount} MXN</p>
      <p>Email de contacto: ${email}</p>
      <a href="${url}/dashboard/admin/revenue/commissions" class="button">Gestionar Comisiones</a>
    `)
  });
}

export async function sendFinalExamPassNoticeToAdmin(studentName: string, courseTitle: string, score: number, baseUrl?: string) {
  const url = resolveUrl(baseUrl);
  await resend.emails.send({
    from,
    to: adminEmail,
    subject: `🎓 Examen Final Aprobado: ${studentName}`,
    html: getBaseTemplate(`
      <h1>¡Misión Cumplida! Un alumno ha aprobado</h1>
      <p>El alumno <span class="highlight">${studentName}</span> ha pasado exitosamente la evaluación final.</p>
      <div style="background: #fffdf2; border: 1px solid #fef08a; padding: 16px; border-radius: 12px; margin: 24px 0;">
        <p><strong>Alumno:</strong> ${studentName}</p>
        <p><strong>Curso:</strong> ${courseTitle}</p>
        <p><strong>Calificación:</strong> ${score.toFixed(1)}/100</p>
      </div>
      <p>El diploma ha sido enviado automáticamente a su correo.</p>
      <a href="${url}/dashboard/admin" class="button">Ir al Panel</a>
    `)
  });
}

export async function sendSaleNotificationToAdmin(studentName: string, courseTitle: string, amount: number, baseUrl?: string) {
  const url = resolveUrl(baseUrl);
  await resend.emails.send({
    from,
    to: adminEmail,
    subject: `💰 Nueva Venta: ${courseTitle}`,
    html: getBaseTemplate(`
      <h1>¡Felicidades Diego, nueva venta realizada!</h1>
      <p>El alumno <span class="highlight">${studentName}</span> ha comprado un curso.</p>
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 12px; margin: 24px 0;">
        <p><strong>Curso:</strong> ${courseTitle}</p>
        <p><strong>Monto:</strong> $${amount} MXN</p>
      </div>
      <a href="${url}/dashboard/admin/revenue" class="button">Ver Reportes de Ingresos</a>
    `)
  });
}

/* ==========================================
   LOGROS Y SUSCRIPCIONES
   ========================================== */

export async function sendCertificateEmail(
  email: string, 
  studentName: string, 
  courseTitle: string, 
  certificateLink: string,
  pdfAttachment?: { filename: string; content: Buffer }
) {
  await resend.emails.send({
    from,
    to: email,
    subject: `🎓 ¡Felicidades! Aquí tienes tu certificación de ${courseTitle}`,
    attachments: pdfAttachment ? [pdfAttachment] : [],
    html: getBaseTemplate(`
      <h1>¡Lo lograste, ${studentName}!</h1>
      <p>Has completado satisfactoriamente el curso <strong>${courseTitle}</strong>.</p>
      <p>Tu dedicación ha dado frutos. Adjunto encontrarás tu **certificado oficial** expedido por Plattform.</p>
      <p>También puedes verlo y descargarlo en cualquier momento desde tu panel:</p>
      <a href="${certificateLink}" class="button">Ver mis Certificados</a>
    `)
  });
}

/**
 * Misión: Generación de Certificados Server-Side
 * Dibuja un certificado profesional en PDF para ser enviado por correo.
 */
export async function generateCertificatePDF(
  studentName: string, 
  courseTitle: string, 
  certificateCode: string,
  finalScore?: number
) {
  // Import dinámico para evitar problemas en Edge Runtime si existieran, 
  // aunque Next.js API routes usualmente corren en Node.
  const { jsPDF } = await import('jspdf');
  
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // 1. Fondos y Bordes
  doc.setDrawColor(6, 182, 212); // Cyan 500
  doc.setLineWidth(2);
  doc.rect(5, 5, width - 10, height - 10);
  
  doc.setLineWidth(0.5);
  doc.rect(7, 7, width - 14, height - 14);

  // 2. Branding Superior
  doc.setTextColor(6, 182, 212);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('ANTIGRAVITY ACADEMY', width / 2, 20, { align: 'center' });

  // 3. Título Principal
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(30);
  doc.text('CERTIFICADO DE APROBACIÓN', width / 2, 45, { align: 'center' });

  // 4. Cuerpo
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Se otorga el presente a:', width / 2, 65, { align: 'center' });

  doc.setFontSize(40);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bolditalic');
  doc.text(studentName.toUpperCase(), width / 2, 85, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Por haber completado satisfactoriamente el curso de:', width / 2, 105, { align: 'center' });

  doc.setFontSize(24);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(courseTitle.toUpperCase(), width / 2, 125, { align: 'center' });

  // 5. Detalles Inferiores
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text('ID de Certificación:', 20, height - 30);
  doc.setTextColor(6, 182, 212);
  doc.setFontSize(14);
  doc.text(certificateCode, 20, height - 22);

  if (finalScore !== undefined) {
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Calificación Final:', width / 2, height - 30, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.text(`${finalScore.toFixed(1)}/100`, width / 2, height - 22, { align: 'center' });
  }

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'italic');
  doc.text('Emitido bajo validación Plattform 2026', width - 20, height - 22, { align: 'right' });

  // Retornar como Buffer para Resend
  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}

export async function sendPlanActivityEmail(email: string, type: 'WELCOME' | 'UPGRADE' | 'RENEWAL', planName: string) {
  const subjects = {
    WELCOME: '¡Bienvenido a tu nuevo Plan!',
    UPGRADE: 'Tu cambio de plan ha sido exitoso',
    RENEWAL: 'Tu suscripción ha sido renovada'
  };

  const titles = {
    WELCOME: `¡Felicidades por elegir el Plan ${planName}!`,
    UPGRADE: `Ya estás disfrutando del Plan ${planName}`,
    RENEWAL: 'Ciclo de facturación renovado'
  };

  await resend.emails.send({
    from,
    to: email,
    subject: subjects[type],
    html: getBaseTemplate(`
      <h1>${titles[type]}</h1>
      <p>Este es un aviso automático para informarte sobre el estado de tu suscripción a Plattform.</p>
      <p>Plan actual: <span class="highlight">${planName}</span></p>
      <p>Si tienes alguna duda sobre los beneficios de tu plan, puedes revisarlos en tu panel administrativo.</p>
      <a href="${url}/dashboard/instructor/revenue" class="button">Ver mi Panel</a>
    `)
  });
}

/* ==========================================
   AUTENTICACIÓN Y OTROS (EXISTENTES ACTUALIZADOS)
   ========================================== */

export async function sendVerificationEmail(email: string, token: string, baseUrl?: string) {
  const url = resolveUrl(baseUrl);
  const confirmLink = `${url}/auth/new-verification?token=${token}`;
  await resend.emails.send({
    from,
    to: email,
    subject: 'Verifica tu cuenta en Plattform',
    html: getBaseTemplate(`
      <h1>Activa tu acceso</h1>
      <p>Para garantizar la seguridad de tu cuenta, por favor confirma tu dirección de correo electrónico.</p>
      <a href="${confirmLink}" class="button">Verificar Cuenta</a>
    `)
  });
}

export async function sendPasswordResetEmail(email: string, token: string, baseUrl?: string) {
  const url = resolveUrl(baseUrl);
  const resetLink = `${url}/auth/reset-password?token=${token}`;
  await resend.emails.send({
    from,
    to: email,
    subject: 'Restablecer tu contraseña',
    html: getBaseTemplate(`
      <h1>Recuperación de contraseña</h1>
      <p>Haz clic en el botón para configurar una nueva clave de acceso.</p>
      <a href="${resetLink}" class="button">Restablecer Contraseña</a>
    `)
  });
}

export async function sendPasswordChangeNotice(email: string) {
  await resend.emails.send({
    from,
    to: email,
    subject: 'Seguridad: Contraseña actualizada',
    html: getBaseTemplate(`
      <h1>Tu contraseña ha sido cambiada</h1>
      <p>Este es un aviso automático de seguridad. Si no realizaste este cambio, contáctanos.</p>
    `)
  });
}

export async function sendPaymentConfirmationEmail(email: string, name: string, courseTitle: string, amount: number, baseUrl?: string) {
  const url = resolveUrl(baseUrl);
  await resend.emails.send({
    from,
    to: email,
    subject: `¡Inscripción confirmada! ${courseTitle}`,
    html: getBaseTemplate(`
      <h1>¡Ya tienes acceso, ${name}!</h1>
      <p>Tu inscripción a <strong>${courseTitle}</strong> ha sido exitosa.</p>
      <p>Inversión: $${amount} MXN</p>
      <a href="${url}/dashboard/student/courses" class="button">Empezar a aprender</a>
    `)
  });
}

export async function sendWelcomeEmail(email: string, name: string, baseUrl?: string) {
  const url = resolveUrl(baseUrl);
  await resend.emails.send({
    from,
    to: email,
    subject: '¡Todo listo! Bienvenido a Plattform',
    html: getBaseTemplate(`
      <h1>Hola ${name}, tu cuenta está lista</h1>
      <p>Gracias por unirte. Estamos emocionados de acompañarte en este viaje.</p>
      <a href="${url}/login" class="button">Explorar Cursos</a>
    `)
  });
}
