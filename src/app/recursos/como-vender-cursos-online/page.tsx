import { Metadata } from 'next';
import SeoArticleTemplate from '@/components/seo/SeoArticleTemplate';

export const metadata: Metadata = {
  title: 'Cómo Vender Cursos Online en México | Guía para Empezar',
  description: 'Aprende cómo vender cursos online en México, desde la estructura del curso hasta la elección de una plataforma para publicar, administrar alumnos y cobrar.',
  alternates: {
    canonical: 'https://plattform.mx/recursos/como-vender-cursos-online',
  },
};

export default function ComoVenderCursosOnlinePage() {
  const activeSlug = '/recursos/como-vender-cursos-online';

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
        'headline': 'Cómo vender cursos online en México',
        'description': 'Aprende cómo vender cursos online en México, desde la estructura del curso hasta la elección de una plataforma para publicar, administrar alumnos y cobrar.',
        'inLanguage': 'es',
        'datePublished': '2026-06-10T12:00:00+00:00',
        'dateModified': '2026-06-10T12:00:00+00:00',
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
            'name': 'Cómo Vender Cursos Online',
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
            'name': '¿Es rentable vender cursos online en México?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Sí. La demanda de formación digital y especialización en México ha crecido de manera constante, y los creadores de contenido y expertos pueden comercializar directamente sus conocimientos.',
            },
          },
          {
            '@type': 'Question',
            'name': '¿Qué necesito para empezar a cobrar mis cursos?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Necesitas conectar tu academia a una pasarela de pago como Stripe. Plattform permite integrar tu cuenta a través de Stripe Connect para transferencias directas a tu banco en pesos mexicanos (MXN).',
            },
          },
        ],
      },
    ],
  };

  const sections = [
    {
      title: '1. Define tu tema y público objetivo',
      paragraphs: [
        'El primer paso para vender cursos de forma exitosa es identificar con claridad qué vas a enseñar y a quién te diriges. Evita abarcar temas demasiado amplios; la clave reside en la especialización. Resuelve un problema específico para un nicho bien definido.',
        'Por ejemplo, en lugar de crear un curso de "Marketing Digital", diseña uno sobre "Marketing Digital para Consultorios Dentales en México". Al especializarte, la competencia disminuye y el valor percibido de tu conocimiento se incrementa.',
      ],
    },
    {
      title: '2. Estructura tu curso por módulos y lecciones',
      paragraphs: [
        'Un curso desordenado confunde al alumno y genera devoluciones. Estructura tu contenido de manera progresiva. Divide el aprendizaje en módulos que representen hitos, y divide cada módulo en lecciones cortas de 5 a 15 minutos.',
        'Cada lección debe enfocarse en un solo concepto o habilidad. Esto facilita el consumo rápido de la información y mejora los índices de finalización de tus estudiantes.',
      ],
    },
    {
      title: '3. Prepara contenidos y materiales complementarios',
      paragraphs: [
        'Graba videos claros y edítalos para eliminar tiempos muertos. Además de los videos, agrega explicaciones detalladas y lecturas de soporte directamente escritas en la plataforma para garantizar la máxima agilidad, y exámenes rápidos para evaluar el conocimiento.',
        'Para los contenidos multimedia como explicaciones o videos, no necesitas preocuparte por configuraciones complejas. Plattform te permite incrustar de forma sencilla recursos mediante códigos de inserción (iframes) o enlaces desde YouTube, Vimeo, Loom o Google Drive, adaptándose automáticamente a cualquier dispositivo.',
      ],
    },
    {
      title: '4. Elige una plataforma educativa profesional para publicar',
      paragraphs: [
        'Vender cursos por enlaces sueltos de Drive o grupos privados de Facebook resta credibilidad y dificulta la operación. Necesitas un LMS (Learning Management System) estructurado donde tu contenido esté protegido y tus alumnos tengan su propia cuenta.',
        'Una plataforma profesional automatiza el envío de accesos, hospeda el temario ordenado y brinda una experiencia de visualización premium en modo oscuro para evitar la fatiga visual.',
      ],
    },
    {
      title: '5. Define el precio y conecta tu pasarela de cobros',
      paragraphs: [
        'En México, la pasarela estándar para procesar cobros de forma segura es Stripe. Plattform ofrece integración directa mediante Stripe Connect. Cuando un alumno compra tu curso, los fondos neto se transfieren directamente a tu banco en pesos (MXN).',
        'Establece precios razonables y utiliza herramientas de conversión como cupones de descuento personalizados para incentivar tus ventas durante lanzamientos o promociones especiales.',
      ],
    },
    {
      title: 'Errores comunes al empezar a vender cursos',
      paragraphs: [
        'El error más recurrente es depender de procesos manuales (como recibir comprobantes por WhatsApp y mandar ligas por correo). Esto limita el crecimiento y consume tu tiempo. Automatizar el cobro y la inscripción con una infraestructura adecuada te permite escalar tu negocio sin límites operativos.',
      ],
    },
    {
      title: 'Cómo Plattform te ayuda en este camino',
      paragraphs: [
        'Plattform está diseñada específicamente para que los instructores en México configuren su propia academia digital. Con el plan Starter de $199 MXN mensuales obtienes un constructor de cursos intuitivo, panel de alumnos, exámenes integrados, certificados automatizados con código QR y comisiones bajas sobre tus ventas.',
      ],
    },
  ];

  const faqs = [
    {
      q: '¿Es rentable vender cursos online en México?',
      a: 'Sí. La demanda de formación digital y especialización en México ha crecido de manera constante, y los creadores de contenido y expertos pueden comercializar directamente sus conocimientos.',
    },
    {
      q: '¿Qué necesito para empezar a cobrar mis cursos?',
      a: 'Necesitas conectar tu academia a una pasarela de pago como Stripe. Plattform permite integrar tu cuenta a través de Stripe Connect para transferencias directas a tu banco en pesos mexicanos (MXN).',
    },
  ];

  return (
    <SeoArticleTemplate
      activeSlug={activeSlug}
      h1="Cómo vender cursos online en México"
      publishDate="10 de junio, 2026"
      intro="Transforma tu conocimiento en un negocio escalable. En esta guía paso a paso te explicamos cómo estructurar, publicar, cobrar y vender tus cursos de forma profesional en México."
      sections={sections}
      ctaText="Empieza a vender cursos con Plattform"
      ctaHref="/vender-cursos-online"
      faqs={faqs}
      jsonLd={jsonLd}
    />
  );
}
