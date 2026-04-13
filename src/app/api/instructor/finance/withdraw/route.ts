import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { sendWithdrawalRequestToAdmin, sendAdminTechnicalAlert } from '@/lib/mail';

/**
 * Misión: Notificaciones de Ventas y Retiros
 * Endpoint para que los instructores soliciten el cobro de sus comisiones.
 */

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Monto inválido' }, { status: 400 });
    }

    // 1. Obtener datos del instructor
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { instructorProfile: true }
    });

    if (!user || !user.instructorProfile) {
      return NextResponse.json({ error: 'Perfil de instructor no encontrado' }, { status: 404 });
    }

    // 2. Notificación al Admin (Misión: Retiros)
    await sendWithdrawalRequestToAdmin(
      user.id,
      `${user.name} ${user.lastName}`,
      user.email,
      amount
    );

    // 3. Registrar la intención en notificaciones de sistema (opcional)
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'SYSTEM_ALERT',
        title: 'Solicitud de retiro enviada',
        message: `Tu solicitud de retiro por $${amount} MXN ha sido enviada al administrador para revisión.`
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Solicitud de retiro enviada correctamente al administrador.' 
    });

  } catch (error: any) {
    console.error('Withdrawal API error:', error);
    
    // Alerta SOS si falla el proceso de retiro
    await sendAdminTechnicalAlert(
      'WITHDRAWAL_API_FAILURE',
      'Error en el endpoint de solicitudes de retiro',
      error.message
    );

    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
