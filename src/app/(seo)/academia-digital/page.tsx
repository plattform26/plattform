import { Metadata } from 'next';
import SeoLandingTemplate from '@/components/seo/SeoLandingTemplate';

export const metadata: Metadata = {
  title: 'Crea tu Academia Digital en México | Plattform',
  description: 'Lanza tu academia digital con cursos, alumnos, contenidos y herramientas de venta en una sola plataforma educativa profesional.',
  alternates: {
    canonical: 'https://plattform.mx/academia-digital',
  },
};

export default function AcademiaDigitalPage() {
  const activeSlug = '/academia-digital';

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
            'name': 'Academia Digital',
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
            'name': '¿Cómo puedo crear una academia digital?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Con Plattform, solo necesitas registrarte como instructor, configurar los datos de tu academia, estructurar tus lecciones en el constructor de cursos y comenzar a recibir estudiantes de inmediato.',
            },
          },
          {
            '@type': 'Question',
            'name': '¿Puedo personalizar mi academia digital?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Sí, Plattform te permite definir tu propio perfil, logotipo y banner institucional, así como configurar un slug o identificador único para que tu marca destaque ante los alumnos.',
            },
          },
          {
            '@type': 'Question',
            'name': '¿Qué herramientas de venta ofrece Plattform?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Plattform ofrece páginas de checkout seguras, cupones de descuento personalizables por porcentaje o valor fijo, y cobros automatizados con transferencia directa vía Stripe Connect.',
            },
          },
          {
            '@type': 'Question',
            'name': '¿Necesito infraestructura propia para los videos?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'No. Plattform te permite incrustar recursos de forma responsiva utilizando tus plataformas de hosting preferidas (YouTube, Vimeo, Loom, o Google Drive), evitando costos innecesarios.',
            },
          },
          {
            '@type': 'Question',
            'name': '¿Cuál es el costo de Plattform para academias?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Puedes iniciar hoy mismo con nuestro Plan Starter de $199 MXN al mes, diseñado para brindarte una infraestructura robusta y profesional desde tu primer día de operación.',
            },
          },
        ],
      },
    ],
  };

  const faqs = [
    {
      q: '¿Cómo puedo crear una academia digital?',
      a: 'Con Plattform, solo necesitas registrarte como instructor, configurar los datos de tu academia, estructurar tus lecciones en el constructor de cursos y comenzar a recibir estudiantes de inmediato.',
    },
    {
      q: '¿Puedo personalizar mi academia digital?',
      a: 'Sí, Plattform te permite definir tu propio perfil, logotipo y banner institucional, así como configurar un slug o identificador único para que tu marca destaque ante los alumnos.',
    },
    {
      q: '¿Qué herramientas de venta ofrece Plattform?',
      a: 'Plattform ofrece páginas de checkout seguras, cupones de descuento personalizables por porcentaje o valor fijo, y cobros automatizados con transferencia directa vía Stripe Connect.',
    },
    {
      q: '¿Necesito infraestructura propia para los videos?',
      a: 'No. Plattform te permite incrustar recursos de forma responsiva utilizando tus plataformas de hosting preferidas (YouTube, Vimeo, Loom, o Google Drive), evitando costos innecesarios de almacenamiento.',
    },
    {
      q: '¿Cuál es el costo de Plattform para academias?',
      a: 'Puedes iniciar hoy mismo con nuestro Plan Starter de $199 MXN al mes, diseñado para brindarte una infraestructura robusta y profesional desde tu primer día de operación.',
    },
  ];

  const benefits = [
    {
      title: 'Creación de academia desde cero',
      description: 'Lanza tu escuela digital en minutos, con un portal de administración intuitivo para configurar la información y el diseño básico.',
      icon: '🚀',
    },
    {
      title: 'Estructuración modular de cursos',
      description: 'Organiza tus lecciones y recursos por módulos para facilitar el aprendizaje secuencial y estructurado de los alumnos.',
      icon: '📂',
    },
    {
      title: 'Procesamiento de inscripciones y cobros',
      description: 'Automatiza el proceso completo de inscripción. Tus alumnos pagan de forma segura y el sistema les otorga acceso automático al instante.',
      icon: '💳',
    },
    {
      title: 'Monitoreo y control administrativo',
      description: 'Lleva el registro ordenado de tus usuarios inscritos, supervisa las lecciones vistas y administra su estatus de pago.',
      icon: '📊',
    },
  ];

  const forWhom = [
    {
      title: 'Emprendedores Educativos',
      description: 'Para aquellos que buscan iniciar un negocio en línea vendiendo capacitaciones, talleres y diplomados de forma recurrente.',
      icon: '💼',
    },
    {
      title: 'Centros de Capacitación',
      description: 'Escuelas, centros de idiomas y organismos de formación que necesitan transicionar sus operaciones físicas al formato digital.',
      icon: '🏫',
    },
    {
      title: 'Marcas y Empresas',
      description: 'Organizaciones que buscan estructurar portales de capacitación interna para sus colaboradores o canales de distribución de valor.',
      icon: '🏢',
    },
  ];

  const diferenciadores = [
    {
      title: 'Infraestructura SaaS completa',
      description: 'Hosting básico de temarios, bases de datos y procesamiento de pagos resueltos en una única suscripción estable.',
      icon: '⚡',
    },
    {
      title: 'Diseño moderno premium',
      description: 'Una experiencia educativa atractiva y pulida que incrementa la confianza del comprador y el prestigio de tu marca.',
      icon: '🎨',
    },
    {
      title: 'Plan Starter para iniciar',
      description: 'Soporte y herramientas completas para tu lanzamiento al mercado digital por solo $199 MXN mensuales.',
      icon: '💳',
    },
  ];

  return (
    <SeoLandingTemplate
      activeSlug={activeSlug}
      eyebrow="Academia digital"
      h1={
        <>
          Crea tu propia <br className="hidden md:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            academia digital
          </span>
        </>
      }
      subheading="Construye un espacio educativo online para publicar cursos, organizar alumnos y convertir tu conocimiento en una experiencia escalable."
      ctaText="Lanzar mi academia"
      ctaSecondaryText="Ver cómo funciona Plattform"
      ctaSecondaryHref="#features"
      bullets={[
        'Lanza tu escuela digital hoy mismo',
        'Administra cursos y alumnos en un solo lugar',
        'Plan Starter desde $199 MXN al mes',
      ]}
      benefitsTitle="La estructura ideal para tu escuela online"
      benefits={benefits}
      forWhomTitle="Crecimiento y escalabilidad para tu marca"
      forWhom={forWhom}
      diferenciadoresTitle="Por qué Plattform es tu mejor opción"
      diferenciadores={diferenciadores}
      faqs={faqs}
      jsonLd={jsonLd}
    />
  );
}
