import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { getEffectivePlan } from '@/lib/plan-utils';
import { createCheckoutSessionSchema } from '@/lib/validations/checkout';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Debes iniciar sesión para comprar' }, { status: 401 });
    }

    const body = await req.json();
    const validation = createCheckoutSessionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Datos inválidos', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const { courseId, couponCode } = validation.data;

    // 1. Verificar que el curso exista y esté publicado
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { instructor: true },
    });

    if (!course || course.status !== 'PUBLISHED') {
      const errorMsg = course?.status === 'HIBERNATED' 
        ? 'Esta academia se encuentra en hibernación temporal. Las nuevas inscripciones están deshabilitadas.'
        : 'El curso no está disponible para compra';
      return NextResponse.json({ error: errorMsg }, { status: 404 });
    }

    // 1.1 VALIDAR LÍMITE DE ALUMNOS (GATEKEEPING SAAS)
    const effectivePlan = await getEffectivePlan(course.instructorId);

    // Bloqueo si no hay plan efectivo (ni suscripción ni cortesía)
    if (!effectivePlan) {
      return NextResponse.json({ error: 'Esta academia no puede recibir nuevas inscripciones en este momento.' }, { status: 403 });
    }

    const currentEnrollments = await prisma.enrollment.count({
      where: { course: { instructorId: course.instructorId } }
    });
    
    // Hard Stop: Bloqueo si Alumnos-Materia >= Límite
    if (effectivePlan.studentLimit !== -1 && currentEnrollments >= effectivePlan.studentLimit) {
      return NextResponse.json({ 
        error: 'Límite de alumnos alcanzado',
        details: `Tu academia ha llegado al tope de ${effectivePlan.studentLimit} inscripciones permitidas por tu plan actual (${effectivePlan.displayName}). Por favor, contacta al instructor o espera a un upgrade de plan.` 
      }, { status: 403 });
    }

    // 2. Verificar si ya está inscrito
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.userId,
          courseId: courseId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json({ error: 'Ya estás inscrito en este curso' }, { status: 400 });
    }

    // 3. Lógica de Cupones Inteligente (Dual: Global o por Curso)
    let stripeCouponId = null;
    let finalPrice = Number(course.price);

    if (couponCode) {
      const normalizedCode = couponCode.toUpperCase().trim();
      const coupon = await prisma.coupon.findUnique({
        where: { code: normalizedCode },
      });

      if (!coupon || !coupon.isActive) {
        return NextResponse.json({ error: 'Cupón no válido o inactivo' }, { status: 400 });
      }

      // Validar Restricción por Curso
      if (coupon.courseId && coupon.courseId !== courseId) {
        return NextResponse.json({ error: 'Este cupón no aplica para este curso' }, { status: 400 });
      }

      // Validar expiración
      if (coupon.expirationDate && new Date() > new Date(coupon.expirationDate)) {
        return NextResponse.json({ error: 'El cupón ha expirado' }, { status: 400 });
      }

      // Validar uso previo por el usuario
      const userUsage = await prisma.couponUsage.findFirst({
        where: { userId: session.userId, couponId: coupon.id }
      });

      if (userUsage) {
        return NextResponse.json({ error: 'Ya has utilizado este cupón' }, { status: 400 });
      }

      // Validar límite de usos global
      const usageCount = await prisma.couponUsage.count({
        where: { couponId: coupon.id }
      });

      if (coupon.usageLimit && usageCount >= coupon.usageLimit) {
        return NextResponse.json({ error: 'Límite de usos alcanzado para este cupón' }, { status: 400 });
      }

      // Aplicar descuento para lógica interna (Costo 0)
      const discountAmount = (finalPrice * coupon.discountPercent) / 100;
      finalPrice = finalPrice - discountAmount;
      stripeCouponId = coupon.stripeCouponId;
    }

    // 4. Manejo de Inscripción Gratuita (Precio 0)
    if (finalPrice <= 0) {
      await prisma.$transaction(async (tx: any) => {
        // 1. Crear Enrollment
        await tx.enrollment.upsert({
          where: { userId_courseId: { userId: session.userId, courseId: courseId } },
          update: { status: 'ACTIVE' },
          create: {
            userId: session.userId,
            courseId: courseId,
            accessType: 'PURCHASE',
            status: 'ACTIVE'
          }
        });

        // 2. Crear Registro de Transacción (Costo 0)
        await tx.transaction.create({
          data: {
            userId: session.userId,
            courseId: courseId,
            instructorId: course.instructorId,
            paymentType: 'COURSE_PURCHASE',
            grossAmount: 0,
            netAmountToInstructor: 0,
            platformCommissionAmount: 0,
            paymentStatus: 'SUCCESS',
            paymentProvider: 'STRIPE', // Marcamos como Stripe para consistencia aunque sea bypass
            stripeSessionId: `free_${Date.now()}`,
          }
        });

        // 3. Registrar uso de Cupón si existe
        if (couponCode) {
          const coupon = await tx.coupon.findUnique({
            where: { code: couponCode.toUpperCase().trim() }
          });
          if (coupon) {
            await tx.couponUsage.create({
              data: {
                userId: session.userId,
                couponId: coupon.id
              }
            });
          }
        }

        // 4. Notificación al Instructor
        await tx.notification.create({
          data: {
            userId: course.instructorId,
            type: 'COURSE_PURCHASED',
            title: '🎉 Nueva inscripción gratuita',
            message: `Un nuevo alumno se ha inscrito gratis a tu curso: ${course.title}.`,
            relatedEntityType: 'COURSE',
            relatedEntityId: course.id
          }
        });
      });

      // Redirigir directamente al éxito pasando el ID del curso para reconexión visual en el éxito
      const baseUrl = (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '');
      const redirectUrl = `${baseUrl}/checkout/success?session_id=free&courseId=${courseId}`;
      return NextResponse.json({ url: redirectUrl });
    }

    // 5. Asegurar Existencia de Producto y Precio en Stripe (Usando Precio ORIGINAL)
    let stripePriceId = (course as any).stripePriceId;

    if (!stripePriceId) {
      // Filtrar thumbnail: Solo si es una URL absoluta válida
      const validImages = course.thumbnailUrl?.startsWith('http') ? [course.thumbnailUrl] : [];
      
      const product = await stripe.products.create({
        name: course.title,
        description: course.description?.substring(0, 500) || '',
        images: validImages,
        metadata: { courseId: course.id }
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(Number(course.price) * 100), // Precio Base Original
        currency: 'mxn',
        metadata: { courseId: course.id }
      });

      stripePriceId = price.id;

      // Persistir en DB
      await prisma.course.update({
        where: { id: courseId },
        data: {
          stripeProductId: product.id,
          stripePriceId: price.id
        } as any
      });
    }

    // 6. Configuración de Split Payments (Stripe Connect)
    const instructorProfile = await prisma.instructorProfile.findUnique({
      where: { userId: course.instructorId }
    });

    const transferData = (instructorProfile?.stripeConnectId && instructorProfile?.stripeOnboardingComplete) 
      ? { destination: instructorProfile.stripeConnectId }
      : undefined;

    // 6.1 Cálculo Dinámico de Fee de Aplicación (SaaS Plattform)
    const effectivePlan = await getEffectivePlan(course.instructorId);
    const commissionRate = effectivePlan?.commissionRate || 15;
    const applicationFeeCents = Math.round(finalPrice * (commissionRate / 100) * 100);

    // 7. Crear Stripe Session
    const baseUrl = (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '');
    
    // IMPORTANTE: Stripe requiere URLs absolutas
    const success_url = `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancel_url = `${baseUrl}/courses/${course.slug}`;

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: session.email,
      success_url,
      cancel_url,
      discounts: stripeCouponId ? [{ coupon: stripeCouponId }] : undefined,
      metadata: {
        courseId: courseId,
        userId: session.userId,
        couponCode: couponCode || null,
        transactionType: 'COURSE_PURCHASE',
      },
      payment_intent_data: transferData ? {
        transfer_data: transferData,
        application_fee_amount: applicationFeeCents,
      } : undefined,
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error: any) {
    console.error('Create checkout session error:', error);
    return NextResponse.json({ 
      error: 'No se pudo crear la sesión de pago', 
      details: error.message 
    }, { status: 500 });
  }
}
