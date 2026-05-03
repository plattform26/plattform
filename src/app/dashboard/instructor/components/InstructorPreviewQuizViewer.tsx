'use client';

interface QuizOption {
  id: string;
  optionText: string;
}

interface QuizQuestion {
  id: string;
  questionText: string;
  options: QuizOption[];
}

interface InstructorPreviewQuizViewerProps {
  quiz: {
    id: string;
    title: string;
    questions: QuizQuestion[];
    passingScore?: number;
  };
  courseTitle: string;
}

export default function InstructorPreviewQuizViewer({
  quiz,
  courseTitle,
}: InstructorPreviewQuizViewerProps) {
  const handleCertificateClick = () => {
    alert('Modo preview - Los diplomas se generan cuando el estudiante completa el quiz correctamente.');
  };

  return (
    <div className="space-y-12 pb-20 max-w-4xl mx-auto opacity-80">
      {/* HEADER DE ESTADO */}
      <div className="flex justify-between items-center bg-[#0d1524] p-8 rounded-[2.5rem] border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.05)]">
        <div>
          <h1 className="text-2xl font-space-grotesk font-black text-white italic uppercase tracking-tighter">
            Control de Evaluación: <span className="text-cyan-400">Modo Previsualización</span>
          </h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-bold">El quiz no es interactivo en este modo</p>
        </div>
      </div>

      {/* LISTA DE PREGUNTAS */}
      <div className="space-y-20">
        {quiz.questions.map((q, qIdx) => (
          <div key={q.id} className="space-y-10 group/q">
            <div className="flex items-start gap-8">
                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-[1.2rem] flex items-center justify-center text-gray-600 font-black text-2xl shrink-0 italic">
                    {qIdx + 1}
                </div>
                <div className="space-y-8 flex-1 pt-3">
                    <h2 className="text-2xl font-bold text-gray-200 leading-tight tracking-tight">{q.questionText}</h2>
                    
                    <div className="grid grid-cols-1 gap-5">
                      {q.options.map((opt, oIdx) => (
                        <button
                          key={opt.id}
                          disabled={true}
                          className="w-full text-left p-7 rounded-[2rem] border-2 border-white/5 bg-[#111928] transition-all flex items-center justify-between cursor-not-allowed"
                        >
                          <div className="flex items-center gap-6">
                            <div className="w-10 h-10 rounded-2xl border-2 border-white/10 text-gray-600 flex items-center justify-center font-black text-sm">
                              {String.fromCharCode(65 + oIdx)}
                            </div>
                            <span className="text-lg font-bold text-gray-400">
                              {opt.optionText}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* BOTÓN FINAL (DESHABILITADO) */}
      <div className="mt-20 flex justify-center border-t border-white/5 pt-10">
         <button 
            disabled={true}
            className="px-16 py-6 bg-cyan-500/30 text-black/50 font-black text-lg uppercase tracking-[0.2em] rounded-[2rem] cursor-not-allowed flex items-center gap-6"
         >
            <span>★ Finalizar y Calificar (Preview)</span>
         </button>
      </div>

      {/* SECCIÓN DE DIPLOMA */}
      <div className="mt-20 pt-10 border-t border-cyan-500/10 text-center">
        <p className="text-gray-500 text-xs uppercase tracking-widest mb-6">Vista previa del sistema de certificación</p>
        <button
          onClick={handleCertificateClick}
          className="px-10 py-5 bg-emerald-500/10 text-emerald-400 font-black text-xs uppercase tracking-[0.2em] rounded-2xl border border-emerald-500/20 hover:bg-emerald-500/20 transition-all shadow-xl shadow-emerald-500/5"
        >
          🎓 VER Y DESCARGAR DIPLOMA (SIMULADO)
        </button>
      </div>
    </div>
  );
}
