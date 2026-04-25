import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { instructorUpdateProfileSchema } from '@/lib/validations/profiles';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.instructorProfile.findUnique({
      where: { userId: session.userId },
      include: { 
        user: { 
          select: { id: true, name: true, lastName: true, email: true } 
        } 
      }
    });

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    
    return NextResponse.json(profile);

  } catch (error) {
    console.error('API /instructor/profile GET critical error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = instructorUpdateProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Datos inválidos', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const { academyName, slug, description, institution, logoUrl, bannerUrl, linkedinUrl, specialty } = validation.data;

    if (slug) {
      // Check slug uniqueness
      const existing = await prisma.instructorProfile.findUnique({ where: { slug } });
      if (existing && existing.userId !== session.userId) {
        return NextResponse.json({ error: 'Slug already taken by another academy' }, { status: 409 });
      }
    }

    const updatedProfile = await prisma.instructorProfile.update({
      where: { userId: session.userId },
      data: {
        ...(academyName !== undefined ? { academyName } : {}),
        ...(slug !== undefined ? { slug } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(institution !== undefined ? { institution } : {}),
        ...(logoUrl !== undefined ? { logoUrl } : {}),
        ...(bannerUrl !== undefined ? { bannerUrl } : {}),
        ...(linkedinUrl !== undefined ? { linkedinUrl } : {}),
        ...(specialty !== undefined ? { specialty } : {}),
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error: any) {
    console.error('API /instructor/profile PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
