import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { studentUpdateProfileSchema } from '@/lib/validations/profiles';

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validation = studentUpdateProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Datos inválidos', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const { name, lastName } = validation.data;

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: { 
        name, 
        lastName,
        updatedAt: new Date()
      },
      select: {
         id: true,
         name: true,
         lastName: true,
         email: true
      }
    });

    return NextResponse.json({ message: 'Perfil actualizado', user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
