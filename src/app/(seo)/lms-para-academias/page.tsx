import { Metadata } from 'next';
import SeoLandingTemplate from '@/components/seo/SeoLandingTemplate';

export const metadata: Metadata = {
  title: 'LMS para Academias y Escuelas Online | Plattform',
  description: 'Administra cursos, alumnos, contenidos y cobros en un solo LMS. Plataforma profesional para academias, escuelas independientes y proyectos educativos en México.',
  alternates: {
    canonical: 'https://plattform.mx/lms-para-academias',
  },
};

export default function LmsParaAcademiasPage() {
  const activeSlug = '/lms-para-academias';

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
            'name': 'LMS para Academias',
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
            'name': '¿Qué es un LMS para academias?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Es un Sistema de Gestión de Aprendizaje (Learning Management System) que centraliza la publicación de cursos, control de inscripciones, evaluaciones y administración de estudiantes en una sola infraestructura.',
            },
          },
          {
            '@type': 'Question',
            'name': '¿Plattform sirve para academias y escuelas?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Sí, Plattform está diseñada para dar soporte a academias y escuelas independientes que necesitan un portal elegante y robusto para organizar su contenido y realizar cobros integrados.',
            },
          },
          {
            '@type': 'Question',
            'name': '¿Puedo administrar múltiples cursos y alumnos?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Sí, puedes organizar múltiples módulos y lecciones, gestionar inscripciones y observar las métricas de rendimiento y avance académico de tu comunidad de alumnos.',
            },
          },
          {
            '@type': 'Question',
            'name': '¿La plataforma permite emitir certificados?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Sí, el sistema de Plattform genera automáticamente certificados digitales en formato PDF con código QR y clave de verificación única una vez que el alumno aprueba el examen final.',
            },
          },
          {
            '@type': 'Question',
            'name': '¿Cuál es el costo del Plan Starter para academias?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'El costo del Plan Starter es de $199 MXN al mes. Es ideal para iniciar tu academia e incluye el soporte básico de infraestructura de e-learning.',
            },
          },
        ],
      },
    ],
  };

  const faqs = [
    {
      q: '¿Qué es un LMS para academias?',
      a: 'Es un Sistema de Gestión de Aprendizaje (Learning Management System) que centraliza la publicación de cursos, control de inscripciones, evaluaciones y administración de estudiantes en una sola infraestructura.',
    },
    {
      q: '¿Plattform sirve para academias y escuelas?',
      a: 'Sí, Plattform está diseñada para dar soporte a academias y escuelas independientes que necesitan un portal elegante y robusto para organizar su contenido y realizar cobros integrados.',
    },
    {
      q: '¿Puedo administrar múltiples cursos y alumnos?',
      a: 'Sí, puedes organizar múltiples módulos y lecciones, gestionar inscripciones y observar las métricas de rendimiento y avance académico de tu comunidad de alumnos.',
    },
    {
      q: '¿La plataforma permite emitir certificados?',
      a: 'Sí, el sistema de Plattform genera automáticamente certificados digitales en formato PDF con código QR y clave de verificación única una vez que el alumno aprueba el examen final del curso.',
    },
    {
      q: '¿Cuál es el costo del Plan Starter para academias?',
      a: 'El costo del Plan Starter es de $199 MXN al mes. Es ideal para iniciar tu academia de forma profesional y ordenada.',
    },
  ];

  const benefits = [
    {
      title: 'Gestión académica integrada',
      description: 'Supervisa el progreso de tus alumnos en tiempo real, verifica el avance en sus lecciones y gestiona sus accesos de forma remota.',
      icon: '⚙️',
    },
    {
      title: 'Estructuración modular sólida',
      description: 'Divide tu temario en módulos y lecciones organizadas para estructurar flujos de aprendizaje lógicos e intuitivos.',
      icon: '📂',
    },
    {
      title: 'Certificados oficiales automáticos',
      description: 'Incentiva la finalización de tus cursos emitiendo certificados automáticos con firmas digitales y código QR de verificación.',
      icon: '📜',
    },
    {
      title: 'Exámenes y quizzes interactivos',
      description: 'Evalúa el conocimiento de tus alumnos con preguntas de opción múltiple antes de liberar nuevos módulos o expedir el diploma.',
      icon: '✍️',
    },
  ];

  const forWhom = [
    {
      title: 'Academias de Capacitación',
      description: 'Para centros educativos privados que desean digitalizar su oferta de formación presencial en un portal LMS seguro y responsivo.',
      icon: '🏛️',
    },
    {
      title: 'Escuelas Independientes',
      description: 'Instituciones independientes que necesitan un espacio en línea para que sus profesores publiquen contenidos y califiquen a los alumnos.',
      icon: '🏫',
    },
    {
      title: 'Proyectos Educativos',
      description: 'Iniciativas y fundaciones que buscan centralizar y documentar material instructivo para comunidades de estudiantes específicas.',
      icon: '💡',
    },
  ];

  const diferenciadores = [
    {
      title: 'Portal LMS centralizado',
      description: 'Tus cursos, temarios, estudiantes, pasarela de pago y certificaciones residen en una sola herramienta optimizada y estable.',
      icon: '🌐',
    },
    {
      title: 'Validación en línea por QR',
      description: 'Cualquier empleador o institución puede escanear el QR del diploma emitido para verificar su autenticidad directamente en Plattform.',
      icon: '🛡️',
    },
    {
      title: 'Plan Starter accesible',
      description: 'Inicia la digitalización de tu escuela por solo $199 MXN al mes, con hosting incluido y panel administrativo completo.',
      icon: '💳',
    },
  ];

  return (
    <SeoLandingTemplate
      activeSlug={activeSlug}
      eyebrow="LMS para academias"
      h1={
        <>
          LMS para academias que <br className="hidden md:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            quieren crecer online
          </span>
        </>
      }
      subheading="Centraliza la operación de tu academia digital con una plataforma diseñada para organizar cursos, alumnos, contenidos y crecimiento educativo."
      ctaText="Crear academia en Plattform"
      ctaSecondaryText="Solicitar información"
      ctaSecondaryHref="#features"
      bullets={[
        'LMS robusto para control académico',
        'Certificaciones con validación QR',
        'Plan Starter desde $199 MXN al mes',
      ]}
      benefitsTitle="La herramienta de gestión educativa definitiva"
      benefits={benefits}
      forWhomTitle="Solución para escuelas y academias en crecimiento"
      forWhom={forWhom}
      diferenciadoresTitle="La diferencia de usar un LMS dedicado"
      diferenciadores={diferenciadores}
      faqs={faqs}
      jsonLd={jsonLd}
    />
  );
}
