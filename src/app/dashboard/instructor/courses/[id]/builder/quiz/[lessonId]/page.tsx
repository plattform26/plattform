'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BuilderQuizPage() {
  const { id: courseId, lessonId } = useParams();
  const router = useRouter();

  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const fetchQuiz = async () => {
    setLoading(true);
    const res = await fetch(`/api/lessons/${lessonId}/quiz`);
    const data = await res.json();
    if (data) {
        setQuiz(data);
        setQuestions(data.questions || []);
    } else {
        // Create initial quiz metadata if it doesn't exist
        const initRes = await fetch(`/api/lessons/${lessonId}/quiz`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Nueva Evaluación', passingScore: 70, totalScore: 100 })
        });
        const initData = await initRes.json();
        setQuiz(initData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuiz();
  }, [lessonId]);

  const handleSaveQuizMetadata = async () => {
    setSaving(true);
    const res = await fetch(`/api/lessons/${lessonId}/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: quiz.title,
            passingScore: quiz.passingScore,
            totalScore: quiz.totalScore
        })
    });
    if (res.ok) {
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 3000);
    }
    setSaving(false);
  };

  const addQuestion = async () => {
    setSaving(true);
    const newQuestion = {
        quizId: quiz.id,
        questionText: '¿Nueva pregunta?',
        questionType: 'SINGLE',
        optionsJson: ['Opción 1', 'Opción 2', 'Opción 3'],
        correctAnswer: 'Opción 1', // We'll handle multiple as stringified array or similar
        points: 10,
        orderIndex: questions.length
    };

    const res = await fetch('/api/quiz-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion)
    });
    
    if (res.ok) {
        const data = await res.json();
        setQuestions([...questions, data]);
    }
    setSaving(false);
  };

  const updateQuestionClient = (id: string, updates: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const saveQuestion = async (q: any) => {
    setSaving(true);
    await fetch('/api/quiz-questions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(q)
    });
    setSaving(false);
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm('¿Eliminar esta pregunta?')) return;
    const res = await fetch(`/api/quiz-questions?id=${id}`, { method: 'DELETE' });
    if (res.ok) setQuestions(questions.filter(q => q.id !== id));
  };

  const totalAssignedPoints = questions.reduce((acc, q) => acc + (parseInt(q.points) || 0), 0);

  if (loading) return <div className="p-20 text-center text-gray-400 font-mono animate-pulse uppercase tracking-widest text-xs">Sincronizando Banco de Preguntas...</div>;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 animate-fade-in pb-40 font-poppins">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <div>
                <Link href={`/dashboard/instructor/courses/${courseId}/builder`} className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-cyan-400 transition-all flex items-center gap-2">
                    ← Volver al Constructor de Curso
                </Link>
                <div className="mt-6 flex items-center gap-4">
                    <input 
                        value={quiz.title}
                        onChange={e => setQuiz({ ...quiz, title: e.target.value })}
                        onBlur={handleSaveQuizMetadata}
                        className="text-4xl font-space-grotesk font-black text-white bg-transparent border-b-2 border-transparent focus:border-cyan-500 outline-none w-full max-w-xl"
                        placeholder="Título de la Evaluación"
                    />
                </div>
                <p className="text-gray-500 text-[10px] mt-2 uppercase tracking-widest font-bold">Configuración de Examen Final / Lección</p>
            </div>
            
            <div className="flex gap-4">
                <div className="bg-[#0d1524] border border-blue-500/20 rounded-2xl px-6 py-3 flex flex-col items-center">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Puntos Totales</span>
                    <span className={`${totalAssignedPoints < quiz.totalScore ? 'text-red-400' : 'text-green-400'} font-space-grotesk font-black text-xl`}>
                        {totalAssignedPoints} / {quiz.totalScore}
                    </span>
                </div>
                <button 
                    onClick={handleSaveQuizMetadata}
                    disabled={saving}
                    className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-cyan-600/20"
                >
                    {saving ? 'Guardando...' : '💾 Guardar Evaluación'}
                </button>
            </div>
        </div>

        {/* QUESTIONS LIST */}
        <div className="space-y-8">
            {questions.map((q, qIndex) => (
                <div key={q.id} className="bg-[#161b22] border border-white/5 rounded-[2.5rem] p-10 hover:border-cyan-500/20 transition-all shadow-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-6xl opacity-[0.03] font-black italic select-none">{qIndex + 1}</div>
                    
                    <div className="flex justify-between items-start mb-8">
                        <div className="flex-1 max-w-3xl">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 block italic">Planteamiento de la Pregunta</label>
                            <textarea 
                                value={q.questionText}
                                onChange={e => updateQuestionClient(q.id, { questionText: e.target.value })}
                                onBlur={() => saveQuestion(q)}
                                rows={2}
                                className="w-full bg-[#070d1a] border border-white/5 rounded-2xl px-6 py-4 text-white font-medium focus:border-cyan-500 outline-none resize-none"
                            />
                        </div>
                        <div className="flex flex-col items-end gap-2">
                             <select 
                                value={q.questionType}
                                onChange={e => {
                                    updateQuestionClient(q.id, { questionType: e.target.value });
                                    saveQuestion({ ...q, questionType: e.target.value });
                                }}
                                className="bg-[#070d1a] border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black text-cyan-400 uppercase tracking-widest outline-none"
                             >
                                <option value="SINGLE">Selección Única (Radio)</option>
                                <option value="MULTIPLE">Selección Múltiple (Check)</option>
                             </select>
                             <button onClick={() => deleteQuestion(q.id)} className="text-red-500/30 hover:text-red-500 transition-colors text-[9px] font-black uppercase tracking-widest">Eliminar Pregunta</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* OPTIONS */}
                        <div className="lg:col-span-8 space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Opciones de Respuesta ({q.optionsJson.length}/10)</label>
                                {q.optionsJson.length < 10 && (
                                    <button 
                                        onClick={() => {
                                            const newOpts = [...q.optionsJson, 'Nueva Opción'];
                                            updateQuestionClient(q.id, { optionsJson: newOpts });
                                            saveQuestion({ ...q, optionsJson: newOpts });
                                        }}
                                        className="text-cyan-400 text-[9px] font-black uppercase tracking-widest hover:underline"
                                    >
                                        + Agregar Opción
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {q.optionsJson.map((opt: string, optIndex: number) => {
                                    const isCorrect = q.questionType === 'MULTIPLE' 
                                        ? q.correctAnswer.split(',').includes(opt)
                                        : q.correctAnswer === opt;
                                    
                                    return (
                                        <div key={optIndex} className="relative group/opt">
                                            <div className={`flex items-center gap-4 bg-[#0d1524] border ${isCorrect ? 'border-cyan-500/50' : 'border-white/5'} rounded-2xl p-4 transition-all`}>
                                                {q.questionType === 'SINGLE' ? (
                                                    <input 
                                                        type="radio"
                                                        checked={isCorrect}
                                                        onChange={() => {
                                                            updateQuestionClient(q.id, { correctAnswer: opt });
                                                            saveQuestion({ ...q, correctAnswer: opt });
                                                        }}
                                                        className="w-4 h-4 accent-cyan-500"
                                                    />
                                                ) : (
                                                    <input 
                                                        type="checkbox"
                                                        checked={isCorrect}
                                                        onChange={() => {
                                                            let answers = q.correctAnswer ? q.correctAnswer.split(',') : [];
                                                            if (answers.includes(opt)) {
                                                                answers = answers.filter((a: string) => a !== opt);
                                                            } else {
                                                                answers.push(opt);
                                                            }
                                                            const finalAns = answers.join(',');
                                                            updateQuestionClient(q.id, { correctAnswer: finalAns });
                                                            saveQuestion({ ...q, correctAnswer: finalAns });
                                                        }}
                                                        className="w-4 h-4 accent-cyan-500"
                                                    />
                                                )}
                                                <input 
                                                    value={opt}
                                                    onChange={e => {
                                                        const newOpts = [...q.optionsJson];
                                                        newOpts[optIndex] = e.target.value;
                                                        // Update correctAnswer if it was pointed to this opt
                                                        let newCorrect = q.correctAnswer;
                                                        if (q.questionType === 'SINGLE' && q.correctAnswer === opt) {
                                                              newCorrect = e.target.value;
                                                        }
                                                        updateQuestionClient(q.id, { optionsJson: newOpts, correctAnswer: newCorrect });
                                                    }}
                                                    onBlur={() => saveQuestion(q)}
                                                    className="bg-transparent text-xs text-white outline-none flex-1 font-medium"
                                                />
                                                {q.optionsJson.length > 3 && (
                                                    <button 
                                                        onClick={() => {
                                                            const newOpts = q.optionsJson.filter((_: any, i: number) => i !== optIndex);
                                                            updateQuestionClient(q.id, { optionsJson: newOpts });
                                                            saveQuestion({ ...q, optionsJson: newOpts });
                                                        }}
                                                        className="opacity-0 group-hover/opt:opacity-100 text-red-500/40 text-[8px] font-black uppercase transition-opacity"
                                                    >
                                                        Eliminar
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* SETTINGS */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-[#070d1a] border border-white/5 rounded-3xl p-6">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4 block italic text-center">Valor de la Pregunta</label>
                                <div className="flex items-center justify-center gap-4">
                                     <button onClick={() => {
                                        const p = Math.max(1, q.points - 5);
                                        updateQuestionClient(q.id, { points: p });
                                        saveQuestion({ ...q, points: p });
                                     }} className="w-10 h-10 border border-white/10 rounded-xl text-white hover:bg-white/5">-</button>
                                     <span className="text-3xl font-space-grotesk font-black text-cyan-400">{q.points}</span>
                                     <button onClick={() => {
                                        const p = q.points + 5;
                                        updateQuestionClient(q.id, { points: p });
                                        saveQuestion({ ...q, points: p });
                                     }} className="w-10 h-10 border border-white/10 rounded-xl text-white hover:bg-white/5">+</button>
                                </div>
                                <div className="mt-4 text-center">
                                    <p className="text-[9px] text-gray-500 uppercase tracking-tighter">Puntos asignados de un total de {quiz.totalScore}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* MODALS & ALERTS */}
        {showSuccessModal && (
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-green-500 text-white font-black text-[11px] px-10 py-5 rounded-3xl shadow-2xl shadow-green-500/40 animate-in slide-in-from-bottom-10 uppercase tracking-[0.2em] flex items-center gap-4 border border-white/20">
                <span className="text-xl">✅</span>
                <span>¡Examen guardado y vinculado al curso con éxito!</span>
            </div>
        )}

        {/* FINAL SAVE CTA */}
        <div className="mt-20 flex flex-col items-center">
            <div className="bg-[#0d1524] border border-cyan-500/10 p-10 rounded-[4rem] text-center max-w-2xl w-full shadow-3xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>
                <h3 className="text-2xl font-space-grotesk font-black text-white uppercase italic tracking-tighter mb-4">¿Todo listo para el <span className="text-cyan-400">Despliegue</span>?</h3>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-10 leading-relaxed">
                    Asegúrate de que el título sea descriptivo y que la suma de puntos <br/> sea exactamente **{quiz.totalScore}**.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                        onClick={async () => {
                            if (!quiz.title) return alert("El examen debe tener un título.");
                            if (totalAssignedPoints !== quiz.totalScore) {
                                return alert(`Bloqueo de Seguridad: La suma de puntos (${totalAssignedPoints}) debe ser exactamente ${quiz.totalScore}. Revisa la distribución.`);
                            }
                            await handleSaveQuizMetadata();
                            router.push(`/dashboard/instructor/courses/${courseId}/builder`);
                        }}
                        disabled={saving}
                        className="px-12 py-5 bg-cyan-500 text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white transition-all shadow-2xl hover:shadow-cyan-500/40 active:scale-95 flex items-center gap-3"
                    >
                        {saving ? '📦 GUARDANDO...' : '💾 Guardar Evaluación Final'}
                    </button>
                    <button 
                        onClick={addQuestion}
                        className="px-8 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white hover:bg-white/10 transition-all uppercase tracking-widest"
                    >
                        ➕ Nueva Pregunta
                    </button>
                </div>
            </div>
            <Link href={`/dashboard/instructor/courses/${courseId}/builder`} className="mt-8 text-[10px] font-black text-gray-700 uppercase tracking-widest hover:text-white transition-colors italic">
                O omitir y volver a la estructura del curso
            </Link>
        </div>

        {questions.length === 0 && (
            <div className="py-40 text-center border-2 border-dashed border-white/5 rounded-[5rem] animate-pulse">
                <div className="text-6xl mb-8">🧠</div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Sin Preguntas</h3>
                <p className="text-gray-500 text-xs max-w-xs mx-auto italic">Comienza a construir tu examen final agregando preguntas de selección.</p>
                <button onClick={addQuestion} className="mt-8 px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white hover:bg-white/10 transition-all uppercase tracking-widest">Crear Primera Pregunta</button>
            </div>
        )}

        <style jsx global>{`
           .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
           .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
           @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
           @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
           .shadow-3xl { shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.5); }
        `}</style>
    </div>
  );
}
