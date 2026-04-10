'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBuilder } from '../layout';

export default function BuilderQuizPage() {
  const { id: courseId } = useParams();
  const { course, fetchCourse } = useBuilder();
  const router = useRouter();

  const [quiz, setQuiz] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({ 
    questions: [], 
    title: '', 
    passingScore: 90 
  });

  useEffect(() => {
    if (course?.quizzes?.[0]) {
        const q = course.quizzes[0];
        setQuiz(q);
        setForm({
            title: q.title,
            passingScore: q.passingScore,
            totalScore: q.totalScore,
            scoreDistribution: q.scoreDistribution,
            questions: (q.questions || []).map((qu: any) => ({
                id: qu.id,
                questionText: qu.questionText,
                questionType: qu.questionType,
                optionsJson: qu.optionsJson,
                correctAnswer: qu.correctAnswer,
                points: qu.points
            }))
        });
    } else {
        // Initial state for new quiz
        setForm({
            title: 'Examen Final del Curso',
            passingScore: 80,
            totalScore: 100,
            scoreDistribution: 'AUTOMATIC',
            questions: []
        });
    }
  }, [course]);

  const handleSave = async () => {
    // 1. Validation for exactly 100 points
    const questions = form?.questions || [];
    const totalPoints = questions.reduce((sum: number, q: any) => sum + (Number(q.points) || 0), 0);
    
    // Auto-distribute points if AUTOMATIC to match 100
    let finalQuestions = questions;
    if (questions.length > 0 && form?.scoreDistribution === 'AUTOMATIC') {
        const ptsPerQ = Math.floor(100 / questions.length);
        const remainder = 100 % questions.length;
        finalQuestions = questions.map((q: any, i: number) => ({
            ...q,
            points: i === 0 ? ptsPerQ + remainder : ptsPerQ
        }));
    } else if (totalPoints !== 100) {
        alert(`❌ Error de Validación: El puntaje total sumado debe ser exactamente 100 puntos. (Actual: ${totalPoints})`);
        return;
    }

    setSaving(true);
    const url = `/api/courses/${courseId}/quiz`;
    
    const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, questions: finalQuestions })
    });

    if (res.ok) {
        await fetchCourse();
        setIsEditing(false);
        alert('💾 ¡Evaluación Guardada y Sincronizada con éxito!');
        router.push(`/dashboard/instructor/courses/${courseId}/builder`);
    } else {
        const err = await res.json();
        alert(`❌ Error al guardar: ${err.error || 'Error desconocido'}`);
    }
    setSaving(false);
  };

  const addQuestion = () => {
    const currentQuestions = form?.questions || [];
    setForm({
        ...form,
        questions: [...currentQuestions, {
            id: 'temp-' + Date.now(),
            questionText: 'Nueva Pregunta',
            questionType: 'SINGLE',
            optionsJson: ['Opción A', 'Opción B', 'Opción C'],
            correctAnswer: 0,
            points: form?.scoreDistribution === 'MANUAL' ? 10 : 0
        }]
    });
    setIsEditing(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-40 relative">
       <header className="flex justify-between items-end bg-[#0b0e14]/80 backdrop-blur-xl p-6 rounded-3xl border border-white/5 sticky top-0 z-[100] shadow-2xl">
          <div>
             <span className="text-xl">📝</span>
             <h1 className="text-2xl font-space-grotesk font-black text-white mt-2 uppercase tracking-tight italic">Constructor de <span className="text-cyan-400">Examen Final</span></h1>
          </div>
          <div className="flex gap-4">
             <button 
                onClick={handleSave}
                disabled={saving || (form?.questions?.length || 0) === 0}
                className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-black rounded-2xl text-[12px] font-black hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.2em] shadow-xl shadow-cyan-500/20 flex items-center gap-3"
             >
                {saving ? '📦 GUARDANDO...' : '💾 GUARDAR EXAMEN'}
             </button>
          </div>
       </header>

       <div className={`card bg-[#161b22] border border-[#30363d] rounded-3xl p-10 shadow-2xl relative ${isEditing ? 'ring-2 ring-purple-500/30' : ''}`}>
           {isEditing ? (
               <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                         <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2 italic">Meta de Aprobación (%)</label>
                         <input 
                            type="number" value={form.passingScore} 
                            onChange={e => setForm({...form, passingScore: parseInt(e.target.value)})}
                            className="w-full bg-[#070d1a] border border-[#30363d] rounded-2xl px-6 py-3 text-sm text-white focus:border-purple-500 outline-none transition-all"
                         />
                      </div>
                      <div>
                         <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2 italic">Puntaje Total</label>
                         <select 
                            value={form.totalScore} 
                            onChange={e => setForm({...form, totalScore: parseInt(e.target.value)})}
                            className="w-full bg-[#070d1a] border border-[#30363d] rounded-2xl px-6 py-3 text-sm text-white focus:border-purple-500 outline-none transition-all appearance-none cursor-pointer"
                         >
                            <option value={10}>10 Puntos</option>
                            <option value={100}>100 Puntos</option>
                         </select>
                      </div>
                  </div>

                  <div className="space-y-6 pt-6 border-t border-[#30363d]">
                      {(form?.questions || []).map((q: any, i: number) => (
                          <div key={q.id} className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-6 relative group">
                              <button 
                                onClick={() => {
                                    const currentQs = form?.questions || [];
                                    setForm({...form, questions: currentQs.filter((_: any, idx: number) => idx !== i)});
                                }}
                                className="absolute top-4 right-4 text-gray-700 hover:text-red-400 text-xs transition-colors"
                              >✕</button>
                              <div className="flex gap-4">
                                  <span className="text-purple-400 font-black text-xl italic">{i + 1}.</span>
                                  <div className="flex-1 space-y-4">
                                      <input 
                                        value={q.questionText} 
                                        onChange={e => {
                                            const newQ = [...(form?.questions || [])];
                                            newQ[i].questionText = e.target.value;
                                            setForm({...form, questions: newQ});
                                        }}
                                        className="w-full bg-transparent border-b border-[#30363d] py-1 text-sm text-white focus:border-purple-500 outline-none"
                                        placeholder="Escribe la pregunta..."
                                      />
                                      <div className="grid grid-cols-1 gap-2">
                                          {(q.optionsJson || []).map((opt: string, optIdx: number) => (
                                              <div key={optIdx} className="flex items-center gap-3">
                                                  <input 
                                                    type="radio" 
                                                    checked={q.correctAnswer === optIdx}
                                                    onChange={() => {
                                                        const newQ = [...(form?.questions || [])];
                                                        newQ[i].correctAnswer = optIdx;
                                                        setForm({...form, questions: newQ});
                                                    }}
                                                    className="accent-cyan-400"
                                                  />
                                                  <input 
                                                    value={opt}
                                                    onChange={e => {
                                                        const newQ = [...(form?.questions || [])];
                                                        newQ[i].optionsJson[optIdx] = e.target.value;
                                                        setForm({...form, questions: newQ});
                                                    }}
                                                    className="flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:border-cyan-500 outline-none"
                                                  />
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                              </div>
                          </div>
                      ))}
                      <button 
                        onClick={addQuestion}
                        className="w-full py-4 border-2 border-dashed border-[#30363d] rounded-2xl text-[10px] font-black text-gray-600 hover:border-purple-500/40 hover:text-purple-400 transition-all uppercase tracking-widest"
                      >
                        ➕ Agregar Pregunta
                      </button>
                  </div>
               </div>
           ) : (
               <div className="space-y-10">
                  <div className="text-center mb-12">
                      <h2 className="text-4xl font-space-grotesk font-black text-purple-400">Examen de Aprendizaje</h2>
                      <p className="text-gray-500 mt-4 text-sm leading-relaxed max-w-xl mx-auto italic font-light">Responde correctamente para obtener tu certificado digital. Necesitas un puntaje de <span className="text-cyan-400 font-bold">{quiz?.passingScore || 80}%</span> para aprobar.</p>
                  </div>

                  <div className="space-y-12">
                      {(quiz?.questions || []).map((q: any, i: number) => (
                          <div key={q.id}>
                              <p className="text-lg font-bold text-gray-200 mb-6 flex gap-4">
                                  <span className="text-purple-400 font-black italic">{i + 1}.</span>
                                  {q.questionText}
                              </p>
                              <div className="grid grid-cols-1 gap-3">
                                  {(q.optionsJson || []).map((opt: string, optIdx: number) => (
                                      <div key={optIdx} className={`p-4 rounded-2xl border transition-all ${q.correctAnswer === optIdx ? 'bg-green-500/5 border-green-500/20 text-green-400' : 'bg-[#0d1117] border-[#30363d] text-gray-500'}`}>
                                          <div className="flex justify-between items-center">
                                              <span className="text-sm font-medium">{opt}</span>
                                              {q.correctAnswer === optIdx && <span className="text-[10px] font-black uppercase tracking-widest">Respuesta Correcta ✓</span>}
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      ))}
                      {(!quiz || (quiz?.questions?.length || 0) === 0) && (
                          <div className="text-center py-20 border-2 border-dashed border-[#30363d] rounded-3xl">
                             <p className="text-gray-700 text-xs font-black uppercase tracking-[0.2em] mb-4">Sin preguntas registradas</p>
                             <button onClick={addQuestion} className="text-cyan-400 hover:underline text-[10px] font-black uppercase tracking-widest">+ Crear Primera Pregunta</button>
                          </div>
                      )}
                  </div>

                  <div className="pt-10 border-t border-[#30363d] flex justify-center">
                      <button className="px-12 py-4 bg-purple-600 rounded-2xl text-xs font-black text-white hover:scale-105 active:scale-95 transition-all shadow-xl shadow-purple-500/20 uppercase tracking-widest">
                         Calificar Test (Simulacro)
                      </button>
                  </div>
               </div>
           )}
       </div>
    </div>
  );
}
