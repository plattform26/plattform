import { Metadata } from 'next';
import SeoLandingTemplate from '@/components/seo/SeoLandingTemplate';

export const metadata: Metadata = {
  title: 'Plataforma de Cursos Online en México | Plattform',
  description: 'Crea, publica y vende cursos online con Plataforma LMS profesional e Inteligencia Artificial integrada. Regístrate hoy.',
  alternates: {
    canonical: 'https://plattform.mx/plataforma-de-cursos-online',
  },
};

export default function PlataformaCursosOnlinePage() {
  const activeSlug = '/plataforma-de-cursos-online';

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
            'name': 'Plataforma de Cursos Online',
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
            'name': '¿Qué es una plataforma de cursos online?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Es una herramienta tecnológica (LMS) que permite a creadores, expertos y academias subir lecciones, hospedar videos, estructurar temarios y administrar alumnos en un entorno digital centralizado.',
            },
          },
          {
            '@type': 'Question',
            'name': '¿Puedo vender cursos con Plattform?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Sí, Plattform integra Stripe Connect para que recibas los pagos de tus cursos directamente en tu cuenta bancaria en México, sin intermediación ni plazos forzosos.',
            },
          },
          {
            '@type': 'Question',
            'name': '¿Necesito conocimientos técnicos para crear mi academia?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'No. Plattform está diseñada para que puedas estructurar tus cursos, dar de alta módulos y configurar tu landing de venta de forma visual sin escribir una sola línea de código.',
            },
          },
          {
            '@type': 'Question',
            'name': '¿Cuál es el costo del Plan Starter?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'El Plan Starter tiene un costo de $199 MXN al mes y te ofrece hosting de contenido, la posibilidad de crear cursos y administrar tus primeros estudiantes de forma profesional.',
            },
          },
          {
            '@type': 'Question',
            'name': '¿Plattform funciona para creadores en México?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Sí, Plattform está completamente optimizada para el mercado mexicano, con soporte para cobros locales en pesos (MXN) y facturación integrada vía Stripe.',
            },
          },
        ],
      },
    ],
  };

  const faqs = [
    {
      q: '¿Qué es una plataforma de cursos online?',
      a: 'Es una herramienta tecnológica (LMS) que permite a creadores, expertos y academias subir lecciones, hospedar videos, estructurar temarios y administrar alumnos en un entorno digital centralizado.',
    },
    {
      q: '¿Puedo vender cursos con Plattform?',
      a: 'Sí, Plattform integra Stripe Connect para que recibas los pagos de tus cursos directamente en tu cuenta bancaria en México, sin intermediación ni plazos forzosos.',
    },
    {
      q: '¿Necesito conocimientos técnicos para crear mi academia?',
      a: 'No. Plattform está diseñada para que puedas estructurar tus cursos, dar de alta módulos y configurar tu landing de venta de forma visual sin escribir una sola línea de código.',
    },
    {
      q: '¿Cuál es el costo del Plan Starter?',
      a: 'El Plan Starter tiene un costo de $199 MXN al mes y te ofrece hosting de contenido, la posibilidad de crear cursos y administrar tus primeros estudiantes de forma profesional.',
    },
    {
      q: '¿Plattform funciona para creadores en México?',
      a: 'Sí, Plattform está completamente optimizada para el mercado mexicano, con soporte para cobros locales en pesos (MXN) y facturación integrada vía Stripe Connect.',
    },
  ];

  const benefits = [
    {
      title: 'Crear cursos online estructurados',
      description: 'Organiza tus lecciones en módulos lógicos, sube contenido multimedia, y añade texto enriquecido de forma sencilla.',
      icon: '🎓',
    },
    {
      title: 'Organizar módulos y lecciones',
      description: 'Un editor fluido que te permite reordenar el temario y estructurar el aprendizaje de tus alumnos de forma lógica.',
      icon: '📝',
    },
    {
      title: 'Administrar alumnos sin esfuerzo',
      description: 'Controla quién tiene acceso a tus cursos, visualiza el avance académico de cada estudiante y expide certificados de finalización.',
      icon: '👥',
    },
    {
      title: 'Publicar contenidos educativos premium',
      description: 'Una experiencia de visualización para el estudiante en modo oscuro que evita la fatiga visual y potencia la finalización de los cursos.',
      icon: '✨',
    },
  ];

  const forWhom = [
    {
      title: 'Docentes y Expertos',
      description: 'Para profesionales independientes que desean empaquetar su conocimiento en un formato digital estructurado.',
      icon: '👨‍🏫',
    },
    {
      title: 'Coaches y Consultores',
      description: 'Automatiza tus explicaciones repetitivas con cursos grabados y reserva tu tiempo presencial para asesoría personalizada.',
      icon: '🧠',
    },
    {
      title: 'Academias y Escuelas',
      description: 'Migra tus cursos al entorno digital con una plataforma LMS robusta y elegante bajo el control de tu propia marca.',
      icon: '🏫',
    },
  ];

  const diferenciadores = [
    {
      title: 'LMS Profesional Elegante',
      description: 'Interfaz en cian y oscuro diseñada con estándares modernos para que tu academia luzca al nivel de las mejores del mundo.',
      icon: '💎',
    },
    {
      title: 'Administración Sencilla',
      description: 'Sin configuraciones complejas de servidores, plugins o sistemas lentos. Todo funciona de forma integrada.',
      icon: '⚙️',
    },
    {
      title: 'Plan Starter Accesible',
      description: 'Lanza tu academia digital por solo $199 MXN al mes, con hosting incluido y todas las herramientas básicas activadas.',
      icon: '💳',
    },
  ];

  return (
    <SeoLandingTemplate
      activeSlug={activeSlug}
      eyebrow="Plataforma de cursos online"
      h1={
        <>
          Plataforma de cursos online <br className="hidden md:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            para crear tu academia digital
          </span>
        </>
      }
      subheading="Crea cursos, organiza contenidos, administra alumnos y convierte tu conocimiento en una experiencia educativa profesional."
      ctaText="Comenzar ahora"
      ctaSecondaryText="Conocer cómo funciona"
      ctaSecondaryHref="#features"
      bullets={[
        'Crea y publica cursos online',
        'Administra alumnos y contenidos',
        'Lanza tu academia digital en México',
      ]}
      benefitsTitle="La infraestructura completa para tu conocimiento online"
      benefits={benefits}
      forWhomTitle="Diseñada para transformar la educación digital"
      forWhom={forWhom}
      diferenciadoresTitle="Por qué Plattform es diferente"
      diferenciadores={diferenciadores}
      faqs={faqs}
      jsonLd={jsonLd}
    />
  );
}
