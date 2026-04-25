import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { validateCouponSchema } from '@/lib/validations/checkout';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 });
    }

    const body = await req.json();
    const validation = validateCouponSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Datos inválidos', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const { code, courseId } = validation.data;

    const normalizedCode = code.toUpperCase().trim();

    // 1. Buscar cupón
    const coupon = await prisma.coupon.findUnique({
      where: { code: normalizedCode }
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Código no encontrado' }, { status: 404 });
    }

    // 2. Validar Estado Activo
    if (!coupon.isActive) {
      return NextResponse.json({ error: 'Este cupón ya no está activo' }, { status: 400 });
    }

    // 3. Validar Restricción por Curso (Dual Logic)
    if (coupon.courseId && coupon.courseId !== courseId) {
      return NextResponse.json({ error: 'Este cupón no es válido para este curso' }, { status: 400 });
    }

    // 4. Validar Fecha de Expiración
    if (coupon.expirationDate && new Date() > new Date(coupon.expirationDate)) {
      return NextResponse.json({ error: 'Cupón expirado' }, { status: 400 });
    }

    // 5. Validar Límite de Usos Global
    const usageCount = await prisma.couponUsage.count({
      where: { couponId: coupon.id }
    });

    if (coupon.usageLimit && usageCount >= coupon.usageLimit) {
      return NextResponse.json({ error: 'Límite de usos alcanzado' }, { status: 400 });
    }

    // 6. Validar Uso Previo por el Usuario
    const userUsage = await prisma.couponUsage.findFirst({
      where: {
        userId: session.userId,
        couponId: coupon.id
      }
    });

    if (userUsage) {
      return NextResponse.json({ error: 'Ya utilizaste este código' }, { status: 400 });
    }

    // Si todo es válido, devolver información del cupón
    return NextResponse.json({
        id: coupon.id,
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        stripeCouponId: coupon.stripeCouponId
    });

  } catch (error: any) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({ error: 'Error al validar cupón' }, { status: 500 });
  }
}
