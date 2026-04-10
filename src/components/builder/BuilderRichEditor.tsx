'use client';
import { useRef, useCallback, useEffect } from 'react';

export default function BuilderRichEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const colorRef = useRef<HTMLInputElement>(null);

  const exec = (cmd: string, val?: string) => {
    if (cmd === 'foreColor' && !val) {
      colorRef.current?.click();
      return;
    }
    document.execCommand(cmd, false, val);
    ref.current?.focus();
    emitChange();
  };

  const emitChange = useCallback(() => {
    if (ref.current) onChange(ref.current.innerHTML);
  }, [onChange]);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || '';
    }
  }, []);

  return (
    <div className="border border-[#30363d] rounded-2xl overflow-hidden bg-[#0d1117] shadow-2xl">
      <div className="flex flex-wrap items-center gap-1 p-3 border-b border-[#30363d] bg-[#161b22]">
        {[
          { label: 'B', cmd: 'bold', title: 'Negrita', cls: 'font-black' },
          { label: 'I', cmd: 'italic', title: 'Cursiva', cls: 'italic' },
          { label: 'U', cmd: 'underline', title: 'Subrayado', cls: 'underline' },
        ].map(b => (
          <button key={b.cmd} title={b.title} onMouseDown={e => { e.preventDefault(); exec(b.cmd); }}
            className={`w-8 h-8 rounded-lg text-xs text-white hover:bg-white/10 transition-colors ${b.cls}`}
          >{b.label}</button>
        ))}
        <div className="w-px h-6 bg-[#30363d] mx-2" />
        <button title="Título H2" onMouseDown={e => { e.preventDefault(); exec('formatBlock', 'h2'); }}
          className="px-3 h-8 rounded-lg text-[10px] text-white hover:bg-white/10 transition-colors font-black">H2</button>
        <button title="Título H3" onMouseDown={e => { e.preventDefault(); exec('formatBlock', 'h3'); }}
          className="px-3 h-8 rounded-lg text-[10px] text-white hover:bg-white/10 transition-colors font-black">H3</button>
        <div className="w-px h-6 bg-[#30363d] mx-2" />
        <button title="Lista" onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList'); }} className="w-8 h-8 rounded-lg text-xs hover:bg-white/10">•≡</button>
        <div className="relative" title="Color">
          <button onMouseDown={e => { e.preventDefault(); exec('foreColor'); }} className="w-8 h-8 rounded-lg text-xs hover:bg-white/10 flex items-center justify-center">
            <span className="border-b-2 border-cyan-400">A</span>
          </button>
          <input ref={colorRef} type="color" className="absolute opacity-0 w-0 h-0" onInput={e => exec('foreColor', (e.target as HTMLInputElement).value)} />
        </div>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        className="min-h-[300px] p-8 text-[15px] text-[#e6edf3] focus:outline-none leading-relaxed prose prose-invert max-w-none"
      />
      <style jsx global>{`
        [contenteditable] h2 { color: #06B6D4; font-size: 1.5rem; font-weight: 800; margin-top: 2rem; margin-bottom: 1rem; }
        [contenteditable] h3 { color: #3B82F6; font-size: 1.2rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.75rem; }
        [contenteditable] b { color: #06B6D4; }
        [contenteditable] ul { list-style-type: disc; margin-left: 1.5rem; }
      `}</style>
    </div>
  );
}
