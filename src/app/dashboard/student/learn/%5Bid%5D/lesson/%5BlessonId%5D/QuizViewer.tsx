'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CertificateDownloader from '@/components/CertificateDownloader';

export default function QuizViewer({ 
  quiz, 
  courseId, 
  lessonId, 
  userId,
  studentName,
  initialAttempt
}: { 
  quiz: any; 
  courseId: string; 
  lessonId: string; 
  userId: string;
  studentName: string;
  initialAttempt?: any;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    if (initialAttempt?.answersJson) {
      const savedAnswers: Record<string, string> = {};
      (initialAttempt.answersJson as any[]).forEach((res: any) => {
        savedAnswers[res.questionId] = res.userAnswerId || res.optionId || res.userAnswer;
      });
      return savedAnswers;
    }
    return {};
  });

  const [showResults, setShowResults] = useState(!!initialAttempt);
  const [results, setResults] = useState<any[]>(initialAttempt?.answersJson || []);
  const [feedback, setFeedback] = useState<Record<string, any>>({ 
    certCode: initialAttempt?.certification?.certificateCode || '' 
  });
  const [loading, setLoading] = useState(false);
  const [showCertificate, setShowCertificate] = useState(initialAttempt?.passed);
  const [finalScore, setFinalScore] = useState(
    initialAttempt ? initialAttempt.scorePercentage / 10 : 0
  );

  const passingBadge = quiz.passingScore || 80;
  const router = useRouter();

  const currentPassed = finalScore >= (passingBadge / 10);
  const isSealed = initialAttempt?.passed || showCertificate;

  const handleRetry = () => {
    setAnswers({});
    setShowResults(false);
    setResults([]);
    setShowCertificate(false);
    setFinalScore(0);
  };

  const handleOptionSelect = (qId: string, optionId: string) => {
    if (showResults || isSealed) return;
    setAnswers(prev => ({ ...prev, [qId]: optionId }));
  };

  const calculateScore = async () => {
    if (!quiz?.questions || quiz.questions.length === 0) return;

    const answeredCount = Object.keys(answers).length;
    const totalQuestions = quiz?.questions?.length || 0;

    if (answeredCount < totalQuestions) {
       alert(`Por favor responde todas las preguntas (${answeredCount}/${totalQuestions}).`);
       return;
    }

    setLoading(true);
    try {
      const payload = { 
        courseId,
        answers: Object.fromEntries(
          Object.entries(answers).filter(([_, v]) => v !== undefined && v !== null)
        ) 
      };

      const res = await fetch(`/api/student/quiz/${quiz.id}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al procesar el examen');
      }
      
      const data = await res.json();
      const { scorePercentage, passed: hasPassed, questionsAndResult, certification } = data;
      
      setFinalScore(scorePercentage / 10);
      setResults(questionsAndResult || []);
      setShowResults(true);

      if (hasPassed) {
        setShowCertificate(true);
        setFeedback({ certCode: certification?.certificateCode || 'PLT-GENERATED' });
        router.refresh();
      } else {
        // Alerta de fallo integrada en el botón (no intrusiva)
      }
    } catch (err: any) {
      console.error('QuizViewer Error:', err);
      alert(err.message || 'Error al guardar progreso.');
    } finally {
      setLoading(false);
    }
  };

  if (showCertificate) {
    return (
      <div className="space-y-12 animate-in fade-in zoom-in duration-700 flex flex-col items-center py-20 text-center">
        <div className="space-y-6">
           <div className="text-8xl animate-bounce drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">🏆</div>
           <h2 className="text-5xl font-space-grotesk font-black text-cyan-400 uppercase italic tracking-tighter">¡Excelencia Alcanzada!</h2>
           <p className="text-gray-400 text-sm font-black uppercase tracking-[0.3em] max-w-md mx-auto leading-loose">
             Has superado satisfactoriamente el estándar del {passingBadge}%. Tu certificación oficial Plattform ha sido generada.
           </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-10">
           <button 
             onClick={() => router.push(`/dashboard/student/learn/${courseId}`)}
             className="px-8 py-5 bg-white/5 border border-white/10 text-gray-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-white hover:text-black transition-all shadow-xl"
           >
              ← Volver a las lecciones
           </button>
           
           <CertificateDownloader 
              studentName={studentName}
              courseTitle={quiz.course?.title || 'Curso de Especialización'}
              certificateCode={feedback.certCode || initialAttempt?.certification?.certificateCode || 'PLT-SYNC'}
              finalScore={finalScore}
           />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20 max-w-4xl mx-auto">
      <div className="flex justify-between items-center bg-[#0d1524] p-8 rounded-[2.5rem] border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.05)]">
        <div>
          <h1 className="text-2xl font-space-grotesk font-black text-white italic uppercase tracking-tighter">
            Control de Evaluación: <span className={`${
              isSealed ? 'text-green-400' : 'text-cyan-400'
            }`}>
              {isSealed ? 'Certificado Emitido' : 'Modo Desafío Inicial'}
            </span>
          </h1>
        </div>
      </div>

      <div className="space-y-20">
        {quiz?.questions?.map((q: any, qIdx: number) => {
          const currentOptions = q.options || [];
          const resultQ = results.find(r => r.questionId === q.id);
          
          return (
            <div key={q.id} className="space-y-10 group/q">
              <div className="flex items-start gap-8">
                  <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-[1.2rem] flex items-center justify-center text-gray-600 font-black text-2xl shrink-0 italic group-hover/q:text-cyan-400 transition-all duration-500">
                      {qIdx + 1}
                  </div>
                  <div className="space-y-8 flex-1 pt-3">
                      <h2 className="text-2xl font-bold text-gray-200 leading-tight tracking-tight">{q.questionText}</h2>
                      
                      <div className="grid grid-cols-1 gap-5">
                        {currentOptions.map((opt: any, oIdx: number) => {
                          const optionId = opt.id;
                          const isSelected = answers[q.id] === optionId;
                          const isCorrect = resultQ?.correctAnswerId === optionId || opt.isCorrect;
                          
                          // Lógica de Colores Pedagógicos (Modo Desafío)
                          let borderColor = 'border-white/5';
                          let bgColor = 'bg-[#111928]';
                          
                          if (isSelected) {
                            if (showResults) {
                                // En fallo (< passingScore), solo mostramos si SU elección fue correcta o no
                                // No revelamos cuál era la correcta si no la eligió
                                if (isCorrect) {
                                    borderColor = 'border-cyan-500';
                                    bgColor = 'bg-cyan-500/10';
                                } else {
                                    borderColor = 'border-red-500';
                                    bgColor = 'bg-red-500/10';
                                }
                            } else {
                                borderColor = 'border-cyan-500';
                                bgColor = 'bg-cyan-500/10 shadow-xl shadow-cyan-500/10';
                            }
                          } else if (showResults && currentPassed && isCorrect) {
                            // Solo revelamos las correctas no elegidas SI ya aprobó
                            borderColor = 'border-green-500';
                            bgColor = 'bg-green-500/5';
                          }

                          return (
                            <button
                              key={optionId}
                              onClick={() => handleOptionSelect(q.id, optionId)}
                              disabled={showResults}
                              className={`w-full text-left p-7 rounded-[2rem] border-2 transition-all flex items-center justify-between group/opt active:scale-[0.98] ${bgColor} ${borderColor}`}
                            >
                              <div className="flex items-center gap-6">
                                <div className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center font-black text-sm transition-all ${
                                  isSelected ? (showResults && !isCorrect ? 'bg-red-500 border-red-500 text-white' : 'bg-cyan-500 border-cyan-500 text-black') : 'border-white/10 text-gray-600'
                                }`}>
                                  {String.fromCharCode(65 + oIdx)}
                                </div>
                                <span className={`text-lg font-bold transition-colors ${isSelected ? 'text-white' : 'text-gray-400 group-hover/opt:text-gray-200'}`}>
                                  {opt.optionText}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                {/* REGLA: Ocultar etiqueta 'Correcta' si no ha aprobado */}
                                {showResults && currentPassed && isCorrect && (
                                  <span className="text-green-400 font-black text-[10px] uppercase tracking-widest bg-green-400/10 px-4 py-1.5 rounded-xl border border-green-500/20 shadow-md shadow-green-500/10 animate-pulse">Correcta</span>
                                )}
                                {showResults && isSelected && (
                                  <span className={`${isCorrect ? 'text-cyan-400' : 'text-red-400'} font-black text-[10px] uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-xl border border-white/10`}>
                                    {isCorrect ? 'Acierto' : (currentPassed ? 'Incorrecto' : 'Tu Elección')}
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                  </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-20 flex justify-center sticky bottom-10 z-50">
          {!showResults ? (
            <button 
                onClick={calculateScore}
                disabled={loading || Object.keys(answers).length !== quiz.questions.length}
                className="px-16 py-6 bg-cyan-500 text-black font-black text-lg uppercase tracking-[0.2em] rounded-[2rem] hover:scale-105 transition-all shadow-[0_20px_50px_rgba(6,182,212,0.4)] disabled:opacity-30 flex items-center gap-6"
            >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>★ Finalizar y Calificar</span>
                    <div className="bg-black/10 px-3 py-1 rounded-lg text-sm">
                      {Object.keys(answers).length}/{quiz.questions.length}
                    </div>
                  </>
                )}
            </button>
          ) : !currentPassed ? (
            <button 
                onClick={handleRetry}
                className="px-16 py-6 bg-white border-2 border-white text-black font-black text-lg uppercase tracking-[0.2em] rounded-[2rem] hover:bg-black hover:text-white transition-all shadow-xl flex items-center gap-6 group"
            >
                <span className="group-hover:animate-pulse">↻ Repetir Evaluación</span>
                <div className="bg-black/5 px-3 py-1 rounded-lg text-xs opacity-50">
                    Puntaje: {finalScore * 10}%
                </div>
            </button>
          ) : null}
      </div>
    </div>
  );
}
