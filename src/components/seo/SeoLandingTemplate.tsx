import React from 'react';
import Link from 'next/link';

export interface BenefitItem {
  title: string;
  description: string;
  icon?: string;
}

export interface FAQItem {
  q: string;
  a: string;
}

interface SeoLandingTemplateProps {
  activeSlug: string; // e.g., '/plataforma-de-cursos-online'
  eyebrow: string;
  h1: React.ReactNode;
  subheading: string;
  ctaText: string;
  ctaHref?: string;
  ctaSecondaryText?: string;
  ctaSecondaryHref?: string;
  bullets: string[];
  benefitsTitle: string;
  benefits: BenefitItem[];
  forWhomTitle: string;
  forWhom: BenefitItem[];
  diferenciadoresTitle: string;
  diferenciadores: BenefitItem[];
  faqs: FAQItem[];
  jsonLd: any;
}

export default function SeoLandingTemplate({
  activeSlug,
  eyebrow,
  h1,
  subheading,
  ctaText,
  ctaHref = '/register',
  ctaSecondaryText = 'Ver características',
  ctaSecondaryHref = '#features',
  bullets,
  benefitsTitle,
  benefits,
  forWhomTitle,
  forWhom,
  diferenciadoresTitle,
  diferenciadores,
  faqs,
  jsonLd,
}: SeoLandingTemplateProps) {

  // List of solution links
  const solutions = [
    { label: 'Plataforma de cursos online', href: '/plataforma-de-cursos-online' },
    { label: 'Vender cursos online', href: '/vender-cursos-online' },
    { label: 'LMS para academias', href: '/lms-para-academias' },
    { label: 'Plataforma para creadores', href: '/plataforma-para-creadores' },
    { label: 'Academia digital', href: '/academia-digital' },
  ];

  // List of resource links
  const resources = [
    { label: 'Cómo vender cursos online', href: '/recursos/como-vender-cursos-online' },
    { label: 'Qué es un LMS', href: '/recursos/que-es-un-lms' },
    { label: 'Cómo crear una academia digital', href: '/recursos/crear-academia-digital' },
    { label: 'Errores al vender cursos online', href: '/recursos/errores-al-vender-cursos-online' },
    { label: 'Plataforma de cursos online vs WhatsApp, Drive o Zoom', href: '/recursos/plataforma-cursos-online-vs-whatsapp-drive-zoom' },
  ];

  return (
    <div className="bg-[#070d1a] min-h-screen text-white font-poppins selection:bg-cyan-500/30 selection:text-white">
      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* HEADER */}
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
        
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          {eyebrow}
        </div>

        <h1 className="text-4xl md:text-6xl font-space-grotesk font-black text-white leading-tight uppercase tracking-tight">
          {h1}
        </h1>
        
        <p className="text-gray-400 text-base md:text-lg max-w-3xl mx-auto mt-6 leading-relaxed font-light">
          {subheading}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            id={`cta-seo-${activeSlug.replace(/\//g, '')}-hero`}
            href={`${ctaHref}?utm_source=seo&utm_medium=landing&utm_campaign=${activeSlug.replace(/\//g, '')}`}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-2xl shadow-xl shadow-cyan-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm uppercase tracking-widest"
          >
            {ctaText}
          </Link>
          {ctaSecondaryHref.startsWith('#') ? (
            <a
              href={ctaSecondaryHref}
              className="px-8 py-4 border border-blue-500/20 hover:border-blue-500/40 text-gray-300 hover:text-white font-bold rounded-2xl transition-all text-sm uppercase tracking-widest bg-white/5"
            >
              {ctaSecondaryText}
            </a>
          ) : (
            <Link
              href={ctaSecondaryHref}
              className="px-8 py-4 border border-blue-500/20 hover:border-blue-500/40 text-gray-300 hover:text-white font-bold rounded-2xl transition-all text-sm uppercase tracking-widest bg-white/5"
            >
              {ctaSecondaryText}
            </Link>
          )}
        </div>

        {bullets && bullets.length > 0 && (
          <div className="mt-8 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            {bullets.map((bullet, idx) => (
              <span key={idx} className="flex items-center gap-1">
                ✓ {bullet}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: BENEFITS (WHAT YOU CAN DO) */}
      <section id="features" className="bg-[#0d1524] border-y border-blue-500/10 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-space-grotesk font-black text-center text-white mb-12 uppercase tracking-tight">
            {benefitsTitle}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm md:text-base">
            {benefits.map((item, idx) => (
              <div key={idx} className="space-y-3 p-6 bg-[#070d1a]/50 border border-blue-500/5 rounded-2xl">
                <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                  {item.icon && <span className="text-xl">{item.icon}</span>}
                  {item.title}
                </h3>
                <p className="text-gray-400 leading-relaxed font-light">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: FOR WHOM */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-2xl md:text-4xl font-space-grotesk font-black text-center text-white mb-12 uppercase tracking-tight">
          {forWhomTitle}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {forWhom.map((item, idx) => (
            <div key={idx} className="p-8 bg-[#0d1524]/60 border border-blue-500/10 rounded-3xl hover:border-cyan-500/30 transition-all text-center">
              {item.icon && <span className="text-4xl block mb-6">{item.icon}</span>}
              <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed font-light">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: DIFFERENTIATORS */}
      <section className="bg-[#0d1524] border-t border-blue-500/10 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-space-grotesk font-black text-center text-white mb-12 uppercase tracking-tight">
            {diferenciadoresTitle}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {diferenciadores.map((item, idx) => (
              <div key={idx} className="p-6 bg-[#070d1a]/80 border border-blue-500/10 rounded-2xl">
                {item.icon && <span className="text-2xl block mb-4">{item.icon}</span>}
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed font-light">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: FAQS (VISIBLE IN HTML) */}
      <section className="bg-[#070d1a] border-t border-blue-500/10 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-space-grotesk font-black text-center text-white mb-12 uppercase tracking-tight">
            Preguntas Frecuentes
          </h2>

          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="p-6 bg-[#0d1524] border border-blue-500/10 rounded-2xl hover:border-blue-500/20 transition-all"
              >
                <h3 className="font-bold text-white text-base md:text-lg mb-2">{faq.q}</h3>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed font-light">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: CTA FINAL */}
      <section className="bg-gradient-to-b from-[#070d1a] to-[#0d1524] border-t border-blue-500/10 py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-cyan-500/5 blur-3xl rounded-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-space-grotesk font-black text-white mb-6 uppercase tracking-tight">
            Comienza a construir tu academia digital hoy mismo
          </h2>
          
          <p className="text-gray-400 text-base max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Hospeda tus cursos de forma profesional, automatiza tus ventas en México y brinda a tus estudiantes una experiencia premium única. Empieza hoy con nuestro plan Starter de $199 MXN al mes.
          </p>

          <Link
            id={`cta-seo-${activeSlug.replace(/\//g, '')}-footer`}
            href={`${ctaHref}?utm_source=seo&utm_medium=landing&utm_campaign=${activeSlug.replace(/\//g, '')}`}
            className="px-10 py-5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black rounded-2xl shadow-xl shadow-cyan-500/10 hover:scale-105 active:scale-[0.98] transition-all text-sm uppercase tracking-[0.2em]"
          >
            {ctaText}
          </Link>
        </div>
      </section>

      {/* SILO INTERLINKING SECTION */}
      <section className="bg-[#070d1a] border-t border-white/5 py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
          <div>
            <h4 className="font-space-grotesk font-bold uppercase tracking-widest text-cyan-400 mb-4 text-xs">
              Soluciones Plattform
            </h4>
            <ul className="space-y-2">
              {solutions
                .filter(item => item.href !== activeSlug)
                .map((item, idx) => (
                  <li key={idx}>
                    <Link href={item.href} className="text-gray-400 hover:text-white transition-colors">
                      {item.label} →
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
          <div>
            <h4 className="font-space-grotesk font-bold uppercase tracking-widest text-cyan-400 mb-4 text-xs">
              Recursos para crear cursos online
            </h4>
            <ul className="space-y-2">
              {resources
                .filter(item => item.href !== activeSlug)
                .map((item, idx) => (
                  <li key={idx}>
                    <Link href={item.href} className="text-gray-400 hover:text-white transition-colors">
                      {item.label} →
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-blue-500/10 bg-[#070d1a] py-8 text-center text-xs text-gray-600">
        <p>&copy; 2026 Plattform. La infraestructura moderna para la educación digital.</p>
      </footer>
    </div>
  );
}
