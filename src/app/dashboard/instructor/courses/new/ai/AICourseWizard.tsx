'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AICourseWizard({ isScale, charLimit }: { isScale: boolean; charLimit: number }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState('');

  const MAX_FILES = 5;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const arr = Array.from(e.target.files);
      if (arr.length + files.length > MAX_FILES) {
        setError('Máximo 5 documentos permitidos.');
        return;
      }
      setFiles([...files, ...arr]);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Por favor describe tu curso.');
      return;
    }
    setError('');
    
    try {
      setLoadingMsg('Procesando documentos y generando curso con IA de alto nivel... 🤖✨');
      
      const formData = new FormData();
      formData.append('promptText', prompt);
      files.forEach(f => formData.append('files', f));

      const resAi = await fetch('/api/ai/generate-course', {
        method: 'POST',
        body: formData // No Content-Type header needed for FormData
      });
      
      const dataAi = await resAi.json();
      
      if (!resAi.ok) {
        throw new Error(dataAi.error || 'Error en el motor de autoría inteligente');
      }

      router.push(`/dashboard/instructor/courses/${dataAi.courseId}`);
      
    } catch (err: any) {
      setError(err.message);
      setLoadingMsg('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <Link href="/dashboard/instructor/courses/new" className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2 mb-6">
        ← Volver al selector manual/IA
      </Link>
      
      <div className="bg-gradient-to-br from-[#101a2d] to-[#0a1f44] p-8 rounded-3xl border border-cyan-500/30">
        <h1 className="text-3xl font-space-grotesk font-bold mb-4">Generador de Cursos IA ✨</h1>
        <p className="text-gray-400 mb-8">Nivel Scale: Describe tu idea o sube manuales. La IA generará módulos, lecciones profesionales y examen final.</p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm">
            ❌ {error}
          </div>
        )}

        {loadingMsg ? (
          <div className="py-20 text-center animate-pulse">
            <div className="text-6xl mb-6">🤖</div>
            <h2 className="text-xl font-bold text-cyan-400 mb-2">{loadingMsg}</h2>
            <p className="text-gray-400 text-sm italic">Estamos analizando tu conocimiento para crear algo profesional...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Describe la temática o instrucciones para la IA</label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                maxLength={charLimit}
                rows={5}
                placeholder="Ejemplo: Crea un curso completo de Java avanzado basado en los manuales que adjunto."
                className="w-full bg-[#070d1a] border border-cyan-500/30 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-400 resize-y"
              />
              <div className="text-right text-xs text-gray-500 mt-2">{prompt.length} / {charLimit} caracteres</div>
            </div>

            {isScale && (
              <div className="p-6 border-2 border-dashed border-cyan-500/30 rounded-xl bg-[#0a1526]">
                <h3 className="font-bold mb-2">Añadir documentos como contexto (Solo Scale)</h3>
                <p className="text-xs text-gray-400 mb-4">Sube hasta 5 archivos (PDF, Word, PPT) para que la IA extraiga el conocimiento real.</p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.pptx"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-cyan-500/10 file:text-cyan-400
                    hover:file:bg-cyan-500/20 cursor-pointer"
                />
                
                {files.length > 0 && (
                  <ul className="mt-4 space-y-2 text-sm text-gray-300">
                    {files.map((f, i) => <li key={i} className="flex items-center gap-2">
                      <span>📄</span>
                      <span className="flex-1 truncate">{f.name} ({(f.size/1024/1024).toFixed(2)} MB)</span>
                      <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-300 text-xs">Quitar</button>
                    </li>)}
                  </ul>
                )}
              </div>
            )}

            {!isScale && (
              <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border border-blue-500/30 p-4 rounded-xl text-xs text-gray-300">
                🚀 <strong className="text-white">Tip:</strong> Si actualizas al plan Scale podrás incluir hasta 5 PDFs, y nosotros entrenaremos al modelo para que genere el curso completo en base a tus manuales y documentos previos.
              </div>
            )}

            <button
              onClick={handleGenerate}
              className="w-full py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]"
            >
              Generar Curso con IA →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
