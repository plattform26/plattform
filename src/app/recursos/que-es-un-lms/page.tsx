import { Metadata } from 'next';
import SeoArticleTemplate from '@/components/seo/SeoArticleTemplate';

export const metadata: Metadata = {
  title: 'Qué es un LMS y Para Qué Sirve en la Educación Online',
  description: 'Conoce qué es un LMS, cómo funciona y por qué ayuda a academias, escuelas y creadores a administrar cursos, alumnos y contenidos online.',
  alternates: {
    canonical: 'https://plattform.mx/recursos/que-es-un-lms',
  },
};

export default function QueEsUnLmsPage() {
  const activeSlug = '/recursos/que-es-un-lms';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `https://plattform.mx${activeSlug}#article`,
        'isPartOf': {
          '@type': 'WebPage',
          '@id': `https://plattform.mx${activeSlug}`,
        },
        'headline': 'Qué es un LMS y para qué sirve',
        'description': 'Conoce qué es un LMS, cómo funciona y por qué ayuda a academias, escuelas y creadores a administrar cursos, alumnos y contenidos online.',
        'inLanguage': 'es',
        'datePublished': '2026-06-08T12:00:00+00:00',
        'dateModified': '2026-06-08T12:00:00+00:00',
        'author': {
          '@type': 'Organization',
          'name': 'Plattform',
          'url': 'https://plattform.mx',
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'Plattform',
          'logo': {
            '@type': 'ImageObject',
            'url': 'https://plattform.mx/logo.png',
          },
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
            'name': 'Recursos',
            'item': 'https://plattform.mx/recursos',
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': 'Qué es un LMS',
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
            'name': '¿Qué significan las siglas LMS?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'LMS significa Learning Management System (Sistema de Gestión del Aprendizaje). Es un software diseñado para administrar, documentar, dar seguimiento, e impartir educación en línea.',
            },
          },
          {
            '@type': 'Question',
            'name': '¿Cuál es la diferencia entre Plattform y otros LMS corporativos?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Plattform está enfocada en la agilidad y experiencia de usuario. A diferencia de los LMS tradicionales (pesados y complejos de configurar), Plattform provee un constructor visual y pasarela de cobro simplificada.',
            },
          },
        ],
      },
    ],
  };

  const sections = [
    {
      title: '¿Qué significan las siglas LMS?',
      paragraphs: [
        'LMS corresponde a Learning Management System, traducido al español como Sistema de Gestión de Aprendizaje. Es un software basado en servidor o la nube estructurado con la finalidad específica de alojar y organizar contenido educativo, y facilitar el seguimiento del alumno.',
        'Actúa como un salón de clases virtual, donde los instructores pueden estructurar sus planes de estudio y los alumnos acceden con una cuenta individual para cursar lecciones y realizar exámenes.',
      ],
    },
    {
      title: '¿Para qué sirve un LMS en el e-learning?',
      paragraphs: [
        'Un LMS sirve principalmente para centralizar todos los elementos de un proyecto educativo. En lugar de mandar videos por YouTube ocultos, PDFs por correo y audios por WhatsApp, el LMS reúne todo en un solo portal ordenado.',
        'Permite a los administradores automatizar inscripciones, supervisar qué lecciones ha visto cada estudiante, y evaluar el avance mediante exámenes y quizzes obligatorios.',
      ],
    },
    {
      title: 'Funciones básicas de un LMS profesional',
      paragraphs: [
        '1. Gestión de Contenidos: Creación de temarios divididos en módulos y lecciones.',
        '2. Control de Usuarios: Altas y bajas de alumnos, perfiles de instructor y estudiante.',
        '3. Evaluaciones: Creación de exámenes rápidos con calificaciones automáticas.',
        '4. Certificaciones: Expedición automática de diplomas digitales verificables.',
        '5. Pasarela de Pago integrada: Cobros por tarjeta integrados al flujo de alta.',
      ],
    },
    {
      title: 'Beneficios para creadores de cursos y academias',
      paragraphs: [
        'Para los creadores, un LMS profesional significa profesionalismo y automatización. No tienes que dar accesos manuales a las 3:00 AM; el sistema procesa el cobro, registra al estudiante y le da acceso a su panel al instante.',
        'Para las academias, un LMS representa orden y control. Permite monitorear la tasa de finalización de cursos, obtener métricas financieras de ventas y garantizar que las certificaciones emitidas tengan validez en línea.',
      ],
    },
    {
      title: 'Diferencias entre un LMS y el uso de herramientas sueltas',
      paragraphs: [
        'Las herramientas de videollamada como Zoom o de almacenamiento como Google Drive son excelentes herramientas de productividad, pero carecen de estructura académica. Un LMS brinda un entorno cerrado donde el contenido no se puede descargar ni redistribuir fácilmente, protegiendo tu propiedad intelectual y brindando un flujo lógico de estudio.',
      ],
    },
    {
      title: 'Cómo Plattform te ayuda a implementar tu LMS',
      paragraphs: [
        'Plattform es un LMS SaaS moderno diseñado especialmente para proyectos educativos en crecimiento. Con nuestro plan Starter de $199 MXN mensuales obtienes acceso inmediato a una plataforma LMS en modo oscuro, con constructor de cursos intuitivo, quizzes con calificación automatizada, y certificados con verificación única vía código QR.',
      ],
    },
  ];

  const faqs = [
    {
      q: '¿Qué significan las siglas LMS?',
      a: 'LMS significa Learning Management System (Sistema de Gestión del Aprendizaje). Es un software diseñado para administrar, documentar, dar seguimiento, e impartir educación en línea.',
    },
    {
      q: '¿Cuál es la diferencia entre Plattform y otros LMS corporativos?',
      a: 'Plattform está enfocada en la agilidad y experiencia de usuario. A diferencia de los LMS tradicionales (pesados y complejos de configurar), Plattform provee un constructor visual y pasarela de cobro simplificada.',
    },
  ];

  return (
    <SeoArticleTemplate
      activeSlug={activeSlug}
      h1="Qué es un LMS y para qué sirve"
      publishDate="8 de junio, 2026"
      intro="Descubre qué es un LMS, cómo funciona y de qué manera esta infraestructura tecnológica permite a escuelas, academias y expertos centralizar y vender sus cursos online."
      sections={sections}
      ctaText="Conoce el LMS para academias de Plattform"
      ctaHref="/lms-para-academias"
      faqs={faqs}
      jsonLd={jsonLd}
    />
  );
}
