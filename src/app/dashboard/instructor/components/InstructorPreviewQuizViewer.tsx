'use client';

import { useState } from 'react';

interface QuizOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | string;
  options?: QuizOption[];
}

interface InstructorPreviewQuizViewerProps {
  quiz: {
    id: string;
    title: string;
    description?: string;
    questions: QuizQuestion[];
    passingScore?: number;
  };
  courseTitle: string;
}

export default function InstructorPreviewQuizViewer({
  quiz,
  courseTitle,
}: InstructorPreviewQuizViewerProps) {
  // Estado para respuestas del instructor (simulación)
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const handleOptionClick = (questionId: string, optionId: string) => {
    if (submitted) return;
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleTextInput = (questionId: string, text: string) => {
    if (submitted) return;
    setAnswers(prev => ({
      ...prev,
      [questionId]: text
    }));
  };

  const handleSubmitQuiz = () => {
    setSubmitted(true);
    alert('Quiz simulado - No se guardan los datos (modo preview del instructor)');
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const handleCertificateClick = () => {
    alert('Modo preview - Los diplomas se generan cuando el estudiante completa el quiz correctamente.');
  };

  return (
    <div className="space-y-12 pb-20 max-w-4xl mx-auto">
      {/* HEADER DE ESTADO */}
      <div className="flex justify-between items-center bg-[#0d1524] p-8 rounded-[2.5rem] border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.05)]">
        <div>
          <h1 className="text-2xl font-space-grotesk font-black text-white italic uppercase tracking-tighter">
            Control de Evaluación: <span className="text-cyan-400">Modo Simulación</span>
          </h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-bold">
            Puntuación requerida: {quiz.passingScore || 70}% • Las respuestas no se guardan
          </p>
          {quiz.description && (
             <p className="text-xs text-gray-400 mt-4 font-medium leading-relaxed italic">"{quiz.description}"</p>
          )}
        </div>
        <div className="hidden md:block">
           <div className="w-20 h-20 rounded-full border-2 border-cyan-500/10 flex items-center justify-center">
              <span className="text-2xl">📝</span>
           </div>
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
                    <h2 className="text-2xl font-bold text-gray-200 leading-tight tracking-tight">{q.question}</h2>
                    
                    {/* Opciones - Multiple Choice / True False */}
                    {(q.type === 'multiple_choice' || q.type === 'true_false' || !q.type) && q.options && (
                      <div className="grid grid-cols-1 gap-5">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = answers[q.id] === opt.id;
                          return (
                            <button
                              key={opt.id}
                              disabled={submitted}
                              onClick={() => handleOptionClick(q.id, opt.id)}
                              className={`
                                w-full text-left p-7 rounded-[2rem] border-2 transition-all flex items-center justify-between
                                ${isSelected 
                                  ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.1)]' 
                                  : 'border-white/5 bg-[#111928] hover:border-white/10'
                                }
                                ${submitted ? 'cursor-default' : 'cursor-pointer'}
                              `}
                            >
                              <div className="flex items-center gap-6">
                                <div className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center font-black text-sm transition-colors ${
                                  isSelected ? 'border-cyan-400 bg-cyan-400 text-black' : 'border-white/10 text-gray-600'
                                }`}>
                                  {String.fromCharCode(64 + (oIdx + 1))}
                                </div>
                                <span className={`text-lg font-bold transition-colors ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                                  {opt.text}
                                </span>
                              </div>
                              {isSelected && (
                                <div className="w-6 h-6 rounded-full bg-cyan-400 flex items-center justify-center text-black text-[10px] font-black">
                                   ✓
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Respuesta corta */}
                    {q.type === 'short_answer' && (
                      <div className="relative group/input">
                         <input
                           type="text"
                           disabled={submitted}
                           value={answers[q.id] || ''}
                           onChange={(e) => handleTextInput(q.id, e.target.value)}
                           placeholder="Escribe tu respuesta aquí..."
                           className="w-full px-8 py-6 rounded-[2rem] bg-[#111928] border-2 border-white/5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/40 transition-all font-bold tracking-tight"
                         />
                      </div>
                    )}
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="mt-20 flex flex-col md:flex-row gap-6 justify-center border-t border-white/5 pt-10">
         <button 
            onClick={handleSubmitQuiz}
            disabled={submitted || Object.keys(answers).length === 0}
            className={`
               px-16 py-6 font-black text-lg uppercase tracking-[0.2em] rounded-[2rem] flex items-center justify-center gap-6 transition-all
               ${submitted || Object.keys(answers).length === 0
                 ? 'bg-white/5 text-gray-700 cursor-not-allowed'
                 : 'bg-cyan-500 text-black hover:bg-white hover:scale-[1.02] shadow-[0_20px_40px_rgba(6,182,212,0.2)]'
               }
            `}
         >
            <span>★ Finalizar Simulación</span>
         </button>
         
         {submitted && (
           <button 
              onClick={handleReset}
              className="px-10 py-6 bg-white/5 text-white font-black text-lg uppercase tracking-[0.2em] rounded-[2rem] hover:bg-white/10 transition-all border border-white/10"
           >
              Reiniciar
           </button>
         )}
      </div>

      {/* FEEDBACK POST-ENVÍO */}
      {submitted && (
        <div className="p-8 bg-green-500/10 border border-green-500/20 rounded-[2rem] text-center animate-in fade-in zoom-in duration-300">
          <p className="text-green-400 font-bold uppercase tracking-[0.1em] text-sm">
            ✓ Quiz simulado correctamente
          </p>
          <p className="text-gray-500 text-xs mt-2 font-medium">
             En producción, se validarían las respuestas y se generaría un diploma si apruebas.
          </p>
        </div>
      )}

      {/* SECCIÓN DE DIPLOMA */}
      <div className="mt-20 pt-10 border-t border-cyan-500/10 text-center">
        <p className="text-gray-500 text-xs uppercase tracking-widest mb-6 font-bold">Vista previa del sistema de certificación</p>
        <button
          onClick={handleCertificateClick}
          className="px-10 py-5 bg-emerald-500/10 text-emerald-400 font-black text-xs uppercase tracking-[0.2em] rounded-2xl border border-emerald-500/20 hover:bg-emerald-500/30 transition-all shadow-xl shadow-emerald-500/5 flex items-center gap-4 mx-auto"
        >
          <span>🎓</span> VER Y DESCARGAR DIPLOMA (SIMULADO)
        </button>
      </div>
    </div>
  );
}
