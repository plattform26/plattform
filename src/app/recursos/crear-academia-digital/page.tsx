import { Metadata } from 'next';
import SeoArticleTemplate from '@/components/seo/SeoArticleTemplate';

export const metadata: Metadata = {
  title: 'Cómo Crear una Academia Digital desde Cero',
  description: 'Descubre los pasos para crear una academia digital: definir cursos, organizar contenidos, administrar alumnos y elegir una plataforma educativa profesional.',
  alternates: {
    canonical: 'https://plattform.mx/recursos/crear-academia-digital',
  },
};

export default function CrearAcademiaDigitalPage() {
  const activeSlug = '/recursos/crear-academia-digital';

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
        'headline': 'Cómo crear una academia digital desde cero',
        'description': 'Descubre los pasos para crear una academia digital: definir cursos, organizar contenidos, administrar alumnos y elegir una plataforma educativa profesional.',
        'inLanguage': 'es',
        'datePublished': '2026-06-05T12:00:00+00:00',
        'dateModified': '2026-06-05T12:00:00+00:00',
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
            'name': 'Cómo Crear una Academia Digital',
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
            'name': '¿Qué se necesita para lanzar una academia digital?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Necesitas estructurar tus cursos, definir a tu estudiante ideal, elegir una plataforma LMS para alojar el contenido, y conectar una pasarela de pagos para automatizar inscripciones.',
            },
          },
          {
            '@type': 'Question',
            'name': '¿Puedo crear mi academia con marca propia?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Sí, plataformas modernas como Plattform te permiten personalizar tu portal con tu logo, banners, y un slug exclusivo para destacar tu marca ante tus estudiantes.',
            },
          },
        ],
      },
    ],
  };

  const sections = [
    {
      title: '1. Define tu propuesta de valor y temática principal',
      paragraphs: [
        'Lanzar una academia digital requiere claridad sobre lo que te hace diferente. Analiza tu especialidad y el mercado. Busca nichos donde exista una necesidad clara de aprendizaje práctico y profesional.',
        'Tu propuesta educativa debe responder a preguntas clave: ¿Qué problema resolverá mi academia? ¿Cuál es el perfil del estudiante al que beneficiará mi contenido?',
      ],
    },
    {
      title: '2. Diseña y estructura tus primeros cursos',
      paragraphs: [
        'No intentes lanzar 10 cursos al mismo tiempo. Empieza con uno o dos que aborden los pilares fundamentales de tu temática. Estructura el curso de manera progresiva.',
        'Cada curso debe dividirse en módulos que aborden fases del aprendizaje, y cada módulo en lecciones enfocadas en objetivos concretos y medibles.',
      ],
    },
    {
      title: '3. Prepara y ordena el material educativo',
      paragraphs: [
        'Graba tus explicaciones con buena calidad de audio y video. Adicionalmente, redacta explicaciones y lecturas de soporte directamente en la plataforma para asegurar la máxima velocidad de carga, e integra quizzes rápidos para evaluar la comprensión del alumno.',
        'Los contenidos de apoyo e interactivos deben organizarse visualmente en una plataforma que sea intuitiva y provea un entorno agradable y profesional de aprendizaje.',
      ],
    },
    {
      title: '4. Elige una plataforma LMS profesional para tu academia',
      paragraphs: [
        'Para dar soporte a tu escuela necesitas una plataforma de e-learning profesional. Evita herramientas lentas de CMS generalistas que requieran múltiples plugins difíciles de mantener.',
        'Un LMS SaaS te permite concentrarte en el contenido y la educación, encargándose automáticamente del hosting, las inscripciones de alumnos y la seguridad de los datos.',
      ],
    },
    {
      title: '5. Publica, promociona y mejora de forma constante',
      paragraphs: [
        'Configura tu pasarela de cobro integrada mediante Stripe Connect para pesos mexicanos y lanza tu academia al mercado. Diseña promociones con cupones de descuento y recolecta retroalimentación de tus primeros estudiantes.',
        'La opinión de tus alumnos iniciales es indispensable para pulir el contenido de tus cursos y planear el desarrollo de nuevos temarios.',
      ],
    },
    {
      title: 'Errores a evitar al crear tu academia',
      paragraphs: [
        'Depender de accesos manuales, mezclar múltiples sistemas de cobro separados y forzar a tus alumnos a navegar por carpetas confusas son factores que arruinan la experiencia estudiantil. Automatiza todo en un solo portal profesional.',
      ],
    },
    {
      title: 'Cómo Plattform te ayuda a lanzar tu academia',
      paragraphs: [
        'Plattform provee la infraestructura completa para crear y administrar tu academia digital. Con el plan Starter de $199 MXN al mes, dispones de un portal personalizable con tu logotipo, constructor visual de lecciones, quizzes integrados, generación automática de certificados y pasarela de cobros directa a tu cuenta bancaria.',
      ],
    },
  ];

  const faqs = [
    {
      q: '¿Qué se necesita para lanzar una academia digital?',
      a: 'Necesitas estructurar tus cursos, definir a tu estudiante ideal, elegir una plataforma LMS para alojar el contenido, y conectar una pasarela de pagos para automatizar inscripciones.',
    },
    {
      q: '¿Puedo crear mi academia con marca propia?',
      a: 'Sí, plataformas modernas como Plattform te permiten personalizar tu portal con tu logo, banners, y un slug exclusivo para destacar tu marca ante tus estudiantes.',
    },
  ];

  return (
    <SeoArticleTemplate
      activeSlug={activeSlug}
      h1="Cómo crear una academia digital desde cero"
      publishDate="5 de junio, 2026"
      intro="Lanzar tu propio negocio educativo en Internet es un proceso ordenado. En esta guía te mostramos los pasos clave para estructurar y publicar tu academia de forma profesional."
      sections={sections}
      ctaText="Crea tu academia digital con Plattform"
      ctaHref="/academia-digital"
      faqs={faqs}
      jsonLd={jsonLd}
    />
  );
}
