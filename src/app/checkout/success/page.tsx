import Link from 'next/link';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function SuccessPage({ searchParams }: { searchParams: { session_id?: string } }) {
  if (!searchParams.session_id) {
    redirect('/');
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(searchParams.session_id);
    const userId = session.metadata?.userId;
    const paymentType = session.metadata?.paymentType;

    if (session.payment_status !== 'paid' || !userId) {
      redirect('/');
    }

    if (paymentType === 'INSTRUCTOR_SUBSCRIPTION') {
      const planId = session.metadata?.planId;
      const instructorId = session.metadata?.instructorId;

      if (planId && instructorId) {
        const platformPlan = await prisma.platformPlan.findUnique({
          where: { id: planId }
        });

        await prisma.$transaction([
          prisma.instructorSubscription.upsert({
            where: { 
              id: (await prisma.instructorSubscription.findFirst({ where: { instructorId } }))?.id || 'new-sub' 
            },
            update: {
              status: 'ACTIVE',
              planId: planId,
              startedAt: new Date(),
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
              stripeSubscriptionId: session.subscription as string,
              stripeCustomerId: session.customer as string,
            },
            create: {
              instructorId,
              planId,
              status: 'ACTIVE',
              startedAt: new Date(),
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              stripeSubscriptionId: session.subscription as string,
              stripeCustomerId: session.customer as string,
            }
          }),
          prisma.transaction.create({
            data: {
              userId,
              paymentType: 'INSTRUCTOR_SUBSCRIPTION',
              grossAmount: platformPlan ? Number(platformPlan.monthlyPrice) : 0,
              netAmountToInstructor: 0, // En suscripciones la utilidad es de la plataforma
              platformCommissionAmount: platformPlan ? Number(platformPlan.monthlyPrice) : 0,
              paymentStatus: 'SUCCESS',
              paymentProvider: 'STRIPE',
              stripeSessionId: session.id,
            }
          })
        ]);
      }

      return (
        <div className="min-h-screen bg-[#070d1a] text-white flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-[#152035] border border-blue-500/20 rounded-3xl p-10 shadow-2xl">
             <div className="text-6xl mb-6">🚀</div>
             <h1 className="text-3xl font-space-grotesk font-black mb-4">¡Plan Activado!</h1>
             <p className="text-gray-400 mb-8 leading-relaxed">
               Tu suscripción ha sido procesada con éxito. Ya tienes acceso a todas las herramientas premium de Plattform para instructores.
             </p>
             <Link href="/dashboard/instructor" className="block w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl font-black text-black hover:scale-105 transition-transform shadow-lg shadow-blue-500/20">
                Ir a mi Dashboard →
             </Link>
          </div>
        </div>
      );
    }

    // Lógica para COMPRA DE CURSO (Alumno)
    // Lógica para COMPRA DE CURSO (Alumno)
    const courseId = session.metadata?.courseId;
    if (!courseId) redirect('/');

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { 
        instructor: { 
          include: { instructorProfile: true } 
        } 
      }
    });

    if (!course) redirect('/');

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } }
    });

    if (!existingEnrollment) {
      const grossAmount = Number(course.price);
      const commissionRate = Number(course.instructor.instructorProfile?.commissionRate || 10) / 100;
      const platformFee = grossAmount * commissionRate;
      const netToInstructor = grossAmount - platformFee;

      await prisma.$transaction([
        prisma.enrollment.create({
          data: { userId, courseId, status: 'ACTIVE' }
        }),
        prisma.transaction.create({
          data: {
            userId,
            courseId,
            instructorId: course.instructorId,
            paymentType: 'COURSE_PURCHASE',
            grossAmount: grossAmount,
            netAmountToInstructor: netToInstructor,
            platformCommissionAmount: platformFee,
            paymentStatus: 'SUCCESS',
            paymentProvider: 'STRIPE',
            stripeSessionId: session.id,
          }
        })
      ]);
    }

    return (
      <div className="min-h-screen bg-[#070d1a] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#152035] border border-blue-500/20 rounded-3xl p-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
           <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 animate-bounce">✅</div>
           <h1 className="text-3xl font-space-grotesk font-bold mb-4">¡Pago Exitoso! 🎉</h1>
           <p className="text-gray-400 mb-8 leading-relaxed">
             Tu inscripción al curso <span className="text-white font-bold">{course.title}</span> ha sido procesada con éxito. Ya tienes acceso completo al contenido.
           </p>
           
           <div className="space-y-4">
              <Link
                href={`/dashboard/student/learn/${courseId}`}
                className="block w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg shadow-cyan-500/20"
              >
                Empezar a aprender ahora →
              </Link>
              <Link
                href={`/courses/${course.slug}`}
                className="block w-full py-4 border border-blue-500/20 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-blue-500/10 transition-colors"
              >
                Volver al detalle
              </Link>
           </div>

           <p className="mt-10 text-xs text-gray-500">
             Hemos enviado una confirmación de pago a tu correo electrónico. Si tienes problemas, contacta a soporte@plattform.com.
           </p>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Success page error:', error);
    return (
      <div className="min-h-screen bg-[#070d1a] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error al procesar la sesión de pago</h1>
          <Link href="/" className="text-cyan-400">Volver al inicio</Link>
        </div>
      </div>
    );
  }
}
