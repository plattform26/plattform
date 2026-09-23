'use client';
import { useState } from 'react';
import Link from 'next/link';

interface FAQ {
  question: string;
  answer: React.ReactNode;
}

interface Category {
  id: string;
  title: string;
  icon: string;
  faqs: FAQ[];
}

const FAQ_DATA: Category[] = [
  {
    id: 'students',
    title: 'Para estudiantes',
    icon: '🎓',
    faqs: [
      {
        question: '¿Cómo accedo a mis cursos comprados?',
        answer: 'Puedes acceder a tus cursos iniciando sesión y yendo a tu Dashboard de estudiante. Allí encontrarás todos los cursos en los que estás inscrito.'
      },
      {
        question: '¿Cómo obtengo mi certificado al terminar?',
        answer: 'Una vez completadas todas las lecciones y aprobadas las evaluaciones correspondientes, el certificado se generará automáticamente en la sección "Certificados" de tu perfil.'
      }
    ]
  },
  {
    id: 'instructors',
    title: 'Para instructores',
    icon: '👨‍🏫',
    faqs: [
      {
        question: '¿Cómo publico mi primer curso?',
        answer: 'Regístrate como instructor, completa tu perfil y la configuración de Stripe para recibir pagos. Después, podrás acceder al "Builder" para crear tus lecciones y publicar tu curso.'
      },
      {
        question: '¿Cuándo recibo mis pagos?',
        answer: 'Plattform procesa los pagos a través de Stripe Connect. Dependiendo de tu ubicación, los fondos se transfieren automáticamente a tu cuenta bancaria en un plazo de 2 a 7 días hábiles tras cada venta.'
      }
    ]
  },
  {
    id: 'privacy',
    title: 'Privacidad y seguridad',
    icon: '🔒',
    faqs: [
      {
        question: '¿Cómo protegen mis datos de pago?',
        answer: 'No almacenamos datos de tarjetas de crédito. Utilizamos Stripe como procesador de pagos, el cual cumple con los más altos estándares de seguridad y certificación PCI.'
      },
      {
        question: '¿Puedo solicitar la eliminación de mi cuenta?',
        answer: 'Sí. Puedes solicitar la eliminación de tu cuenta contactando a soporte, o puedes esperar a que las rutinas de limpieza automática eliminen las cuentas sin compras y con inactividad de más de 3 meses.'
      }
    ]
  },
  {
    id: 'support',
    title: 'Soporte técnico',
    icon: '🛠️',
    faqs: [
      {
        question: '¿Qué hago si un video no carga?',
        answer: 'Verifica tu conexión a internet y asegúrate de no tener bloqueadores de contenido que interfieran. Si el problema persiste, contacta a soporte@plattform.mx.'
      }
    ]
  }
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleAccordion = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  const filteredData = FAQ_DATA.map(category => ({
    ...category,
    faqs: category.faqs.filter(
      faq => 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (typeof faq.answer === 'string' && faq.answer.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })).filter(category => category.faqs.length > 0);

  return (
    <div className="min-h-screen bg-[#070d1a] text-[#CBD5E1] font-sans">
      <header className="fixed top-0 left-0 right-0 h-20 border-b border-white/5 bg-[#070d1a]/80 backdrop-blur-xl z-50 flex items-center px-6 lg:px-12">
        <Link href="/" className="font-space-grotesk font-black text-2xl tracking-tighter italic text-white hover:text-cyan-400 transition-colors">
          PLATTFORM
        </Link>
      </header>

      <main className="pt-32 pb-24 px-6 lg:px-12 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-space-grotesk text-4xl md:text-5xl font-black text-white mb-6">Preguntas Frecuentes</h1>
          <div className="relative max-w-xl mx-auto">
            <input 
              type="text" 
              placeholder="Busca tu duda (ej. certificados, pagos...)" 
              className="w-full bg-[#0d1524] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-500 transition-colors shadow-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          </div>
        </div>

        <div className="space-y-12">
          {filteredData.length === 0 ? (
            <div className="text-center py-12 text-gray-500 border border-white/5 rounded-3xl bg-white/5">
              No encontramos resultados para "{searchTerm}"
            </div>
          ) : (
            filteredData.map(category => (
              <section key={category.id}>
                <h2 className="text-xl font-space-grotesk font-bold text-white mb-6 flex items-center gap-3">
                  <span>{category.icon}</span> {category.title}
                </h2>
                <div className="space-y-4">
                  {category.faqs.map((faq, idx) => {
                    const faqId = `${category.id}-${idx}`;
                    const isExpanded = expanded === faqId;
                    return (
                      <div key={faqId} className="bg-[#0d1524] border border-white/5 rounded-2xl overflow-hidden transition-all duration-300">
                        <button 
                          className="w-full text-left px-6 py-5 flex justify-between items-center hover:bg-white/5 transition-colors focus:outline-none"
                          onClick={() => toggleAccordion(faqId)}
                        >
                          <span className="font-bold text-sm text-gray-200">{faq.question}</span>
                          <span className={`text-cyan-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                            ▼
                          </span>
                        </button>
                        <div 
                          className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                        >
                          <div className="px-6 pb-6 text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                            {faq.answer}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>
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
