import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, lastName } = await req.json();

    if (!name || !lastName) {
      return NextResponse.json({ error: 'Nombre y apellidos son obligatorios' }, { status: 400 });
    }

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
