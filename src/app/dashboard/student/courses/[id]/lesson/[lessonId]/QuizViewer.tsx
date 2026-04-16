"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, XCircle, Award } from "lucide-react";
import { toast } from "sonner";

interface QuizViewerProps {
  quizId: string;
  courseId: string;
}

export default function QuizViewer({ quizId, courseId }: QuizViewerProps) {
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [lockedQuestions, setLockedQuestions] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const res = await fetch(`/api/student/quiz/${quizId}`);
        if (!res.ok) throw new Error('Failed to fetch quiz');
        const data = await res.json();
        setQuiz(data);
      } catch (error) {
        toast.error("Error al cargar el examen");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchQuiz();
  }, [quizId]);

  const handleOptionSelect = (questionId: string, optionId: string) => {
    if (result && result.scorePercentage >= (quiz.passingScore || 80)) return; // Modo Lectura

    // MODO DINÁMICO: Marcar y Desmarcar (Toggle)
    setSelectedAnswers(prev => {
      if (prev[questionId] === optionId) {
        const next = { ...prev };
        delete next[questionId];
        return next;
      }
      return { ...prev, [questionId]: optionId };
    });
  };

  const handleSubmit = async () => {
    const totalQuestions = quiz.questions.length;
    const answeredCount = Object.keys(selectedAnswers).length;

    if (answeredCount < totalQuestions) {
      toast.warning("Por favor responde todas las preguntas antes de calificar.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/student/quiz/${quizId}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: selectedAnswers,
          courseId
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setResult(data);
      
      const passingScore = quiz.passingScore || 80;
      if (data.scorePercentage >= passingScore) {
        setShowCertificate(true);
        toast.success("¡Felicidades! Has aprobado.");
      } else {
        toast.error(`Puntaje: ${data.scorePercentage}%. Necesitas ${passingScore}% para aprobar.`);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <Loader2 className="animate-spin text-[#00f2ff]" size={48} />
      <p className="text-[#00f2ff] font-bold animate-pulse">CARGANDO EVALUACIÓN NEÓN...</p>
    </div>
  );

  if (!quiz) return <div className="text-white p-10">Examen no encontrado.</div>;

  if (showCertificate && result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0b0e14] p-4 animate-in fade-in duration-700">
        <div id="certificate" className="max-w-4xl w-full bg-white text-black p-12 text-center border-[10px] border-double border-[#00f2ff] relative shadow-[0_0_50px_rgba(0,242,255,0.3)]">
            <p className="tracking-[0.2em] font-serif text-gray-600 mb-4">PLATTFORM ACADEMY</p>
            <h2 className="text-4xl font-black mb-8 text-black">CERTIFICADO DE APROBACIÓN</h2>
            <Award className="mx-auto mb-6 text-[#7000ff]" size={80} />
            <p className="text-xl mb-4 italic text-gray-700">Se otorga el presente a:</p>
            <h1 id="user-name" className="text-5xl font-bold mb-10 text-black decoration-[#00f2ff] underline underline-offset-8">alumno@plattform.com</h1>
            <p className="text-xl mb-4 text-gray-700">Por haber completado con éxito el curso de</p>
            <h3 className="text-2xl font-bold mb-8 text-[#7000ff] uppercase">{quiz.title || "Examen de Unidad"}</h3>
            <div className="flex justify-between items-end mt-12 px-10">
                <div className="text-left">
                    <p className="font-bold border-t border-black pt-2">CALIFICACIÓN: {result.scorePercentage}/100</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500 italic">Verificado por Sistema de IA PLATTFORM 2026</p>
                </div>
            </div>
        </div>
        <Button 
          onClick={() => window.location.reload()}
          className="mt-10 bg-[#7000ff] hover:bg-[#00f2ff] text-white font-bold px-8 py-6 rounded-full transition-all"
        >
          VOLVER A INTENTAR
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e14] text-[#e6edf3] py-10 px-4 font-sans">
      <style jsx>{`
        .quiz-option {
          display: block;
          background: #21262d;
          padding: 1.25rem;
          margin: 0.75rem 0;
          border-radius: 10px;
          cursor: pointer;
          border: 2px solid #30363d;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .quiz-option:hover:not(.locked) {
          background: #30363d;
          border-color: #00f2ff;
          box-shadow: 0 0 15px rgba(0, 242, 255, 0.2);
          transform: translateY(-2px);
        }
        .quiz-option.correct {
          border-color: #238636;
          background: rgba(35, 134, 54, 0.15);
          box-shadow: 0 0 20px rgba(35, 134, 54, 0.2);
        }
        .quiz-option.incorrect {
          border-color: #da3633;
          background: rgba(218, 54, 51, 0.15);
          box-shadow: 0 0 20px rgba(218, 54, 51, 0.2);
        }
        .quiz-option.locked {
          cursor: default;
        }
        .feedback-text {
          font-size: 0.9rem;
          margin-top: 0.5rem;
          font-weight: bold;
          animation: slideIn 0.4s ease-out;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <header className="max-w-4xl mx-auto text-center mb-12 border-b-2 border-[#00f2ff] pb-8">
        <h1 className="text-4xl font-black text-[#00f2ff] mb-2 uppercase tracking-tighter italic">Evaluación Final</h1>
        <p className="text-xl text-[#7000ff] font-bold uppercase tracking-widest">{quiz.title}</p>
      </header>

      <div className="max-w-4xl mx-auto space-y-8">
        {quiz.questions.map((question: any, qIdx: number) => {
          const selectedId = selectedAnswers[question.id];
          const resultQ = result?.questionsAndResult?.find((r: any) => r.questionId === question.id);

          return (
            <section key={question.id} className="bg-[#161b22] rounded-2xl p-8 border border-[#30363d] shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
              <div className="flex items-start gap-4 mb-6">
                <span className="bg-[#7000ff] text-white px-3 py-1 rounded-md text-xs font-black uppercase">Q{qIdx + 1}</span>
                <h2 className="text-2xl font-bold text-[#e6edf3]">{question.questionText}</h2>
              </div>

              <div className="space-y-3">
                 {question.options.map((option: any) => {
                  const isSelected = selectedId === option.id;
                  let statusClass = "";
                  
                  const selectionCorrect = resultQ ? resultQ.isCorrect : false;
                  const isCorrectMatch = resultQ ? (resultQ.correctAnswerId === option.id) : option.isCorrect;
                  const passingScore = quiz.passingScore || 80;
                  const hasPassed = result?.scorePercentage >= passingScore;

                  if (result) {
                    if (isSelected) {
                      if (hasPassed) {
                        statusClass = selectionCorrect ? "correct" : "incorrect";
                      } else {
                        statusClass = selectionCorrect ? "correct" : "incorrect";
                      }
                    } else if (isCorrectMatch && hasPassed) {
                      statusClass = "correct opacity-50"; 
                    } else {
                      statusClass = "opacity-30";
                    }
                  }

                  return (
                    <div key={option.id}>
                      <button
                        onClick={() => handleOptionSelect(question.id, option.id)}
                        disabled={!!result}
                        className={`quiz-option w-full group ${statusClass}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-medium">{option.optionText}</span>
                           {result && isSelected && (
                            selectionCorrect ? <CheckCircle2 className="text-[#238636]" /> : <XCircle className="text-[#da3633]" />
                          )}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>

               {result && (result.scorePercentage >= (quiz.passingScore || 80)) && (
                <div className={`feedback-text mt-4 p-3 rounded-lg flex items-center gap-2 ${
                  question.options.find((o: any) => o.id === selectedId)?.isCorrect 
                  ? "text-[#238636] bg-[#238636]/10" 
                  : "text-[#da3633] bg-[#da3633]/10"
                }`}>
                  <AlertTriangle size={18} />
                  <span>
                    {question.options.find((o: any) => o.id === selectedId)?.isCorrect 
                      ? "¡Excelente elección! Dominas el concepto." 
                      : "Respuesta incorrecta."}
                  </span>
                </div>
              )}
            </section>
          );
        })}

        <div className="flex flex-col items-center pt-10 pb-20 gap-6">
          {result && result.scorePercentage < (quiz.passingScore || 80) ? (
             <button 
              onClick={() => {
                setSelectedAnswers({});
                setLockedQuestions({});
                setResult(null);
              }}
              className="bg-white hover:bg-[#00f2ff] text-black font-black text-2xl py-6 px-16 rounded-xl transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] uppercase italic tracking-tighter"
             >
               ↻ Repetir Evaluación
             </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || Object.keys(selectedAnswers).length < quiz.questions.length || (result && result.scorePercentage >= (quiz.passingScore || 80))}
              className="bg-[#00f2ff] hover:bg-[#7000ff] text-[#0b0e14] hover:text-white font-black text-2xl py-6 px-16 rounded-xl transition-all shadow-[0_0_30px_rgba(0,242,255,0.4)] hover:shadow-[0_0_50px_rgba(112,0,255,0.6)] disabled:opacity-50 disabled:cursor-not-allowed uppercase italic tracking-tighter"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="animate-spin" /> PROCESANDO...
                </div>
              ) : result && result.scorePercentage >= (quiz.passingScore || 80) ? "Examen Aprobado" : "Calificar Test Final"}
            </button>
          )}
          
          <p className="text-sm text-gray-500 mt-4 uppercase tracking-widest font-bold">
            Respondidas: {Object.keys(selectedAnswers).length} / {quiz.questions.length}
          </p>
        </div>
      </div>
    </div>
  );
}

// Re-implementing simplified UI components for the Neón theme
function AlertTriangle({ size = 20, className = "" }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function Button({ onClick, children, className = "", disabled = false }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  );
}

