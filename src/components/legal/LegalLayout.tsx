'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
  sections?: { id: string; title: string }[];
}

export default function LegalLayout({ title, lastUpdated, children, sections }: LegalLayoutProps) {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    if (!sections || sections.length === 0) return;
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  return (
    <div className="min-h-screen bg-[#070d1a] text-[#CBD5E1] font-sans">
      <header className="fixed top-0 left-0 right-0 h-20 border-b border-white/5 bg-[#070d1a]/80 backdrop-blur-xl z-50 flex items-center px-6 lg:px-12">
        <Link href="/" className="font-space-grotesk font-black text-2xl tracking-tighter italic text-white hover:text-cyan-400 transition-colors">
          PLATTFORM
        </Link>
      </header>

      <main className="pt-32 pb-24 px-6 lg:px-12 max-w-7xl mx-auto flex gap-12 relative">
        {sections && sections.length > 0 && (
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-32">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 mb-6">Contenido</h4>
              <nav className="flex flex-col gap-3 border-l border-white/5 pl-4">
                {sections.map(section => (
                  <a 
                    key={section.id} 
                    href={`#${section.id}`}
                    className={`text-xs transition-colors ${
                      activeSection === section.id 
                        ? 'text-cyan-400 font-bold border-l-2 border-cyan-400 -ml-[17px] pl-4' 
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}

        <article className="max-w-3xl flex-1">
          <div className="mb-12">
            <h1 className="font-space-grotesk text-4xl md:text-5xl font-black text-white mb-4 leading-tight">{title}</h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Última actualización: {lastUpdated}</p>
          </div>
          
          <div className="prose prose-invert prose-p:leading-relaxed prose-p:mb-6 prose-headings:font-space-grotesk prose-headings:text-white prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline prose-li:mb-2 max-w-none">
            {children}
          </div>
        </article>
      </main>

      <footer className="border-t border-white/5 bg-[#0a1122] py-12 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-space-grotesk font-black text-xl tracking-tighter italic text-white/30">PLATTFORM</div>
          <div className="flex flex-wrap justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            <Link href="/privacidad" className="hover:text-cyan-400 transition-colors">Privacidad</Link>
            <Link href="/terminos" className="hover:text-cyan-400 transition-colors">Términos</Link>
            <Link href="/reembolsos" className="hover:text-cyan-400 transition-colors">Reembolsos</Link>
            <Link href="/cookies" className="hover:text-cyan-400 transition-colors">Cookies</Link>
            <Link href="/faq" className="hover:text-cyan-400 transition-colors">FAQ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
