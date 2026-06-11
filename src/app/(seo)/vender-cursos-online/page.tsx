import { Metadata } from 'next';
import SeoLandingTemplate from '@/components/seo/SeoLandingTemplate';

export const metadata: Metadata = {
  title: 'Vender Cursos Online en México | Plattform',
  description: 'Convierte tu conocimiento en ingresos. Crea, publica y vende cursos online con una plataforma profesional para creadores, expertos y academias en México.',
  alternates: {
    canonical: 'https://plattform.mx/vender-cursos-online',
  },
};

export default function VenderCursosOnlinePage() {
  const activeSlug = '/vender-cursos-online';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': `https://plattform.mx${activeSlug}#software`,
        'name': 'Plattform',
        'operatingSystem': 'All',
        'applicationCategory': 'EducationalApplication',
        'offers': {
          '@type': 'Offer',
          'price': '199.00',
          'priceCurrency': 'MXN',
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `https://plattform.mx${activeSlug}#breadcrumb`,
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Inicio',
            'item': 'https://plattform.mx',
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Vender Cursos Online',
            'item': `https://plattform.mx${activeSlug}`,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `https://plattform.mx${activeSlug}#faq`,
        'mainEntity': [
          {
            '@type': 'Question',
            'name': '¿Cómo puedo vender mis cursos online con Plattform?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Puedes conectar tu cuenta bancaria a través de Stripe Connect, establecer el precio de tus cursos y Plattform automatizará el cobro, el registro del alumno y el acceso a las lecciones.',
            },
          },
          {
            '@type': 'Question',
            'name': '¿Qué comisiones cobra Plattform por cada curso vendido?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Plattform ofrece comisiones bajas y transparentes dependiendo de tu nivel de plan. En el plan Starter es del 15% por venta, disminuyendo en planes superiores conforme crece tu volumen de facturación.',
            },
          },
          {
            '@type': 'Question',
            'name': '¿Cómo recibo las ganancias de mis estudiantes?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Los fondos cobrados por la venta de tus cursos se depositan de manera automatizada y directa en tu cuenta bancaria mediante Stripe, eliminando intermediarios y plazos de retención.',
            },
          },
          {
            '@type': 'Question',
            'name': '¿Es seguro el procesamiento de pagos?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Sí, Plattform utiliza la infraestructura de Stripe, cumpliendo con los estándares internacionales más estrictos de seguridad de nivel bancario (PCI-DSS) para proteger los datos financieros de tu academia y tus clientes.',
            },
          },
          {
            '@type': 'Question',
            'name': '¿Cuál es el costo para comenzar a vender?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Puedes iniciar hoy mismo con nuestro Plan Starter de $199 MXN mensuales, el cual te brinda la infraestructura básica de hosting, pasarela de pago y gestión de alumnos.',
            },
          },
        ],
      },
    ],
  };

  const faqs = [
    {
      q: '¿Cómo puedo vender mis cursos online con Plattform?',
      a: 'Puedes conectar tu cuenta bancaria a través de Stripe Connect, establecer el precio de tus cursos y Plattform automatizará el cobro, el registro del alumno y el acceso a las lecciones.',
    },
    {
      q: '¿Qué comisiones cobra Plattform por cada curso vendido?',
      a: 'Plattform ofrece comisiones bajas y transparentes dependiendo de tu nivel de plan. En el plan Starter es del 15% por venta, disminuyendo en planes superiores conforme crece tu volumen de facturación.',
    },
    {
      q: '¿Cómo recibo las ganancias de mis estudiantes?',
      a: 'Los fondos cobrados por la venta de tus cursos se depositan de manera automatizada y directa en tu cuenta bancaria mediante Stripe, eliminando intermediarios y plazos de retención.',
    },
    {
      q: '¿Es seguro el procesamiento de pagos?',
      a: 'Sí, Plattform utiliza la infraestructura de Stripe, cumpliendo con los estándares internacionales más estrictos de seguridad de nivel bancario (PCI-DSS) para proteger los datos financieros de tu academia y tus clientes.',
    },
    {
      q: '¿Cuál es el costo para comenzar a vender?',
      a: 'Puedes iniciar hoy mismo con nuestro Plan Starter de $199 MXN mensuales, el cual te brinda la infraestructura básica de hosting, pasarela de pago y gestión de alumnos.',
    },
  ];

  const benefits = [
    {
      title: 'Procesamiento de pagos directo',
      description: 'Vincula tu cuenta a través de Stripe Connect para recibir el dinero de tus ventas de manera directa en tu banco en pesos mexicanos.',
      icon: '💳',
    },
    {
      title: 'Monetización sin intermediarios',
      description: 'Olvídate de retenciones manuales de ganancias. Tus alumnos pagan y los fondos se transfieren automáticamente.',
      icon: '💰',
    },
    {
      title: 'Experiencia de compra profesional',
      description: 'Ofrece a tus estudiantes una pasarela de pago segura con soporte para tarjetas de crédito, débito y métodos de pago locales.',
      icon: '🔒',
    },
    {
      title: 'Cupones de descuento flexibles',
      description: 'Crea promociones por porcentaje o monto fijo para incentivar las inscripciones y medir tus campañas de marketing.',
      icon: '🏷️',
    },
  ];

  const forWhom = [
    {
      title: 'Creadores de Contenido',
      description: 'Monetiza tu comunidad en redes sociales ofreciendo cursos estructurados y de alto valor sin depender de publicidad.',
      icon: '📱',
    },
    {
      title: 'Consultores y Coaches',
      description: 'Empaqueta tus metodologías de asesoría en cursos pregrabados y amplía tu capacidad de generar ingresos recurrentes.',
      icon: '🎯',
    },
    {
      title: 'Expertos y Profesionales',
      description: 'Comparte tu experiencia laboral o académica y crea un canal de ingresos automatizado compartiendo tus conocimientos.',
      icon: '💼',
    },
  ];

  const diferenciadores = [
    {
      title: 'Integración nativa con Stripe',
      description: 'La pasarela de pago número uno del mundo conectada de forma directa con tu academia digital sin configuraciones complejas.',
      icon: '⚡',
    },
    {
      title: 'Comisiones de plataforma claras',
      description: 'Sin letras chiquitas. Las tarifas de comisión por transacción se reducen a medida que escalas tu plan mensual.',
      icon: '📊',
    },
    {
      title: 'Hosting y ancho de banda',
      description: 'El plan Starter de $199 MXN mensuales cubre el alojamiento básico de tu temario para que lances tu curso hoy mismo.',
      icon: '🌐',
    },
  ];

  return (
    <SeoLandingTemplate
      activeSlug={activeSlug}
      eyebrow="Vender cursos online"
      h1={
        <>
          Vende tus cursos online <br className="hidden md:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            con una plataforma profesional
          </span>
        </>
      }
      subheading="Deja de improvisar con enlaces sueltos, archivos dispersos o procesos manuales. Organiza tu oferta educativa y empieza a vender tu conocimiento online."
      ctaText="Empezar a vender cursos"
      ctaSecondaryText="Ver beneficios para creadores"
      ctaSecondaryHref="#features"
      bullets={[
        'Vende conocimiento de forma profesional',
        'Pasarela de pago Stripe Connect integrada',
        'Plan Starter desde $199 MXN al mes',
      ]}
      benefitsTitle="Todo lo que necesitas para monetizar tu academia"
      benefits={benefits}
      forWhomTitle="Ideal para creadores y expertos en México"
      forWhom={forWhom}
      diferenciadoresTitle="La diferencia de vender con Plattform"
      diferenciadores={diferenciadores}
      faqs={faqs}
      jsonLd={jsonLd}
    />
  );
}
