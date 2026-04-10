import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { name, lastName, email, password, status, academyName, slug } = await req.json();

    const updateData: any = {};
    if (name) updateData.name = name;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (status) updateData.status = status;

    // Solo hashear si la contraseña no está vacía
    if (password && password.trim() !== '') {
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }

    // Actualización atómica o secuencial controlada
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData
    });

    // Si es instructor, actualizar su perfil también
    if (updatedUser.role === 'INSTRUCTOR') {
        const profileUpdate: any = {};
        if (academyName) profileUpdate.academyName = academyName;
        if (slug) profileUpdate.slug = slug.toLowerCase().replace(/\s+/g, '-');

        if (Object.keys(profileUpdate).length > 0) {
            await prisma.instructorProfile.update({
                where: { userId: params.id },
                data: profileUpdate
            });
        }
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Error updating user:', error);
    if (error.code === 'P2002') {
        return NextResponse.json({ error: 'El correo o el identificador (Slug) ya están en uso' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error interno del servidor', details: error.message }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
          return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: params.id },
            include: {
                instructorProfile: {
                    include: {
                        subscriptions: {
                            include: { plan: true },
                            orderBy: { createdAt: 'desc' },
                            take: 1
                        }
                    }
                },
                courses: {
                    include: {
                        _count: { select: { enrollments: true } }
                    }
                },
                enrollments: {
                    include: { course: true }
                },
                transactions: {
                   include: { course: true },
                   orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: 'Error al obtener detalle' }, { status: 500 });
    }
}
