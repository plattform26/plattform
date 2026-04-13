import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    console.log('--- FORMULARIO RECIBIDO ---', body);
    const { currentPassword, newPassword } = body;
    
    console.log('--- [BACKEND] INTENTO DE CAMBIO DE PASS ---');
    console.log('User ID Target:', session.userId);
    console.log('Nueva Password Recibida:', newPassword);

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId }
    });

    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'La contraseña actual es incorrecta' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'La nueva contraseña debe tener al menos 8 caracteres' }, { status: 400 });
    }

    // Cifrado Síncrono para asegurar impacto real
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        passwordHash: hashedPassword,
        updatedAt: new Date()
      }
    });

    console.log('--- PASSWORD ACTUALIZADA ---');

    return NextResponse.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
