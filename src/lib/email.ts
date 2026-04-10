import { Resend } from 'resend';

// Inicializar Resend con variable de entorno (si no hay, usar un mock para desarrollo local)
const resendApiKey = process.env.RESEND_API_KEY || 're_mock_123456789';
export const resend = new Resend(resendApiKey);

// ... (existing code)

export async function sendPaymentConfirmationEmail(email: string, name: string, courseTitle: string, amount: number) {
  try {
    await resend.emails.send({
      from: senderEmail,
      to: [email],
      subject: `¡Confirmación de tu inscripción a ${courseTitle}!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #0070f3;">¡Gracias por tu compra, ${name}!</h2>
          <p>Tu pago de <strong>$${amount} MXN</strong> ha sido procesado con éxito.</p>
          <p>Ya puedes acceder al curso: <strong>${courseTitle}</strong> desde tu panel de alumno.</p>
          <div style="margin-top: 30px; text-align: center;">
            <a href="${appUrl}/dashboard/student/courses" style="padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Empezar a aprender ahora
            </a>
          </div>
          <p style="margin-top: 30px; font-size: 12px; color: #888; border-top: 1px solid #eee; pt-20px;">
            Plattform - La infraestructura para el conocimiento online.
          </p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Error enviando email de confirmación de pago:', error);
    return { success: false, error };
  }
}
const senderEmail = process.env.SENDER_EMAIL || 'onboarding@resend.dev';
const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';

export async function sendVerificationEmail(email: string, token: string, name: string) {
  const verificationLink = `${appUrl}/api/auth/verify-email?token=${token}`;
  
  try {
    const { data, error } = await resend.emails.send({
      from: senderEmail,
      to: [email],
      subject: 'Verifica tu cuenta en Plattform',
      html: `
        <div>
          <h1>¡Hola ${name}, bienvenido a Plattform!</h1>
          <p>Para poder iniciar sesión y acceder a todas las funcionalidades, necesitamos que verifiques tu dirección de correo electrónico.</p>
          <a href="${verificationLink}" style="padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">
            Verificar mi correo
          </a>
          <p style="margin-top: 20px; color: #666;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
          <p style="color: #666; word-break: break-all;">${verificationLink}</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error enviando email de verificación:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (error) {
    console.error('Catch error enviando email de verificación:', error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(email: string, token: string, name: string) {
  const resetLink = `${appUrl}/reset-password?token=${token}`;
  
  try {
    await resend.emails.send({
      from: senderEmail,
      to: [email],
      subject: 'Recuperación de contraseña en Plattform',
      html: `
        <div>
          <h1>Hola ${name}</h1>
          <p>Hemos recibido una solicitud para cambiar tu contraseña.</p>
          <a href="${resetLink}" style="padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">
            Restablecer Contraseña
          </a>
          <p style="margin-top: 20px; color: #666;">Este enlace expirará en 30 minutos.</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Error enviando email de recuperación:', error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    await resend.emails.send({
      from: senderEmail,
      to: [email],
      subject: '¡Tu cuenta en Plattform ha sido activada!',
      html: `
        <div>
          <h1>¡Excelente ${name}!</h1>
          <p>Tu correo ha sido verificado con éxito y tu cuenta ya está completamente activa.</p>
          <p>Ya puedes iniciar sesión y disfrutar de nuestros cursos.</p>
          <a href="${appUrl}/login" style="padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">
            Ir al inicio de sesión
          </a>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Error enviando email de bienvenida:', error);
    return { success: false, error };
  }
}
