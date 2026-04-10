import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Debes iniciar sesión para comprar' }, { status: 401 });
    }

    const { courseId, couponCode } = await req.json();

    if (!courseId) {
      return NextResponse.json({ error: 'Falta courseId' }, { status: 400 });
    }

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
    const activeSub = await prisma.instructorSubscription.findFirst({
      where: { 
        instructor: { userId: course.instructorId },
        status: 'ACTIVE' 
      },
      include: { plan: true }
    });

    // Bloqueo si no hay suscripción activa o si el límite fue alcanzado
    if (!activeSub) {
      return NextResponse.json({ error: 'Esta academia no puede recibir nuevas inscripciones en este momento.' }, { status: 403 });
    }

    const currentEnrollments = await prisma.enrollment.count({
      where: { course: { instructorId: course.instructorId } }
    });
    
    // Hard Stop: Bloqueo si Alumnos-Materia >= Límite
    if (activeSub.plan.studentLimit !== -1 && currentEnrollments >= activeSub.plan.studentLimit) {
      return NextResponse.json({ 
        error: 'Límite de alumnos alcanzado',
        details: `Tu academia ha llegado al tope de ${activeSub.plan.studentLimit} inscripciones permitidas por tu plan actual (${activeSub.plan.displayName}). Por favor, contacta al instructor o espera a un upgrade de plan.` 
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

    // 3. Lógica de Cupones
    let discountAmount = 0;
    let finalPrice = Number(course.price);

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: {
          courseId_code: {
            courseId: courseId,
            code: couponCode.toUpperCase(),
          },
        },
      });

      if (!coupon) {
        return NextResponse.json({ error: 'Cupón no válido para este curso' }, { status: 400 });
      }

      // Validar expiración (si existe)
      if (coupon.expiresAt && new Date() > coupon.expiresAt) {
        return NextResponse.json({ error: 'El cupón ha expirado' }, { status: 400 });
      }

      // Validar usos
      if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
        return NextResponse.json({ error: 'El cupón ha alcanzado el límite de usos' }, { status: 400 });
      }

      // Aplicar descuento
      discountAmount = (finalPrice * coupon.discountPercent) / 100;
      finalPrice = finalPrice - discountAmount;
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

        // 2. Notificación al Instructor
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

      // Redirigir directamente al éxito
      const redirectUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3001').replace(/\/$/, '') + `/checkout/success?session_id=free_${Date.now()}`;
      return NextResponse.json({ url: redirectUrl });
    }

    // 5. Asegurar Existencia de Producto y Precio en Stripe
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
        unit_amount: Math.round(finalPrice * 100),
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

    // 7. Crear Stripe Session
    const baseUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3001').replace(/\/$/, '');
    
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
      metadata: {
        courseId: courseId,
        userId: session.userId,
        couponCode: couponCode || null,
        transactionType: 'COURSE_PURCHASE',
      },
      payment_intent_data: transferData ? {
        transfer_data: transferData,
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
