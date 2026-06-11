import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Plataforma de Cursos Online en México | Crear Academias | Plattform',
  description: 'Crea, hospeda y vende tus cursos online con tu propia marca. El LMS profesional en México con Stripe Connect e Inteligencia Artificial integrada. Regístrate hoy.',
  alternates: {
    canonical: 'https://plattform.mx/plataforma-de-cursos-online',
  },
};

export default function PlataformaCursosOnlinePage() {
  // Datos estructurados en JSON-LD para inyectar en el head (Rich Snippets en Google)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        '@id': 'https://plattform.mx/plataforma-de-cursos-online#product',
        'name': 'Plattform - Plataforma para Crear y Vender Cursos Online',
        'image': 'https://plattform.mx/og-image.png',
        'description': 'Plataforma LMS y SaaS educativa en México para hospedar cursos, certificar alumnos con código QR y procesar cobros de forma directa a tu banco vía Stripe Connect.',
        'brand': {
          '@type': 'Brand',
          'name': 'Plattform'
        },
        'offers': {
          '@type': 'Offer',
          'price': '199.00',
          'priceCurrency': 'MXN',
          'availability': 'https://schema.org/InStock',
          'url': 'https://plattform.mx/register'
        }
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://plattform.mx/plataforma-de-cursos-online#faq',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': '¿Qué comisiones cobra Plattform por cada curso vendido?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Plattform ofrece comisiones bajas y transparentes dependiendo de tu nivel de plan. En el plan Starter es del 15%, en el plan Growth del 10% y baja hasta el 7% en el plan Scale. No retenemos tu dinero en cuentas intermedias.'
            }
          },
          {
            '@type': 'Question',
            'name': '¿Cómo recibo las ganancias de mis estudiantes?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'El dinero de tus ventas se deposita directamente en tu cuenta bancaria a través de la integración nativa de Stripe Connect. Plattform no retiene tus fondos, el dinero va directamente de tu alumno a tu banco de forma segura y automatizada.'
            }
          },
          {
            '@type': 'Question',
            'name': '¿Puedo subir contenido multimedia como videos, Loom e iframes a mis lecciones?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Sí, Plattform cuenta con un editor enriquecido que te permite incrustar recursos multimedia de forma responsiva mediante URLs de YouTube, Vimeo, Loom, Google Drive, o código iframe genérico, además de cargar imágenes y texto enriquecido.'
            }
          },
          {
            '@type': 'Question',
            'name': '¿La plataforma genera certificados de finalización para los alumnos?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Sí, cuando un alumno aprueba el examen final del curso, el sistema genera automáticamente un certificado digital en PDF con un código único de verificación y código QR para su validación en línea de por vida.'
            }
          }
        ]
      }
    ]
  };

  const faqs = [
    {
      q: '¿Qué comisiones cobra Plattform por cada curso vendido?',
      a: 'Plattform ofrece comisiones bajas y transparentes dependiendo de tu nivel de plan. En el plan Starter es del 15%, en el plan Growth del 10% y baja hasta el 7% en el plan Scale. No retenemos tu dinero en cuentas intermedias.'
    },
    {
      q: '¿Cómo recibo las ganancias de mis estudiantes?',
      a: 'El dinero de tus ventas se deposita directamente en tu cuenta bancaria a través de la integración nativa de Stripe Connect. Plattform no retiene tus fondos, el dinero va directamente de tu alumno a tu banco de forma segura y automatizada.'
    },
    {
      q: '¿Puedo subir contenido multimedia como videos, Loom e iframes a mis lecciones?',
      a: 'Sí, Plattform cuenta con un editor enriquecido que te permite incrustar recursos de forma responsiva mediante URLs de YouTube, Vimeo, Loom, Google Drive, o código iframe genérico, además de cargar imágenes y texto enriquecido.'
    },
    {
      q: '¿La plataforma genera certificados de finalización para los alumnos?',
      a: 'Sí, cuando un alumno aprueba el examen final del curso, el sistema genera automáticamente un certificado digital en PDF con un código único de verificación y código QR para su validación en línea de por vida.'
    },
    {
      q: '¿Hay algún límite en la cantidad de cursos o alumnos que puedo tener?',
      a: 'El plan Starter te permite hospedar hasta 2 cursos y tener hasta 20 alumnos inscritos en total. Si tu academia crece, puedes migrar de forma automática a los planes Growth (hasta 100 alumnos) o Scale (alumnos e inscripciones ilimitadas).'
    }
  ];

  return (
    <div className="bg-[#070d1a] min-h-screen text-white font-poppins selection:bg-cyan-500 selection:text-black">
      {/* Inyección de Schema JSON-LD para SEO técnico */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HEADER SIMPLE */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-blue-500/10">
        <Link href="/" className="font-space-grotesk font-black text-2xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
          PLATTFORM
        </Link>
        <Link 
          href="/login" 
          className="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-widest transition-colors"
        >
          Iniciar Sesión
        </Link>
      </header>

      {/* HERO SECTION */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <h1 className="text-4xl md:text-6xl font-space-grotesk font-black text-white leading-tight uppercase tracking-tight">
          La plataforma de cursos online <br className="hidden md:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            diseñada para expertos en México
          </span>
        </h1>
        
        <p className="text-gray-400 text-base md:text-lg max-w-3xl mx-auto mt-6 leading-relaxed font-light">
          Hospeda tus lecciones, administra tus alumnos y procesa tus ventas de forma directa a tu banco. Plattform es el LMS profesional y elegante potenciado por Inteligencia Artificial que estabas buscando.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            id="cta-seo-cursos-online-hero"
            href="/register?utm_source=seo&utm_medium=landing&utm_campaign=plataforma-cursos-online"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-2xl shadow-xl shadow-cyan-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm uppercase tracking-widest"
          >
            Comenzar Ahora
          </Link>
          <a
            href="#features"
            className="px-8 py-4 border border-blue-500/20 hover:border-blue-500/40 text-gray-300 hover:text-white font-bold rounded-2xl transition-all text-sm uppercase tracking-widest bg-white/5"
          >
            Ver características
          </a>
        </div>

        <div className="mt-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
          ✓ Hosting de contenido incluido · ✓ Plan Starter para iniciar
        </div>
      </section>

      {/* SECCIÓN SEMÁNTICA: DOLORES Y ESTRATEGIA (CONVERSION VALUE) */}
      <section className="bg-[#0d1524] border-y border-blue-500/10 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-space-grotesk font-black text-center text-white mb-12 uppercase tracking-tight">
            ¿Por qué Plattform es diferente a las plataformas tradicionales?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm md:text-base">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-cyan-400">Cobro directo a tu banco (Stripe Connect)</h3>
              <p className="text-gray-400 leading-relaxed font-light">
                A diferencia de otras plataformas que retienen tus ingresos por 14 o hasta 30 días, Plattform se integra de forma directa con tu cuenta de Stripe Connect. Cuando un estudiante compra un curso en México, las ganancias neto se depositan de inmediato en tu cuenta bancaria de manera automática.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-cyan-400">Comisiones bajas sin letras chiquitas</h3>
              <p className="text-gray-400 leading-relaxed font-light">
                Otras opciones del mercado te cobran tarifas mensuales costosas y además toman un porcentaje alto de tus ventas. En Plattform te ofrecemos el plan Starter ideal para arrancar tu academia, y comisiones que disminuyen conforme crece tu academia digital, bajando hasta un 7% en nuestro plan más alto.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-cyan-400">Editor enriquecido multimedia</h3>
              <p className="text-gray-400 leading-relaxed font-light">
                Hospeda tu contenido de la manera que prefieras. Nuestro editor de lecciones te permite incrustar recursos de forma responsiva y elegante desde YouTube, Vimeo, Loom o Google Drive, además de permitir la integración de iframes genéricos y archivos de imagen.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-cyan-400">Creación potenciada por Inteligencia Artificial</h3>
              <p className="text-gray-400 leading-relaxed font-light">
                ¿Sufres de bloqueo creativo al estructurar tus cursos? Plattform integra un asistente de Inteligencia Artificial que te ayuda a redactar el temario, los objetivos y la estructura de tus módulos en cuestión de segundos, acelerando tu proceso de lanzamiento al mercado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN SEMÁNTICA: CARACTERÍSTICAS (BENEFICIOS INDEXABLES) */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-2xl md:text-4xl font-space-grotesk font-black text-center text-white mb-16 uppercase tracking-tight">
          La infraestructura completa para tu conocimiento online
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-[#0d1524] border border-blue-500/10 rounded-3xl hover:border-cyan-500/30 transition-all group">
            <span className="text-3xl block mb-6 group-hover:scale-110 transition-transform">🎓</span>
            <h3 className="text-lg font-bold text-white mb-3">Estudiante en modo Premium</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-light">
              Ofrece a tus estudiantes una experiencia educativa fluida, inmersiva y de alta retención. Nuestra interfaz de aprendizaje en modo oscuro y cian evita la fatiga visual y fomenta la finalización del curso.
            </p>
          </div>

          <div className="p-8 bg-[#0d1524] border border-blue-500/10 rounded-3xl hover:border-cyan-500/30 transition-all group">
            <span className="text-3xl block mb-6 group-hover:scale-110 transition-transform">📜</span>
            <h3 className="text-lg font-bold text-white mb-3">Certificaciones con validación QR</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-light">
              Genera credibilidad instantánea. El sistema evalúa el examen final y expide de forma automática un certificado digital oficial con un código único y código QR que cualquiera puede verificar en línea.
            </p>
          </div>

          <div className="p-8 bg-[#0d1524] border border-blue-500/10 rounded-3xl hover:border-cyan-500/30 transition-all group">
            <span className="text-3xl block mb-6 group-hover:scale-110 transition-transform">📝</span>
            <h3 className="text-lg font-bold text-white mb-3">Evaluaciones y Quizzes Dinámicos</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-light">
              Mide el progreso académico real. Diseña quizzes con preguntas de opción múltiple, asigna puntajes y establece una calificación mínima aprobatoria para desbloquear el temario o emitir el diploma.
            </p>
          </div>
        </div>
      </section>

      {/* SECCIÓN SEMÁNTICA: PREGUNTAS FRECUENTES (SEO MARGIN Y SNIPPETS) */}
      <section className="bg-[#0d1524] border-t border-blue-500/10 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-space-grotesk font-black text-center text-white mb-12 uppercase tracking-tight">
            Preguntas Frecuentes sobre la Plataforma
          </h2>

          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="p-6 bg-[#070d1a] border border-blue-500/10 rounded-2xl hover:border-blue-500/20 transition-all"
              >
                <h3 className="font-bold text-white text-base md:text-lg mb-2">{faq.q}</h3>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed font-light">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER CALL TO ACTION */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-cyan-500/5 blur-3xl rounded-3xl pointer-events-none" />
        
        <h2 className="text-3xl md:text-5xl font-space-grotesk font-black text-white mb-6 uppercase tracking-tight">
          Comienza a construir tu academia digital hoy mismo
        </h2>
        
        <p className="text-gray-400 text-base max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          Hospeda tus cursos de forma profesional, automatiza tus ventas en México y brinda a tus estudiantes una experiencia premium única. Empieza hoy con nuestro plan Starter.
        </p>

        <Link
          id="cta-seo-cursos-online-footer"
          href="/register?utm_source=seo&utm_medium=landing&utm_campaign=plataforma-cursos-online"
          className="px-10 py-5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black rounded-2xl shadow-xl shadow-cyan-500/10 hover:scale-105 active:scale-[0.98] transition-all text-sm uppercase tracking-[0.2em]"
        >
          Crear mi cuenta ahora
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-blue-500/10 bg-[#070d1a] py-8 text-center text-xs text-gray-600">
        <p>&copy; 2026 Plattform. La infraestructura moderna para la educación digital.</p>
      </footer>
    </div>
  );
}
