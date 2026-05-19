'use client';

import React, { useRef, useCallback, useState } from 'react';

const getEmbedHtml = (url: string): string | null => {
  if (!url) return null;
  const cleanUrl = url.trim();

  // YouTube (standard, shorts, custom shares, embeds)
  if (cleanUrl.includes('youtube.com/watch?v=')) {
    const id = cleanUrl.split('youtube.com/watch?v=')[1]?.split('&')[0];
    if (id) return `<iframe src="https://www.youtube.com/embed/${id}" width="100%" height="400" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
  }
  if (cleanUrl.includes('youtu.be/')) {
    const id = cleanUrl.split('youtu.be/')[1]?.split('?')[0];
    if (id) return `<iframe src="https://www.youtube.com/embed/${id}" width="100%" height="400" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
  }
  if (cleanUrl.includes('youtube.com/embed/')) {
    return `<iframe src="${cleanUrl}" width="100%" height="400" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
  }

  // Vimeo
  if (cleanUrl.includes('vimeo.com/') && !cleanUrl.includes('player.vimeo.com')) {
    const id = cleanUrl.split('vimeo.com/')[1]?.split('?')[0];
    if (id) return `<iframe src="https://player.vimeo.com/video/${id}" width="100%" height="400" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
  }
  if (cleanUrl.includes('player.vimeo.com/video/')) {
    return `<iframe src="${cleanUrl}" width="100%" height="400" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
  }

  // Loom
  if (cleanUrl.includes('loom.com/share/')) {
    const id = cleanUrl.split('loom.com/share/')[1]?.split('?')[0];
    if (id) return `<iframe src="https://www.loom.com/embed/${id}" width="100%" height="400" frameborder="0" allowfullscreen></iframe>`;
  }
  if (cleanUrl.includes('loom.com/embed/')) {
    return `<iframe src="${cleanUrl}" width="100%" height="400" frameborder="0" allowfullscreen></iframe>`;
  }

  // Google Drive
  if (cleanUrl.includes('drive.google.com/file/d/')) {
    const id = cleanUrl.split('drive.google.com/file/d/')[1]?.split('/')[0];
    if (id) return `<iframe src="https://drive.google.com/file/d/${id}/preview" width="100%" height="400" frameborder="0" allow="autoplay" allowfullscreen></iframe>`;
  }

  // Si el usuario pega el tag iframe completo, respetarlo
  if (cleanUrl.startsWith('<iframe') && cleanUrl.endsWith('</iframe>')) {
    return cleanUrl;
  }

  // Iframe Genérico (url directa)
  return `<iframe src="${cleanUrl}" width="100%" height="400" frameborder="0" allowfullscreen></iframe>`;
};


interface BuilderRichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const BuilderRichEditor: React.FC<BuilderRichEditorProps> = ({
  value,
  onChange,
  placeholder = 'Escribe el contenido de la lección...',
}) => {
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [embedUrl, setEmbedUrl] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }
  };

  const handleInsertEmbed = () => {
    restoreSelection();
    const embedHtml = getEmbedHtml(embedUrl);
    if (embedHtml) {
      document.execCommand('insertHTML', false, embedHtml);
      handleInput();
    }
    setShowEmbedModal(false);
    editorRef.current?.focus();
  };

  const handleInsertImage = () => {
    restoreSelection();
    if (imageUrl) {
      document.execCommand('insertImage', false, imageUrl);
      handleInput();
    }
    setShowImageModal(false);
    editorRef.current?.focus();
  };

  const handleRef = useCallback((node: HTMLDivElement | null) => {
    if (node && node.innerHTML !== value) {
      node.innerHTML = value || '';
    }
    (editorRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCmd = (e: React.MouseEvent | React.ChangeEvent<HTMLSelectElement> | React.ChangeEvent<HTMLInputElement>, command: string, val?: string) => {
    if ('preventDefault' in e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Activar estilos CSS nativos para generar <span> en lugar de etiquetas obsoletas
    document.execCommand('styleWithCSS', false, 'true');

    if (command === 'insertImage' && !val) {
      saveSelection();
      setImageUrl('');
      setShowImageModal(true);
      return;
    } else if (command === 'insertEmbed') {
      saveSelection();
      setEmbedUrl('');
      setShowEmbedModal(true);
      return;
    } else {
      document.execCommand(command, false, val);
    }

    editorRef.current?.focus();
    handleInput(); // Sincronización explícita
  };

  const handleFontSize = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const size = e.target.value;
    if (!size) return;

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);

      if (!range.collapsed) {
        // Creamos el span con el tamaño exacto
        const span = document.createElement('span');
        span.style.fontSize = size;
        
        // Extraemos el contenido actual (esto preserva Negrita, Color, etc.)
        const extracted = range.extractContents();
        span.appendChild(extracted);
        
        // Insertamos el nuevo span en la posición de la selección
        range.insertNode(span);
        
        // Limpiamos la selección para que el usuario vea el resultado
        selection.removeAllRanges();
      }
    }

    editorRef.current?.focus();
    handleInput(); // Sincronización explícita con React
  };

  const buttons = [
    { label: 'B', title: 'Negrita', cmd: 'bold' },
    { label: 'I', title: 'Cursiva', cmd: 'italic' },
    { label: 'U', title: 'Subrayado', cmd: 'underline' },
    { label: '•≡', title: 'Viñetas', cmd: 'insertUnorderedList' },
    { label: '1≡', title: 'Numeración', cmd: 'insertOrderedList' },
    { label: '→|', title: 'Indentar', cmd: 'indent' },
    { label: '|←', title: 'Desindentar', cmd: 'outdent' },
    { label: '🖼️', title: 'Insertar Imagen', cmd: 'insertImage', val: '' },
    { label: '🔗', title: 'Insertar recurso (YouTube, Vimeo, Loom, Google Drive, iframe...)', cmd: 'insertEmbed', val: '' },
    { label: 'XA', title: 'Limpiar', cmd: 'removeFormat', val: '' },
  ];

  const fontSizes = [
    { label: '8px', value: '8px' },
    { label: '10px', value: '10px' },
    { label: '12px', value: '12px' },
    { label: '14px', value: '14px' },
    { label: '16px', value: '16px' },
    { label: '18px', value: '18px' },
    { label: '20px', value: '20px' },
    { label: '24px', value: '24px' },
    { label: '30px', value: '30px' },
  ];

  return (
    <>
      <div className="rich-editor-wrapper" style={{ border: '1px solid #334155', borderRadius: 12, overflow: 'hidden', background: '#0f172a' }}>
        <div style={{ display: 'flex', gap: 6, padding: '8px 12px', background: '#1e293b', flexWrap: 'wrap', borderBottom: '1px solid #334155', alignItems: 'center' }}>
          {/* Color Picker */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <button
              title="Color de texto"
              onMouseDown={(e) => { e.preventDefault(); colorInputRef.current?.click(); }}
              style={{
                padding: '4px 8px', borderRadius: 4, border: '1px solid #475569',
                background: '#0f172a', color: '#e2e8f0', cursor: 'pointer', fontSize: 13,
                display: 'flex', alignItems: 'center', gap: 4
              }}
            >
              <span style={{ borderBottom: '2px solid #22d3ee' }}>A</span>
            </button>
            <input
              ref={colorInputRef}
              type="color"
              onChange={(e) => execCmd(e, 'foreColor', e.target.value)}
              style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
            />
          </div>

          {/* Font Size Selector */}
          <select
            onChange={handleFontSize}
            onMouseDown={(e) => e.stopPropagation()} // Permitimos la apertura nativa pero evitamos propagación
            style={{
              padding: '4px 8px', borderRadius: 4, border: '1px solid #475569',
              background: '#0f172a', color: '#e2e8f0', cursor: 'pointer', fontSize: 12,
              outline: 'none'
            }}
            defaultValue="16px"
          >
            {fontSizes.map(f => (
              <option key={f.value} value={f.value} style={{ background: '#0f172a' }}>{f.label}</option>
            ))}
          </select>

          <div style={{ width: 1, height: 20, background: '#334155', margin: '0 4px' }} />

          {buttons.map(({ label, title, cmd, val }) => (
            <button
              key={label}
              title={title}
              onMouseDown={(e) => execCmd(e, cmd, val)}
              style={{
                padding: '4px 10px', borderRadius: 4, border: '1px solid #475569',
                background: '#0f172a', color: '#e2e8f0', cursor: 'pointer',
                fontWeight: label === 'B' ? 'bold' : 'normal',
                fontSize: 13
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <style jsx global>{`
          .rich-editor-content { outline: none; min-height: 280px; padding: 24px; color: #e2e8f0; background: #0f172a; line-height: 1.8; font-family: inherit; }
          .rich-editor-content h2 { font-size: 1.5rem !important; font-weight: bold !important; margin: 16px 0 8px; display: block; color: #fff; }
          .rich-editor-content h3 { font-size: 1.25rem !important; font-weight: bold !important; margin: 14px 0 6px; display: block; color: #fff; }
          .rich-editor-content ul, .rich-editor-content ol { padding-left: 30px !important; margin: 12px 0; display: block !important; }
          .rich-editor-content ul { list-style-type: disc; }
          .rich-editor-content ol { list-style-type: decimal; }
          .rich-editor-content li { display: list-item !important; margin-bottom: 6px; }
          .rich-editor-content img { max-width: 100%; height: auto; border-radius: 12px; margin: 16px 0; border: 1px solid #334155; }
          .rich-editor-content blockquote { border-left: 4px solid #3b82f6; padding-left: 16px; margin: 16px 0; font-style: italic; color: #94a3b8; }
          .rich-editor-content iframe { max-width: 100%; aspect-ratio: 16 / 9; border-radius: 12px; margin: 16px 0; border: 1px solid #334155; }
        `}</style>
        
        <div
          ref={handleRef}
          contentEditable
          suppressContentEditableWarning
          className="rich-editor-content"
          onInput={handleInput}
          data-placeholder={placeholder}
        />
      </div>

      {showImageModal && (
        <div className="fixed inset-0 bg-[#070d1a]/95 backdrop-blur-xl z-[999] flex items-center justify-center p-6 animate-fade-in font-poppins">
          <div className="bg-[#0d1524] border border-cyan-500/20 w-full max-w-lg rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 animate-pulse"></div>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-space-grotesk font-black text-white uppercase tracking-tight">Insertar <span className="text-cyan-400">Imagen</span></h3>
                <p className="text-[9px] text-gray-500 mt-1 uppercase tracking-[0.2em] font-bold">Carga una imagen mediante su dirección URL</p>
              </div>
              <button 
                onClick={() => { setShowImageModal(false); restoreSelection(); editorRef.current?.focus(); }}
                className="text-2xl text-gray-500 hover:text-white transition-colors leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Dirección URL de la Imagen</label>
                <input 
                  type="text" 
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleInsertImage();
                    }
                  }}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="w-full bg-[#152035] border border-cyan-500/10 rounded-2xl px-5 py-3.5 text-sm text-white focus:border-cyan-400 outline-none transition-all"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => { setShowImageModal(false); restoreSelection(); editorRef.current?.focus(); }}
                className="flex-1 py-3.5 border border-blue-500/20 text-gray-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handleInsertImage}
                className="flex-[2] py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] hover:shadow-2xl hover:shadow-cyan-500/30 transition-all"
              >
                Insertar
              </button>
            </div>
          </div>
        </div>
      )}

      {showEmbedModal && (
        <div className="fixed inset-0 bg-[#070d1a]/95 backdrop-blur-xl z-[999] flex items-center justify-center p-6 animate-fade-in font-poppins">
          <div className="bg-[#0d1524] border border-cyan-500/20 w-full max-w-lg rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 animate-pulse"></div>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-space-grotesk font-black text-white uppercase tracking-tight">Insertar <span className="text-cyan-400">Recurso</span></h3>
                <p className="text-[9px] text-gray-500 mt-1 uppercase tracking-[0.2em] font-bold">YouTube, Vimeo, Loom, Google Drive o iframe</p>
              </div>
              <button 
                onClick={() => { setShowEmbedModal(false); restoreSelection(); editorRef.current?.focus(); }}
                className="text-2xl text-gray-500 hover:text-white transition-colors leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Enlace o Código Iframe</label>
                <input 
                  type="text" 
                  value={embedUrl}
                  onChange={e => setEmbedUrl(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleInsertEmbed();
                    }
                  }}
                  placeholder="Pega la URL o el código <iframe> aquí..."
                  className="w-full bg-[#152035] border border-cyan-500/10 rounded-2xl px-5 py-3.5 text-sm text-white focus:border-cyan-400 outline-none transition-all"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => { setShowEmbedModal(false); restoreSelection(); editorRef.current?.focus(); }}
                className="flex-1 py-3.5 border border-blue-500/20 text-gray-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handleInsertEmbed}
                className="flex-[2] py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] hover:shadow-2xl hover:shadow-cyan-500/30 transition-all"
              >
                Insertar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BuilderRichEditor;

