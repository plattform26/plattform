import React from 'react';
import Link from 'next/link';

export interface ArticleSection {
  title: string;
  paragraphs: string[];
  isSub?: boolean; // If true, render as H3; otherwise as H2
}

export interface FAQItem {
  q: string;
  a: string;
}

interface SeoArticleTemplateProps {
  activeSlug: string; // e.g. '/recursos/como-vender-cursos-online'
  h1: string;
  publishDate: string;
  author?: string;
  intro: string;
  sections: ArticleSection[];
  ctaText: string;
  ctaHref: string;
  faqs?: FAQItem[];
  jsonLd: any;
}

export default function SeoArticleTemplate({
  activeSlug,
  h1,
  publishDate,
  author = 'Plattform',
  intro,
  sections,
  ctaText,
  ctaHref,
  faqs = [],
  jsonLd,
}: SeoArticleTemplateProps) {

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
        <div className="flex items-center gap-4">
          <Link href="/recursos" className="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-widest transition-colors">
            Recursos
          </Link>
          <Link 
            href="/login" 
            className="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-widest transition-colors"
          >
            Iniciar Sesión
          </Link>
        </div>
      </header>

      {/* ARTICLE BODY CONTAINER */}
      <main className="max-w-4xl mx-auto px-6 pt-16 pb-24">
        {/* Breadcrumbs */}
        <nav className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/recursos" className="hover:text-white transition-colors">Recursos</Link>
          <span>/</span>
          <span className="text-gray-400 truncate max-w-[200px] sm:max-w-none">{h1}</span>
        </nav>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-space-grotesk font-black text-white leading-tight uppercase tracking-tight mb-6">
          {h1}
        </h1>

        {/* Meta Info */}
        <div className="flex items-center gap-6 text-xs text-gray-500 uppercase tracking-widest font-bold border-y border-blue-500/10 py-4 mb-10">
          <div>
            <span className="text-gray-600 mr-2">Publicado por</span>
            <span className="text-cyan-400">{author}</span>
          </div>
          <div>
            <span className="text-gray-600 mr-2">Fecha</span>
            <span>{publishDate}</span>
          </div>
        </div>

        {/* Lead/Intro Paragraph */}
        <p className="text-gray-300 text-lg md:text-xl font-light leading-relaxed mb-12 border-l-4 border-cyan-500 pl-6 py-1">
          {intro}
        </p>

        {/* Article content sections */}
        <article className="prose prose-invert max-w-none mb-16 space-y-10">
          {sections.map((section, idx) => {
            const TitleTag = section.isSub ? 'h3' : 'h2';
            const titleClasses = section.isSub
              ? 'text-lg font-bold text-cyan-400 tracking-wide mt-8'
              : 'text-2xl md:text-3xl font-space-grotesk font-black text-white uppercase tracking-tight mt-12 mb-4 border-b border-blue-500/5 pb-2';
            return (
              <div key={idx} className="space-y-4">
                <TitleTag className={titleClasses}>{section.title}</TitleTag>
                {section.paragraphs.map((p, pIdx) => (
                  <p key={pIdx} className="text-gray-400 leading-relaxed font-light text-base">
                    {p}
                  </p>
                ))}
              </div>
            );
          })}
        </article>

        {/* FAQs SECTION (IF INCLUDED) */}
        {faqs && faqs.length > 0 && (
          <section className="border-t border-blue-500/10 py-16">
            <h2 className="text-2xl md:text-3xl font-space-grotesk font-black text-white mb-8 uppercase tracking-tight">
              Preguntas Frecuentes Relacionadas
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, idx) => (
                <div 
                  key={idx} 
                  className="p-6 bg-[#0d1524] border border-blue-500/10 rounded-2xl"
                >
                  <h3 className="font-bold text-white text-base md:text-lg mb-2">{faq.q}</h3>
                  <p className="text-gray-400 text-sm md:text-base leading-relaxed font-light">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA FINAL DE CONVERSIÓN */}
        <section className="bg-gradient-to-r from-blue-900/40 to-cyan-900/30 border border-blue-500/20 p-8 md:p-12 rounded-3xl text-center relative overflow-hidden mt-16 mb-20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none" />
          <h2 className="text-2xl md:text-3xl font-space-grotesk font-black text-white mb-4 uppercase tracking-tight">
            ¿Quieres lanzar tu propia academia digital?
          </h2>
          <p className="text-gray-300 text-sm md:text-base max-w-xl mx-auto mb-8 font-light leading-relaxed">
            Plattform te ofrece la infraestructura para alojar tus cursos, automatizar accesos y recibir pagos directos vía Stripe Connect en México.
          </p>
          <Link
            href={ctaHref}
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-2xl shadow-xl shadow-cyan-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all text-xs uppercase tracking-widest"
          >
            {ctaText} →
          </Link>
        </section>
      </main>

      {/* SILO INTERLINKING SECTION */}
      <section className="bg-[#0d1524] border-t border-blue-500/10 py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
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
