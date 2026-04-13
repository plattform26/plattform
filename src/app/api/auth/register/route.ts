import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { generateVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail, sendInstructorRegistrationNoticeToAdmin } from '@/lib/mail';
import { stripe } from '@/lib/stripe';
import { JWT_SECRET } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, lastName, birthDate, email, password, role, plan } = body;

    if (!name || !lastName || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (role === 'INSTRUCTOR' && !plan) {
      return NextResponse.json({ error: 'Plan is required for instructors' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Misión: Control de Calidad - Instructores quedan en PENDING_APPROVAL
    const initialStatus = role === 'INSTRUCTOR' ? 'PENDING_APPROVAL' : 'ACTIVE';

    const user = await prisma.user.create({
      data: {
        name,
        lastName,
        email,
        passwordHash,
        role,
        birthDate: birthDate ? new Date(birthDate) : null,
        status: initialStatus,
      },
    });

    // Misión: Blindaje de Acceso - Generar y Guardar Token en DB
    const verificationToken = await generateVerificationToken(user.email);
    
    // Envío Profesional vía Resend
    await sendVerificationEmail(user.email, verificationToken.token);

    // Notificar al Admin si es un Instructor nuevo
    if (role === 'INSTRUCTOR') {
      await sendInstructorRegistrationNoticeToAdmin(`${name} ${lastName}`, user.id);
    }

    if (role === 'STUDENT') {
      return NextResponse.json({
        message: 'Student registered successfully. Please verify your email.',
        redirectUrl: '/dashboard/student',
      });
    }

    if (role === 'INSTRUCTOR') {
      const platformPlan = await prisma.platformPlan.findUnique({
        where: { name: plan.toLowerCase() },
      });

      if (!platformPlan) {
        return NextResponse.json({ error: 'Selected plan not found' }, { status: 400 });
      }

      // 1. Create Instructor Profile Robustly
      const slugBase = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-");
      const instructorProfile = await prisma.instructorProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          academyName: `${user.name} Academy`,
          slug: `${slugBase}-${user.id.substring(0, 5)}`,
          commissionRate: platformPlan.commissionRate,
        },
      });

      try {
        // 2. Create Stripe Customer
        const stripeCustomer = await stripe.customers.create({
          email: user.email,
          name: `${user.name} ${user.lastName}`,
          metadata: {
            userId: user.id,
            instructorId: instructorProfile.id,
          },
        });

        // 3. Create Instructor Subscription (PENDING)
        const instructorSubscription = await prisma.instructorSubscription.create({
          data: {
            instructorId: instructorProfile.id,
            planId: platformPlan.id,
            stripeCustomerId: stripeCustomer.id,
            status: 'PAST_DUE', // Wait for checkout completion
            startedAt: new Date(),
          },
        });

        // 4. Create Stripe Checkout Session
        const checkoutSession = await stripe.checkout.sessions.create({
          customer: stripeCustomer.id,
          payment_method_types: ['card'],
          mode: 'subscription',
          line_items: [
            {
              price_data: {
                currency: 'mxn',
                product_data: {
                  name: `Plattform ${platformPlan.displayName} Plan`,
                  description: 'Suscripción para Instructores en Plattform',
                },
                unit_amount: Math.round(Number(platformPlan.monthlyPrice) * 100), // In cents
                recurring: { interval: 'month' },
              },
              quantity: 1,
            },
          ],
          metadata: {
            instructorSubscriptionId: instructorSubscription.id,
            userId: user.id,
            instructorProfileId: instructorProfile.id,
            planId: platformPlan.id,
          },
          success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/dashboard/instructor?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/register?canceled=true`,
        });

        return NextResponse.json({
          message: 'Instructor registered successfully. Redirecting to payment...',
          redirectUrl: checkoutSession.url,
        });
      } catch (stripeError: any) {
        console.error('Stripe block error but user/profile created:', stripeError);
        return NextResponse.json({
          message: 'User created but payment setup failed. Please contact support.',
          redirectUrl: '/dashboard/instructor',
          error: stripeError.message
        });
      }
    }

    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
