import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, lastName } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        name: name ?? undefined,
        lastName: lastName ?? undefined,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
