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
  // --- MÁQUINA DE ESTADOS (STATE MACHINE) ---
  // ESTADO NUEVO: initialAttempt es null
  // ESTADO REPROBADO: initialAttempt != null && !initialAttempt.passed
  // ESTADO APROBADO: initialAttempt != null && initialAttempt.passed

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>(() => {
    if (initialAttempt?.answersJson) {
      const savedAnswers: Record<string, string> = {};
      (initialAttempt.answersJson as any[]).forEach((res: any) => {
        // Mapeo robusto: el ID de la pregunta al ID de la opción seleccionada
        // RESINCRONIZACIÓN: Usar userAnswerId que es lo que guarda el backend
        const optId = res.userAnswerId || res.optionId || res.userAnswer;
        if (optId) savedAnswers[res.questionId] = optId;
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
  const [showCertificate, setShowCertificate] = useState(
    initialAttempt?.passed
  );
  const [finalScore, setFinalScore] = useState(
    initialAttempt ? initialAttempt.scorePercentage / 10 : 0
  );
  const passingBadge = quiz.passingScore || 80;
  const router = useRouter();

  // ACCIÓN: REINTENTAR (Limpia estado local)
  const handleRetry = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setResults([]);
    setShowCertificate(false);
    setFinalScore(0);
  };

  const handleOptionSelect = (qId: string, optionId: string) => {
    if (showResults && finalScore >= (passingBadge / 10)) return; // Bloquear si ya aprobó (Modo Lectura)
    
    // MODO DINÁMICO: Marcar y Desmarcar (Toggle)
    setSelectedAnswers(prev => {
      if (prev[qId] === optionId) {
        const next = { ...prev };
        delete next[qId];
        return next;
      }
      return { ...prev, [qId]: optionId };
    });
  };

  const calculateScore = async () => {
    // 1. Validación de Datos (Evitar undefined)
    if (!quiz?.questions || quiz.questions.length === 0) return;

    const answeredCount = Object.keys(selectedAnswers).length;
    const totalQuestions = quiz?.questions?.length || 0;

    if (answeredCount < totalQuestions) {
       alert(`Por favor responde todas las preguntas (${answeredCount}/${totalQuestions}).`);
       return;
    }

    setLoading(true);
    try {
      // 2. Validación de Contenido de Respuestas
      const payload = { 
    courseId,
        answers: selectedAnswers 
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
      const { scorePercentage, passed, questionsAndResult, certification } = data;
      
      setFinalScore(scorePercentage / 10);
      setResults(questionsAndResult || []);
      setShowResults(true);

      if (passed) {
        setShowCertificate(true);
        setFeedback({ certCode: certification?.certificateCode || 'PLT-GENERATED' });
        router.refresh(); // Actualizar widgets del dashboard
      } else {
        alert(`Puntaje obtenido: ${scorePercentage}%. Necesitas al menos ${passingBadge}% para aprobar.`);
      }
    } catch (err: any) {
      console.error('QuizViewer Error:', err);
      alert(err.message || 'Hubo un error al guardar tu progreso. Reintenta en unos momentos.');
    } finally {
      setLoading(false);
    }
  };

  // DEBUG: Auditoría de Datos
  console.log("Datos del Quiz Recibidos en QuizViewer:", JSON.stringify(quiz, null, 2));

  // VISTA DE CERTIFICADO (APROBADO EXCELENCIA)
  if (showCertificate) {
    return (
      <div className="space-y-12 animate-in fade-in zoom-in duration-700 flex flex-col items-center py-20">
        <div className="text-center space-y-6">
           <div className="text-8xl animate-pulse drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">🏆</div>
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
      {/* HEADER DE ESTADO */}
      <div className="flex justify-between items-center bg-[#0d1524] p-8 rounded-[2.5rem] border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.05)]">
        <div>
          <h1 className="text-2xl font-space-grotesk font-black text-white italic uppercase tracking-tighter">
            Control de Evaluación: <span className={`${
              initialAttempt?.passed ? 'text-green-400' : 'text-cyan-400'
            }`}>
              {initialAttempt?.passed ? 'Certificado Emitido' : 'Pendiente de Calificación'}
            </span>
          </h1>
        </div>
        {initialAttempt?.passed && (
            <div className="flex items-center gap-4">
               <div className="bg-cyan-500/10 border border-cyan-500/20 px-6 py-4 rounded-[1.5rem]">
                  <span className="text-cyan-400 font-black text-xs uppercase tracking-widest">🎓 Certificado Listo</span>
               </div>
            </div>
        )}
      </div>

      {/* LISTA DE PREGUNTAS */}
      <div className="space-y-20">
        {quiz?.questions?.map((q: any, qIdx: number) => {
          // Restaurar fallback robusto para opciones (Soporte Legacy JSON + New Table)
          const currentOptions = q.options || [];
          
          return (
            <div key={q.id} className="space-y-10 group/q">
              <div className="flex items-start gap-8">
                  <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-[1.2rem] flex items-center justify-center text-gray-600 font-black text-2xl shrink-0 italic group-hover/q:text-cyan-400 group-hover/q:border-cyan-500/30 transition-all duration-500">
                      {qIdx + 1}
                  </div>
                  <div className="space-y-8 flex-1 pt-3">
                      <h2 className="text-2xl font-bold text-gray-200 leading-tight tracking-tight">{q.questionText}</h2>
                      
                      <div className="grid grid-cols-1 gap-5">
                        {currentOptions.map((opt: any, oIdx: number) => {
                          const optionId = opt.id;
                          const optionText = opt.optionText;
                          const isSelected = selectedAnswers[q.id] === optionId;
                          const resultQ = results.find(r => r.questionId === q.id);
                          
                          // LÓGICA DE VERDAD: resultQ.isCorrect viene del backend
                          // correctAnswerId solo viene si aprobó (Modo Revelador)
                          const isMatch = resultQ ? (resultQ.correctAnswerId === optionId) : opt.isCorrect;
                          const selectionCorrect = resultQ ? resultQ.isCorrect : false;
                          
                          return (
                            <button
                              key={optionId}
                              onClick={() => handleOptionSelect(q.id, optionId)}
                              disabled={showResults}
                              className={`w-full text-left p-7 rounded-[2rem] border-2 transition-all flex items-center justify-between group/opt active:scale-[0.98] ${
                                isSelected
                                  ? finalScore >= (passingBadge / 10)
                                    ? isMatch 
                                      ? 'bg-green-500/10 border-green-500 shadow-xl shadow-green-500/10'
                                      : 'bg-red-500/10 border-red-500'
                                    : selectionCorrect
                                      ? 'bg-cyan-500/10 border-cyan-500 shadow-xl shadow-cyan-500/10 transition-none' // Cyan si acertó pero falló total
                                      : 'bg-red-500/10 border-red-500 shadow-xl shadow-red-500/10 transition-none' // Rojo si falló
                                  : showResults && isMatch && finalScore >= (passingBadge / 10)
                                    ? 'bg-green-500/10 border-green-500 shadow-xl shadow-green-500/10'
                                    : 'bg-[#111928] border-white/5'
                              }`}
                            >
                              <div className="flex items-center gap-6">
                                <div className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center font-black text-sm transition-all ${
                                  isSelected ? 'bg-cyan-500 border-cyan-500 text-black' : 'border-white/10 text-gray-600'
                                }`}>
                                  {String.fromCharCode(65 + oIdx)}
                                </div>
                                <span className={`text-lg font-bold transition-colors ${isSelected ? 'text-white' : 'text-gray-400 group-hover/opt:text-gray-200'}`}>
                                  {optionText}
                                </span>
                              </div>
                              
                              {showResults && (
                                <div className="flex items-center gap-3">
                                  {/* Solo mostrar etiqueta 'Correcta' si aprobó (Modo Éxito) */}
                                  {isMatch && finalScore >= (passingBadge / 10) && (
                                    <span className="text-green-400 font-black text-[10px] uppercase tracking-widest bg-green-400/10 px-4 py-1.5 rounded-xl border border-green-500/20 shadow-md shadow-green-500/10 animate-pulse">Correcta</span>
                                  )}
                                  {isSelected && (
                                    <span className={`${resultQ ? (resultQ.isCorrect ? 'text-cyan-400' : 'text-red-400') : 'text-cyan-400'} font-black text-[10px] uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-xl border border-white/10`}>
                                      Tu elección
                                    </span>
                                  )}
                                </div>
                              )}
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

      {/* BOTÓN FINAL, REINTENTO O DESCARGA */}
      {showResults ? (
        finalScore >= (passingBadge / 10) ? (
          <div className="mt-20 flex flex-col items-center gap-8 border-t border-cyan-500/10 pt-10">
             <div className="p-8 bg-cyan-500/5 border border-cyan-500/10 rounded-[3rem] w-full text-center">
                <h3 className="text-cyan-400 font-space-grotesk font-black uppercase italic tracking-tighter text-xl mb-4">Certificación Acreditada</h3>
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-8">Has superado satisfactoriamente esta evaluación con {finalScore * 10}%</p>
                
                <div className="flex justify-center">
                  <CertificateDownloader 
                    studentName={studentName}
                    courseTitle={quiz.course?.title || 'Certificación de Curso'}
                    certificateCode={feedback.certCode || initialAttempt?.certification?.certificateCode || 'PLT-GENERATED'}
                    finalScore={finalScore}
                    buttonText="🎓 VER Y DESCARGAR DIPLOMA"
                  />
                </div>
             </div>
          </div>
        ) : (
          <div className="mt-20 flex flex-col items-center gap-6 border-t border-red-500/10 pt-10">
            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center max-w-md">
              <p className="text-red-400 font-bold uppercase tracking-widest text-sm mb-2">Evaluación No Aprobada</p>
              <p className="text-gray-400 text-xs tracking-tight">Obtuviste {finalScore * 10}%. El sistema ha bloqueado las respuestas correctas para tu próximo intento. ¡Repasa y vuelve a intentarlo!</p>
            </div>
            <button 
              onClick={handleRetry}
              className="px-16 py-6 bg-white text-black font-black text-lg uppercase tracking-[0.2em] rounded-[2rem] hover:bg-cyan-400 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] active:scale-95 flex items-center gap-4"
            >
              <span>↻ Repetir Evaluación</span>
            </button>
          </div>
        )
      ) : (
        <div className="mt-20 flex justify-center border-t border-white/5 pt-10">
           <button 
              onClick={calculateScore}
              disabled={loading || Object.keys(selectedAnswers).length !== quiz.questions.length}
              className="px-16 py-6 bg-cyan-500 text-black font-black text-lg uppercase tracking-[0.2em] rounded-[2rem] hover:scale-105 transition-all shadow-[0_20px_50px_rgba(6,182,212,0.4)] active:scale-95 disabled:opacity-30 disabled:grayscale disabled:scale-100 flex items-center gap-6"
           >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <span>★ Finalizar y Calificar</span>
                  <div className="bg-black/10 px-3 py-1 rounded-lg text-sm">
                    {Object.keys(selectedAnswers).length}/{quiz.questions.length}
                  </div>
                </>
              )}
           </button>
        </div>
      )}
    </div>


  );
}
