import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { instructorUpdatePersonalSchema } from '@/lib/validations/profiles';

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = instructorUpdatePersonalSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Datos inválidos', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const { name, lastName, email, specialty } = validation.data;

    // Actualización ultra-segura usando el cliente de Prisma (Sin SQL Raw)
    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        name: name ?? undefined,
        lastName: lastName ?? undefined,
        email: email ?? undefined,
        // Sincronización: Actualizamos la especialidad en el perfil del instructor
        instructorProfile: {
          update: {
            specialty: specialty ?? undefined
          }
        }
      },
      include: {
        instructorProfile: true
      }
    });

    return NextResponse.json({
      ...updatedUser,
      specialty: updatedUser.instructorProfile?.specialty || 'N/A'
    });

  } catch (error: any) {
    console.error('❌ ERROR CRÍTICO EN PERFIL INSTRUCTOR:', error.message);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }

}
