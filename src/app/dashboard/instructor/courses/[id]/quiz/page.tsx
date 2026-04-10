'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const LETTERS = 'ABCDEFGHIJKLMNO';

interface Option { text: string }
interface Question {
  id?: string;
  questionText: string;
  questionType: 'SINGLE' | 'MULTIPLE';
  options: Option[];
  correctAnswer: number[];
  points: number;
  orderIndex: number;
}

interface Quiz {
  id?: string;
  title: string;
  totalScore: number;
  passingScore: number;
  scoreDistribution: 'AUTOMATIC' | 'MANUAL';
  questions: Question[];
}

function validateSum(quiz: Quiz): { valid: boolean; sum: number } {
  const sum = quiz.questions.reduce((a, q) => a + q.points, 0);
  return { valid: quiz.scoreDistribution === 'AUTOMATIC' || sum === quiz.totalScore, sum };
}

export default function QuizBuilderPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [course, setCourse] = useState<any>(null);
  const [quiz, setQuiz] = useState<Quiz>({
    title: 'Evaluación Final',
    totalScore: 100,
    passingScore: 70,
    scoreDistribution: 'AUTOMATIC',
    questions: [],
  });
  const [quizId, setQuizId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Obtener rol del usuario actual
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { if (d.authenticated) setUserRole(d.role); });

    fetch(`/api/instructor/courses/${courseId}`)
      .then(r => r.json())
      .then(d => {
        setCourse(d);
        if (d.quizzes && d.quizzes.length > 0) {
          const q = d.quizzes[0];
          setQuizId(q.id);
          setQuiz({
            title: q.title,
            totalScore: q.totalScore,
            passingScore: q.passingScore,
            scoreDistribution: q.scoreDistribution,
            questions: (q.questions || []).map((qq: any) => {
              // Mapeo inteligente de opciones (maneja strings u objetos)
              const mappedOptions = Array.isArray(qq.optionsJson) 
                ? qq.optionsJson.map((o: any) => ({ 
                    text: typeof o === 'object' ? (o.optionText || o.text || '') : String(o) 
                  })) 
                : [];

              // Detector de respuestas correctas (basado en la bandera isCorrect de la IA)
              const autoCorrectAnswers: number[] = [];
              if (Array.isArray(qq.optionsJson)) {
                qq.optionsJson.forEach((o: any, idx: number) => {
                   if (o && typeof o === 'object' && o.isCorrect === true) {
                     autoCorrectAnswers.push(idx);
                   }
                });
              }

              return {
                id: qq.id,
                questionText: qq.questionText,
                questionType: qq.questionType,
                options: mappedOptions,
                correctAnswer: autoCorrectAnswers.length > 0 ? autoCorrectAnswers : (Array.isArray(qq.correctAnswer) ? qq.correctAnswer : []),
                points: qq.points,
                orderIndex: qq.orderIndex,
              };
            })
          });
        }
      });
  }, [courseId]);

  const showMsg = (type: 'ok' | 'err', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const autoDistribute = () => {
    if (quiz.questions.length === 0) return;
    const n = quiz.questions.length;
    const base = Math.floor(quiz.totalScore / n);
    const rem = quiz.totalScore % n;
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => ({
        ...q,
        points: i === n - 1 ? base + rem : base,
      }))
    }));
  };

  const addQuestion = () => {
    const newQ: Question = {
      questionText: '',
      questionType: 'SINGLE',
      options: [{ text: '' }, { text: '' }],
      correctAnswer: [],
      points: 0,
      orderIndex: quiz.questions.length + 1,
    };
    const updated = { ...quiz, questions: [...quiz.questions, newQ] };
    if (updated.scoreDistribution === 'AUTOMATIC') {
      const n = updated.questions.length;
      const base = Math.floor(updated.totalScore / n);
      const rem = updated.totalScore % n;
      updated.questions = updated.questions.map((q, i) => ({ ...q, points: i === n - 1 ? base + rem : base }));
    }
    setQuiz(updated);
  };

  const removeQuestion = (idx: number) => {
    const updated = { ...quiz, questions: quiz.questions.filter((_, i) => i !== idx) };
    if (updated.scoreDistribution === 'AUTOMATIC' && updated.questions.length > 0) {
      const n = updated.questions.length;
      const base = Math.floor(updated.totalScore / n);
      const rem = updated.totalScore % n;
      updated.questions = updated.questions.map((q, i) => ({ ...q, points: i === n - 1 ? base + rem : base }));
    }
    setQuiz(updated);
  };

  const updateQuestion = (idx: number, updates: Partial<Question>) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => i === idx ? { ...q, ...updates } : q)
    }));
  };

  const addOption = (qIdx: number) => {
    const q = quiz.questions[qIdx];
    if (q.options.length >= 15) return;
    updateQuestion(qIdx, { options: [...q.options, { text: '' }] });
  };

  const removeOption = (qIdx: number, oIdx: number) => {
    const q = quiz.questions[qIdx];
    if (q.options.length <= 2) return;
    const newOpts = q.options.filter((_, i) => i !== oIdx);
    const newAnswers = q.correctAnswer.filter(a => a !== oIdx).map(a => a > oIdx ? a - 1 : a);
    updateQuestion(qIdx, { options: newOpts, correctAnswer: newAnswers });
  };

  const toggleAnswer = (qIdx: number, oIdx: number) => {
    const q = quiz.questions[qIdx];
    let answers: number[];
    if (q.questionType === 'SINGLE') {
      answers = [oIdx];
    } else {
      answers = q.correctAnswer.includes(oIdx)
        ? q.correctAnswer.filter(a => a !== oIdx)
        : [...q.correctAnswer, oIdx];
    }
    updateQuestion(qIdx, { correctAnswer: answers });
  };

  const validate = (): string | null => {
    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i];
      if (!q.questionText.trim()) return `Pregunta ${i+1}: falta el texto.`;
      if (q.options.length < 2) return `Pregunta ${i+1}: mínimo 2 opciones.`;
      if (q.options.some(o => !o.text.trim())) return `Pregunta ${i+1}: todas las opciones deben tener texto.`;
      if (q.questionType === 'SINGLE' && q.correctAnswer.length !== 1) return `Pregunta ${i+1}: debe tener exactamente 1 respuesta correcta.`;
      if (q.questionType === 'MULTIPLE' && q.correctAnswer.length < 1) return `Pregunta ${i+1}: debe tener al menos 1 respuesta correcta.`;
    }
    if (quiz.scoreDistribution === 'MANUAL') {
      const { valid, sum } = validateSum(quiz);
      if (!valid) return `La suma de puntos (${sum}) no coincide con el puntaje total (${quiz.totalScore}).`;
    }
    return null;
  };

  const [showConfirm, setShowConfirm] = useState(false);

  const handleSave = async () => {
    console.log('💾 Botón de guardado presionado - Iniciando Sincronización Antigravity');
    const err = validate();
    if (err) { showMsg('err', err); return; }
    
    // Validar puntaje total exactamente 100
    const { sum } = validateSum(quiz);
    if (sum !== 100) {
      showMsg('err', `❌ El puntaje total debe sumar exactamente 100 (Actual: ${sum})`);
      return;
    }

    setSaving(true);
    try {
      // Usar el nuevo endpoint unificado que creamos
      const res = await fetch(`/api/courses/${courseId}/quiz`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              ...quiz, 
              questions: quiz.questions.map(q => ({
                  ...q,
                  optionsJson: q.options.map(o => o.text)
              }))
          })
      });

      if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Error al sincronizar');
      }

      showMsg('ok', '✅ Evaluación guardada y sincronizada correctamente');
      setShowConfirm(true);
    } catch (e: any) {
      showMsg('err', e.message);
    } finally {
      setSaving(false);
    }
  };

  const { sum } = validateSum(quiz);

  if (!course) return <div className="text-gray-400 py-20 text-center animate-pulse italic">Cargando Motor de Evaluación...</div>;

  // El bloqueo solo aplica si el usuario es INSTRUCTOR
  const isLocked = userRole === 'INSTRUCTOR' && (course.status === 'PUBLISHED' || course.status === 'HIBERNATED') && (course._count?.enrollments > 0);

  return (
    <div className={`pb-40 relative ${isLocked ? 'pointer-events-none opacity-80' : ''}`}>
      {isLocked && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-2xl px-6 pointer-events-auto">
          <div className="bg-blue-600 border border-cyan-400/50 rounded-2xl p-4 shadow-2xl flex items-center gap-4 animate-in slide-in-from-top duration-500">
            <span className="text-2xl">🔒</span>
            <div className="text-white">
              <p className="font-bold text-sm">Evaluación Bio-Protegida</p>
              <p className="text-xs opacity-90">Este curso tiene alumnos activos. No puedes modificar el examen final para proteger la integridad de sus calificaciones.</p>
            </div>
            <Link href={`/dashboard/instructor/courses/${courseId}`} className="ml-auto px-4 py-2 bg-black/20 hover:bg-black/40 rounded-xl text-xs font-bold transition-all">Volver</Link>
          </div>
        </div>
      )}
      <div className="flex items-start justify-between mb-10 flex-wrap gap-4 sticky top-0 z-[999] bg-[#0b0e14]/90 backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-2xl">
        <div className="flex-1">
          <Link href={`/dashboard/instructor/courses/${courseId}`} className="text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 mb-3 transition-colors">
            ← VOLVER AL CURSO
          </Link>
          <h1 className="text-2xl font-space-grotesk font-black text-white italic uppercase tracking-tighter">
            Constructor <span className="text-cyan-400">Antigravity</span> Quiz 📝
          </h1>
          <p className="text-gray-500 text-[9px] font-bold mt-1 uppercase tracking-widest leading-none">
            {quiz.questions.length} pregunta{quiz.questions.length !== 1 ? 's' : ''} configuradas
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSave}
            disabled={saving || quiz.questions.length === 0 || isLocked}
            className={`px-10 py-5 rounded-2xl text-[11px] font-black hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.2em] shadow-xl flex items-center gap-3 border-none ring-2 ${
              isLocked 
                ? 'bg-gray-800 text-gray-500 ring-gray-700 cursor-not-allowed shadow-none' 
                : 'bg-[#00f2ff] text-black ring-cyan-500/50 shadow-cyan-500/20'
            }`}
          >
            {saving ? '📦 SINCRONIZANDO...' : isLocked ? '🔒 EXAMEN BLOQUEADO' : '💾 GUARDAR EXAMEN FINAL'}
          </button>
          <Link href={`/dashboard/instructor/courses/${courseId}/modules`} className="px-6 py-5 bg-white/5 border border-white/5 rounded-2xl text-white text-[10px] font-black transition-all hover:bg-white/10 uppercase tracking-widest italic">
            Módulos →
          </Link>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm border ${msg.type === 'ok' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          {msg.text}
        </div>
      )}

      {/* Quiz Settings */}
      <div className="bg-[#0d1524] border border-blue-500/20 rounded-2xl p-6 mb-6">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Configuración de la evaluación</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Título</label>
            <input
              value={quiz.title}
              onChange={e => setQuiz({ ...quiz, title: e.target.value })}
              className="w-full bg-[#070d1a] border border-blue-500/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Puntaje total</label>
            <select
              value={quiz.totalScore}
              onChange={e => setQuiz({ ...quiz, totalScore: Number(e.target.value) })}
              className="w-full bg-[#070d1a] border border-blue-500/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              <option value={10}>10 puntos</option>
              <option value={100}>100 puntos</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Puntaje mínimo (%)</label>
            <input
              type="number"
              value={quiz.passingScore}
              onChange={e => setQuiz({ ...quiz, passingScore: Number(e.target.value) })}
              min={1} max={100}
              className="w-full bg-[#070d1a] border border-blue-500/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Distribución</label>
            <select
              value={quiz.scoreDistribution}
              onChange={e => setQuiz({ ...quiz, scoreDistribution: e.target.value as any })}
              className="w-full bg-[#070d1a] border border-blue-500/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="AUTOMATIC">Automática</option>
              <option value="MANUAL">Manual</option>
            </select>
          </div>
        </div>
        {quiz.scoreDistribution === 'AUTOMATIC' && quiz.questions.length > 0 && (
          <button onClick={autoDistribute} className="mt-3 text-xs text-cyan-400 hover:text-cyan-300 transition-colors border border-cyan-500/20 rounded-lg px-3 py-1.5 hover:border-cyan-500/40">
            ⚖️ Auto-distribuir puntos
          </button>
        )}
        {quiz.scoreDistribution === 'MANUAL' && quiz.questions.length > 0 && (
          <div className={`mt-3 text-xs px-3 py-2 rounded-lg border ${sum === quiz.totalScore ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'}`}>
            Suma actual: {sum} / {quiz.totalScore} puntos {sum === quiz.totalScore ? '✓' : '— ajusta los puntos por pregunta'}
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-4 mb-6">
        {quiz.questions.map((q, qIdx) => (
          <div key={qIdx} className="bg-[#0d1524] border border-blue-500/20 rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3 gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-2 py-1">P{qIdx + 1}</span>
                <select
                  value={q.questionType}
                  onChange={e => updateQuestion(qIdx, { questionType: e.target.value as any, correctAnswer: [] })}
                  className="bg-[#070d1a] border border-blue-500/20 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="SINGLE">Opción única</option>
                  <option value="MULTIPLE">Opción múltiple</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                {quiz.scoreDistribution === 'MANUAL' && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Pts:</span>
                    <input
                      type="number"
                      value={q.points}
                      onChange={e => updateQuestion(qIdx, { points: Number(e.target.value) })}
                      className="w-14 bg-[#070d1a] border border-blue-500/20 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-500 text-center"
                    />
                  </div>
                )}
                {quiz.scoreDistribution === 'AUTOMATIC' && (
                  <span className="text-xs text-gray-500">{q.points} pts</span>
                )}
                <button onClick={() => removeQuestion(qIdx)} className="text-red-400/60 hover:text-red-400 text-xs w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 transition-colors">✕</button>
              </div>
            </div>

            <textarea
              value={q.questionText}
              onChange={e => updateQuestion(qIdx, { questionText: e.target.value })}
              placeholder="Escribe la pregunta..."
              rows={2}
              className="w-full bg-[#070d1a] border border-blue-500/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 resize-none placeholder-gray-600 mb-3"
            />

            <div className="space-y-2">
              {q.options.map((opt, oIdx) => (
                <div key={oIdx} className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAnswer(qIdx, oIdx)}
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold border transition-all shrink-0 ${
                      q.correctAnswer.includes(oIdx)
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-[#070d1a] border-blue-500/20 text-gray-500 hover:border-blue-500/40'
                    }`}
                  >
                    {LETTERS[oIdx]}
                  </button>
                  <input
                    value={opt.text}
                    onChange={e => {
                      const newOpts = [...q.options];
                      newOpts[oIdx] = { text: e.target.value };
                      updateQuestion(qIdx, { options: newOpts });
                    }}
                    placeholder={`Opción ${LETTERS[oIdx]}`}
                    className="flex-1 bg-[#070d1a] border border-blue-500/20 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-gray-600"
                  />
                  {q.options.length > 2 && (
                    <button onClick={() => removeOption(qIdx, oIdx)} className="text-red-400/50 hover:text-red-400 text-xs w-6 h-6 flex items-center justify-center transition-colors shrink-0">✕</button>
                  )}
                </div>
              ))}
            </div>

            {q.options.length < 15 && (
              <button onClick={() => addOption(qIdx)} className="mt-2 text-xs text-gray-500 hover:text-cyan-400 transition-colors">
                + Agregar opción ({q.options.length}/15)
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addQuestion}
        className="w-full border-2 border-dashed border-blue-500/20 hover:border-cyan-500/40 rounded-2xl py-4 text-sm text-gray-500 hover:text-cyan-400 transition-all mb-6"
      >
        + Agregar pregunta
      </button>

      {/* Modal de Confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
           <div className="bg-[#0d1524] border border-blue-500/20 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-white mb-2">¡Evaluación Guardada!</h3>
              <p className="text-gray-400 text-sm mb-8">Todos los cambios han sido sincronizados correctamente. ¿Qué deseas hacer ahora?</p>
              <div className="flex flex-col gap-3">
                 <button 
                   onClick={() => setShowConfirm(false)}
                   className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-sm font-bold text-white transition-all transition-colors"
                 >
                   Seguir editando
                 </button>
                 <Link 
                   href={`/dashboard/instructor/courses/${courseId}`}
                   className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all text-center"
                 >
                   Regresar al curso
                 </Link>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
