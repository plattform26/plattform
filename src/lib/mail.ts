import { Resend } from 'resend';
import prisma from './prisma';
import { formatMXN } from './utils/currency';

/**
 * Misión: Centralización e Infraestructura de Negocio (Fase 2)
 * Este archivo centraliza todas las comunicaciones por email de Plattform.
 * Incluye lógica de Rate Limiting para alertas SOS.
 */

const resend = new Resend(process.env.RESEND_API_KEY);
const from = process.env.EMAIL_FROM || 'Plattform <soporte@plattform.mx>';
const appUrl = (process.env.NODE_ENV === 'production' ? 'https://www.plattform.mx' : (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3001')).replace(/\/$/, '');
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

export async function sendSaleNotificationToInstructor(
  email: string, 
  studentName: string, 
  courseTitle: string, 
  financials: { gross: number; platformFee: number; stripeFee: number; net: number },
  baseUrl?: string
) {
  const url = resolveUrl(baseUrl);
  await resend.emails.send({
    from,
    to: email,
    subject: `💰 ¡Nueva venta! ${studentName} se ha unido a tu curso`,
    html: getBaseTemplate(`
      <h1>¡Tienes un nuevo alumno!</h1>
      <p>Tu curso <span class="highlight">${courseTitle}</span> sigue creciendo.</p>
      <p>El alumno <span class="highlight">${studentName}</span> acaba de inscribirse.</p>
      
      <div style="background: #f8fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 12px; margin: 24px 0;">
        <h3 style="margin-top: 0; color: #111827;">Desglose Financiero</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Venta Bruta:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600;">${formatMXN(financials.gross)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Comisión Plattform:</td>
            <td style="padding: 8px 0; text-align: right; color: #ef4444;">- ${formatMXN(financials.platformFee)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Comisión Stripe (aprox):</td>
            <td style="padding: 8px 0; text-align: right; color: #ef4444;">- ${formatMXN(financials.stripeFee)}</td>
          </tr>
          <tr style="border-top: 1px solid #e5e7eb;">
            <td style="padding: 12px 0 0 0; font-weight: 700; color: #111827;">Monto Neto Recibido:</td>
            <td style="padding: 12px 0 0 0; text-align: right; font-weight: 800; color: #06b6d4; font-size: 18px;">${formatMXN(financials.net)}</td>
          </tr>
        </table>
      </div>

      <p>El monto neto ha sido depositado directamente en tu cuenta de Stripe Connect.</p>
      <a href="${url}/dashboard/instructor/finances" class="button">Ver mis ingresos</a>
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
      <p><strong>Monto solicitado:</strong> ${formatMXN(amount)}</p>
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

export async function sendSaleNotificationToAdmin(
  studentName: string, 
  courseTitle: string, 
  financials: { gross: number; platformFee: number; stripeFee: number; net: number },
  discountInfo?: { code: string, percent: number }, 
  baseUrl?: string
) {
  const url = resolveUrl(baseUrl);
  await resend.emails.send({
    from,
    to: adminEmail,
    subject: `💰 Nueva Venta: ${courseTitle}`,
    html: getBaseTemplate(`
      <h1>¡Felicidades Diego, nueva venta realizada!</h1>
      <p>El alumno <span class="highlight">${studentName}</span> ha comprado un curso.</p>
      
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 12px; margin: 24px 0;">
        <h3 style="margin-top: 0; color: #166534;">Detalles de la Transacción</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #374151;">Curso:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600;">${courseTitle}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #374151;">Monto Bruto:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600;">${formatMXN(financials.gross)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #374151;">Ingreso Plattform:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 800; color: #16a34a;">+ ${formatMXN(financials.platformFee)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #374151;">Pago a Instructor:</td>
            <td style="padding: 8px 0; text-align: right; color: #4b5563;">${formatMXN(financials.net)}</td>
          </tr>
          ${discountInfo ? `
          <tr style="border-top: 1px dashed #bbf7d0;">
            <td style="padding: 8px 0; color: #166534;">Cupón Usado:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 700;">${discountInfo.code} (-${discountInfo.percent}%)</td>
          </tr>` : ''}
        </table>
      </div>
      
      <a href="${url}/dashboard/admin/revenue" class="button">Ver Reportes de Ingresos</a>
    `)
  });
}

export async function sendSubscriptionNotificationToAdmin(
  instructorName: string, 
  instructorEmail: string, 
  planName: string, 
  amount: number, 
  expiresAt: Date, 
  baseUrl?: string
) {
  const url = resolveUrl(baseUrl);
  const formattedDate = expiresAt.toLocaleDateString('es-MX', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });

  await resend.emails.send({
    from,
    to: adminEmail,
    subject: `💳 Nueva Suscripción: ${instructorName} - Plan ${planName}`,
    html: getBaseTemplate(`
      <h1>Nueva Transacción de Suscripción</h1>
      <p>Diego, se ha procesado un pago de suscripción en la plataforma.</p>
      <div style="background: #f0f9ff; border: 1px solid #bae6fd; padding: 16px; border-radius: 12px; margin: 24px 0;">
        <p><strong>Instructor:</strong> ${instructorName} (${instructorEmail})</p>
        <p><strong>Plan:</strong> ${planName}</p>
        <p><strong>Monto:</strong> ${formatMXN(amount)}</p>
        <p><strong>Nueva Vigencia:</strong> ${formattedDate}</p>
      </div>
      <a href="${url}/dashboard/admin/users" class="button">Gestionar Usuarios</a>
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
  certificateCode: string
) {
  const { jsPDF } = await import('jspdf');
  const QRCode = await import('qrcode');
  
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // 1. Fondo Dark Premium (#070d1a)
  doc.setFillColor(7, 13, 26);
  doc.rect(0, 0, width, height, 'F');

  // 2. Bordes Neón (Cian)
  doc.setDrawColor(0, 229, 255); // Neon Cyan #00e5ff
  doc.setLineWidth(1.5);
  doc.roundedRect(10, 10, width - 20, height - 20, 5, 5, 'D');
  
  doc.setDrawColor(0, 229, 255);
  doc.setLineWidth(0.3);
  doc.roundedRect(15, 15, width - 30, height - 30, 4, 4, 'D');

  // 3. Branding Superior
  doc.setTextColor(0, 229, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('OFFICIAL CERTIFICATION', width / 2, 25, { align: 'center' });

  // 4. Título Principal
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(38);
  doc.text('CERTIFICADO DE APROBACIÓN', width / 2, 50, { align: 'center' });

  // 5. Cuerpo
  doc.setTextColor(156, 163, 175); // Gray 400
  doc.setFontSize(12);
  doc.text('Plattform Academy otorga el presente reconocimiento a:', width / 2, 70, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(55);
  doc.text(studentName.toUpperCase(), width / 2, 95, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(156, 163, 175);
  doc.setFontSize(12);
  doc.text('Por haber completado con éxito el programa de:', width / 2, 115, { align: 'center' });

  doc.setTextColor(0, 229, 255);
  doc.setFontSize(32);
  doc.text(courseTitle.toUpperCase(), width / 2, 135, { align: 'center' });

  // 6. Footer / QR / Firma
  const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${certificateCode}`;
  const qrBase64 = await QRCode.toDataURL(qrUrl, {
    margin: 1,
    color: { dark: '#00e5ff', light: '#070d1a' }
  });

  doc.addImage(qrBase64, 'PNG', width / 2 - 15, height - 45, 30, 30);
  doc.setTextColor(107, 114, 128); // Gray 500
  doc.setFontSize(9);
  doc.text('ID DE AUTORIDAD', 30, height - 32);
  doc.setTextColor(0, 229, 255);
  doc.setFontSize(14);
  doc.text(certificateCode, 30, height - 25);
  doc.setTextColor(75, 85, 99); // Gray 600
  doc.setFontSize(8);
  doc.text('Sello Digital: Plattform', 30, height - 18);

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('PLATTFORM 2026', width - 30, height - 25, { align: 'right' });

  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}

export async function sendPlanActivityEmail(
  email: string, 
  type: 'WELCOME' | 'UPGRADE' | 'RENEWAL', 
  planName: string, 
  expiresAt?: Date, 
  baseUrl?: string
) {
  const url = resolveUrl(baseUrl);
  const subjects = {
    WELCOME: '¡Bienvenido a tu suscripción en Plattform!',
    UPGRADE: 'Actualización de Plan exitosa',
    RENEWAL: 'Renovación de suscripción confirmada'
  };

  const titles = {
    WELCOME: `Activación de Plan ${planName}`,
    UPGRADE: `Tu academia ahora es nivel ${planName}`,
    RENEWAL: 'Suscripción renovada exitosamente'
  };

  const formattedDate = expiresAt ? expiresAt.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }) : null;

  await resend.emails.send({
    from,
    to: email,
    subject: subjects[type],
    html: getBaseTemplate(`
      <h1>${titles[type]}</h1>
      <p>Estimado Instructor, le informamos que el estatus de su suscripción en nuestra plataforma ha sido actualizado satisfactoriamente.</p>
      <div style="background: #f8fafb; border: 1px solid #e5e7eb; padding: 16px; border-radius: 12px; margin: 24px 0;">
        <p><strong>Plan Actual:</strong> <span class="highlight">${planName}</span></p>
        ${formattedDate ? `<p><strong>Vencimiento Oficial:</strong> ${formattedDate}</p>` : ''}
      </div>
      <p>Su academia cuenta ahora con todos los beneficios y capacidades correspondientes a su nivel de suscripción. Puede gestionar sus cursos y alumnos desde su panel de control.</p>
      <a href="${url}/dashboard/instructor/finances" class="button">Ir a mi Panel de Control</a>
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
  const resetLink = `${url}/reset-password?token=${token}`;
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

export async function sendPaymentConfirmationEmail(email: string, name: string, courseTitle: string, amount: number, discountInfo?: { code: string, percent: number }, baseUrl?: string) {
  const url = resolveUrl(baseUrl);
  await resend.emails.send({
    from,
    to: email,
    subject: `¡Inscripción confirmada! ${courseTitle}`,
    html: getBaseTemplate(`
      <h1>¡Ya tienes acceso, ${name}!</h1>
      <p>Tu inscripción a <strong>${courseTitle}</strong> ha sido exitosa.</p>
      <div style="background: #f8fafb; border: 1px solid #e5e7eb; padding: 16px; border-radius: 12px; margin: 24px 0;">
        <p><strong>Inversión:</strong> ${formatMXN(amount)}</p>
        ${discountInfo ? `<p style="color: #059669; font-weight: 600;">Descuento aplicado: ${discountInfo.code} (-${discountInfo.percent}%)</p>` : ''}
      </div>
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
