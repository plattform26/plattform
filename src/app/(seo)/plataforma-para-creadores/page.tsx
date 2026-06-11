import { Metadata } from 'next';
import SeoLandingTemplate from '@/components/seo/SeoLandingTemplate';

export const metadata: Metadata = {
  title: 'Plataforma para Creadores de Cursos | Plattform',
  description: 'Convierte tu conocimiento en cursos online. Plattform ayuda a creadores, expertos y comunidades a lanzar experiencias educativas digitales en México.',
  alternates: {
    canonical: 'https://plattform.mx/plataforma-para-creadores',
  },
};

export default function PlataformaCreadoresPage() {
  const activeSlug = '/plataforma-para-creadores';

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
            'name': 'Plataforma para Creadores',
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
            'name': '¿Cómo ayuda Plattform a los creadores de cursos?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Plattform provee la infraestructura completa para que creadores y expertos empaqueten sus conocimientos en lecciones interactivas, cobren de forma directa y brinden a su comunidad una experiencia de estudio premium.',
            },
          },
          {
            '@type': 'Question',
            'name': '¿Tengo que pagar comisiones altas por mis ventas?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'No. Plattform ofrece un esquema de comisiones bajas que decrece a medida que tu academia escala en suscripción, asegurando que retengas la mayor parte del valor generado por tu contenido.',
            },
          },
          {
            '@type': 'Question',
            'name': '¿Puedo integrar audio, video y material multimedia?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Sí, Plattform cuenta con un editor de lecciones que soporta archivos PDF y permite incrustar recursos de forma responsiva desde plataformas como YouTube, Vimeo, Loom o Google Drive.',
            },
          },
          {
            '@type': 'Question',
            'name': '¿La plataforma funciona para comunidades en México?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Sí. Está totalmente optimizada en español, con soporte para pagos en pesos mexicanos (MXN) a través de cuentas locales conectadas nativamente con Stripe.',
            },
          },
          {
            '@type': 'Question',
            'name': '¿Cuál es el costo del Plan Starter para creadores?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'El costo del Plan Starter es de $199 MXN al mes. Incluye las herramientas fundamentales para que configures tu perfil, estructures tu temario y comiences a recibir alumnos.',
            },
          },
        ],
      },
    ],
  };

  const faqs = [
    {
      q: '¿Cómo ayuda Plattform a los creadores de cursos?',
      a: 'Plattform provee la infraestructura completa para que creadores y expertos empaqueten sus conocimientos en lecciones interactivas, cobren de forma directa y brinden a su comunidad una experiencia de estudio premium.',
    },
    {
      q: '¿Tengo que pagar comisiones altas por mis ventas?',
      a: 'No. Plattform ofrece un esquema de comisiones bajas que decrece a medida que tu academia escala en suscripción, asegurando que retengas la mayor parte del valor generado por tu contenido.',
    },
    {
      q: '¿Puedo integrar audio, video y material multimedia?',
      a: 'Sí, Plattform cuenta con un editor de lecciones que soporta archivos PDF y permite incrustar recursos de forma responsiva desde plataformas como YouTube, Vimeo, Loom o Google Drive.',
    },
    {
      q: '¿La plataforma funciona para comunidades en México?',
      a: 'Sí. Está totalmente optimizada en español, con soporte para pagos en pesos mexicanos (MXN) a través de cuentas locales conectadas nativamente con Stripe Connect.',
    },
    {
      q: '¿Cuál es el costo del Plan Starter para creadores?',
      a: 'El costo del Plan Starter es de $199 MXN al mes. Incluye las herramientas fundamentales para que configures tu perfil, estructures tu temario y comiences a recibir alumnos de forma profesional.',
    },
  ];

  const benefits = [
    {
      title: 'Monetización directa e inmediata',
      description: 'Recibe los pagos de tu comunidad directamente en tu cuenta bancaria. Plattform no retiene tus ganancias en cuentas intermediarias.',
      icon: '💳',
    },
    {
      title: 'Hospedaje multimedia profesional',
      description: 'Inserta tus videos y explicaciones de YouTube, Vimeo o Loom, y adjunta materiales complementarios como PDFs y lecturas.',
      icon: '🎥',
    },
    {
      title: 'Control absoluto del estudiante',
      description: 'Lleva el registro de tus alumnos, monitorea sus accesos y visualiza quiénes están completando el contenido de forma exitosa.',
      icon: '👥',
    },
    {
      title: 'Herramientas de IA para el temario',
      description: 'Supera la página en blanco. Utiliza nuestro copiloto inteligente para redactar el temario y la estructura de tus módulos.',
      icon: '🤖',
    },
  ];

  const forWhom = [
    {
      title: 'Creadores y Creadoras',
      description: 'Coaches, influencers y líderes de comunidad que desean brindar valor de alta calidad y monetizar su marca personal.',
      icon: '⭐',
    },
    {
      title: 'Consultores y Expertos',
      description: 'Para profesionales independientes que buscan escalar sus servicios de consultoría individual mediante infoproductos estructurados.',
      icon: '💼',
    },
    {
      title: 'Comunidades Online',
      description: 'Grupos organizados, foros y comunidades que requieren un portal educativo exclusivo para capacitar a sus miembros activos.',
      icon: '🌐',
    },
  ];

  const diferenciadores = [
    {
      title: 'LMS enfocado en UX/UI premium',
      description: 'Diseño en modo oscuro y cian que brinda un aspecto de alta gama a tus contenidos educativos y eleva tu posicionamiento de marca.',
      icon: '✨',
    },
    {
      title: 'Autonomía comercial completa',
      description: 'No somos un directorio de cursos compartido. En Plattform, tu academia representa a tu propia marca, sin anuncios de competidores.',
      icon: '🛡️',
    },
    {
      title: 'Plan Starter accesible para iniciar',
      description: 'Comienza tu viaje de instructor digital por solo $199 MXN al mes, con hosting para tu temario y Stripe Connect configurado.',
      icon: '💳',
    },
  ];

  return (
    <SeoLandingTemplate
      activeSlug={activeSlug}
      eyebrow="Plataforma para creadores"
      h1={
        <>
          Una plataforma para creadores <br className="hidden md:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            que quieren enseñar online
          </span>
        </>
      }
      subheading="Transforma tu experiencia en cursos, organiza tu contenido y crea una academia digital con una experiencia profesional para tus alumnos."
      ctaText="Crear mi curso online"
      ctaSecondaryText="Explorar herramientas para creadores"
      ctaSecondaryHref="#features"
      bullets={[
        'Transforma tus redes en negocio educativo',
        'Copiloto de IA para estructurar temarios',
        'Plan Starter desde $199 MXN al mes',
      ]}
      benefitsTitle="Todo lo que requiere un creador moderno para educar"
      benefits={benefits}
      forWhomTitle="Espacio ideal para la monetización de marca personal"
      forWhom={forWhom}
      diferenciadoresTitle="La diferencia de enseñar en Plattform"
      diferenciadores={diferenciadores}
      faqs={faqs}
      jsonLd={jsonLd}
    />
  );
}
