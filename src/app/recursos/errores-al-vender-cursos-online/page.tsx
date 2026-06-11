import { Metadata } from 'next';
import SeoArticleTemplate from '@/components/seo/SeoArticleTemplate';

export const metadata: Metadata = {
  title: 'Errores Comunes al Vender Cursos Online y Cómo Evitarlos',
  description: 'Evita errores al vender cursos online: falta de estructura, mala experiencia del alumno, cobros manuales, contenido desordenado y poca claridad comercial.',
  alternates: {
    canonical: 'https://plattform.mx/recursos/errores-al-vender-cursos-online',
  },
};

export default function ErroresAlVenderCursosPage() {
  const activeSlug = '/recursos/errores-al-vender-cursos-online';

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
        'headline': 'Errores comunes al vender cursos online',
        'description': 'Evita errores al vender cursos online: falta de estructura, mala experiencia del alumno, cobros manuales, contenido desordenado y poca claridad comercial.',
        'inLanguage': 'es',
        'datePublished': '2026-06-03T12:00:00+00:00',
        'dateModified': '2026-06-03T12:00:00+00:00',
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
            'name': 'Errores al Vender Cursos',
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
            'name': '¿Cuál es el error más común al iniciar en e-learning?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'El error más habitual es la gestión manual (solicitar depósitos, revisar recibos por chat y mandar accesos manualmente por correo), lo cual limita por completo la escalabilidad.',
            },
          },
          {
            '@type': 'Question',
            'name': '¿Cómo afecta la mala estructuración de un curso?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Confunde al estudiante, lo que se traduce en quejas, bajas tasas de finalización de lecciones y solicitudes constantes de devolución del dinero.',
            },
          },
        ],
      },
    ],
  };

  const sections = [
    {
      title: '1. Vender sin una estructura pedagógica clara',
      paragraphs: [
        'Vender conocimientos no consiste en amontonar videos sin orden. El alumno compra un curso para seguir un camino de transformación. Si tu temario es confuso o las lecciones son demasiado largas (más de 30 minutos), provocarás fatiga mental.',
        'La solución es planear un temario ordenado por módulos y lecciones cortas de 5 a 15 minutos enfocadas en habilidades prácticas concretas.',
      ],
    },
    {
      title: '2. Depender de herramientas improvisadas (WhatsApp y Drive)',
      paragraphs: [
        'Organizar tu negocio educativo enviando enlaces de Google Drive o comunicándote por grupos de WhatsApp proyecta una imagen informal y facilita el pirateo o redistribución de tus contenidos.',
        'Tus estudiantes merecen acceder a un portal cerrado y seguro con su propio nombre de usuario y contraseña, donde el contenido esté ordenado de forma lógica.',
      ],
    },
    {
      title: '3. No definir con exactitud al estudiante ideal',
      paragraphs: [
        'Intentar vender un curso a "todo el mundo" es la forma más rápida de no venderle a nadie. Si los mensajes de tu página de ventas son demasiado genéricos, tu público potencial no se sentirá identificado.',
        'Define el perfil de tu comprador (buyer persona) y alinea todo el copy de tus landings y materiales para hablar directamente de sus dolores y aspiraciones.',
      ],
    },
    {
      title: '4. Descuidar la experiencia del alumno',
      paragraphs: [
        'Una interfaz educativa saturada de botones o que no funcione de manera óptima en teléfonos móviles destruye la tasa de retención. Los alumnos prefieren interfaces simples en modo oscuro que eviten el cansancio visual y permitan una navegación fluida.',
      ],
    },
    {
      title: '5. No medir avances ni evaluar resultados',
      paragraphs: [
        'Vender un curso sin ofrecer herramientas para que el alumno evalúe su comprensión limita la efectividad del aprendizaje. Implementar cuestionarios, exámenes de opción múltiple y expedir un certificado digital al terminar le da seriedad y valor al infoproducto.',
      ],
    },
    {
      title: '6. No contar con una página de cobros y venta profesional',
      paragraphs: [
        'La fricción en el momento del pago causa la pérdida de la mayoría de los clientes. Si tus compradores deben mandarte correos con capturas de pantalla de transferencias para recibir accesos manuales, muchos abandonarán el proceso.',
        'Conectar una pasarela segura como Stripe Connect automatiza todo: el alumno compra, la plataforma cobra en pesos mexicanos y le entrega los accesos al instante.',
      ],
    },
    {
      title: 'Cómo Plattform te ayuda a resolver estos errores',
      paragraphs: [
        'Plattform provee la solución integral para evitar todas las fricciones de la educación en línea. Con el plan Starter de $199 MXN mensuales, obtienes un portal administrativo elegante, constructor estructurado de cursos, pasarela Stripe integrada, exámenes automatizados y expedición de diplomas en PDF con código QR verificable.',
      ],
    },
  ];

  const faqs = [
    {
      q: '¿Cuál es el error más común al iniciar en e-learning?',
      a: 'El error más habitual es la gestión manual (solicitar depósitos, revisar recibos por chat y mandar accesos manualmente por correo), lo cual limita por completo la escalabilidad.',
    },
    {
      q: '¿Cómo afecta la mala estructuración de un curso?',
      a: 'Confunde al estudiante, lo que se traduce en quejas, bajas tasas de finalización de lecciones y solicitudes constantes de devolución del dinero.',
    },
  ];

  return (
    <SeoArticleTemplate
      activeSlug={activeSlug}
      h1="Errores comunes al vender cursos online"
      publishDate="3 de junio, 2026"
      intro="Evita las equivocaciones más frecuentes cometidas por instructores y academias al monetizar su conocimiento y aprende cómo estructurar tu portal educativo para el éxito."
      sections={sections}
      ctaText="Organiza y vende tus cursos con Plattform"
      ctaHref="/vender-cursos-online"
      faqs={faqs}
      jsonLd={jsonLd}
    />
  );
}
