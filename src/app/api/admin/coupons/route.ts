import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const coupons = await prisma.coupon.findMany({
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        },
        _count: {
          select: { usages: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(coupons);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { 
      code, 
      discountPercent, 
      usageLimit, 
      expirationDate, 
      courseId 
    } = await req.json();

    const normalizedCode = code.toUpperCase().trim();

    // 1. Validar si ya existe
    const existing = await prisma.coupon.findUnique({
      where: { code: normalizedCode }
    });

    if (existing) {
      return NextResponse.json({ error: 'El código de cupón ya existe' }, { status: 400 });
    }

    // 2. Crear Cupón en Stripe
    // Nota: Stripe Coupons se pueden crear con percent_off
    const stripeCoupon = await stripe.coupons.create({
      percent_off: discountPercent,
      duration: 'once', 
      id: normalizedCode, // Usamos el mismo código como ID en Stripe para facilidad
      name: `${discountPercent}% OFF - ${normalizedCode}`,
      // max_redemptions y redeem_by se pueden sincronizar también
      max_redemptions: usageLimit || undefined,
      redeem_by: expirationDate ? Math.floor(new Date(expirationDate).getTime() / 1000) : undefined,
    });

    // 3. Guardar en Base de Datos
    const coupon = await prisma.coupon.create({
      data: {
        code: normalizedCode,
        discountPercent: Number(discountPercent),
        usageLimit: usageLimit ? Number(usageLimit) : null,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        courseId: courseId || null,
        stripeCouponId: stripeCoupon.id,
        isActive: true
      }
    });

    return NextResponse.json(coupon);
  } catch (error: any) {
    console.error('Error creating coupon:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
