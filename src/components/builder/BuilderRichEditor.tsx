'use client';

import React, { useRef, useCallback } from 'react';

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
  const editorRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

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
      const url = window.prompt('Introduce la URL de la imagen:');
      if (!url) return;
      document.execCommand(command, false, url);
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
    { label: '🖼️', title: 'Insertar Imagen', cmd: 'insertImage' },
    { label: 'XA', title: 'Limpiar', cmd: 'removeFormat' },
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
      `}</style>
      
      <div
        ref={handleRef}
        contentEditable
        suppressContentEditableWarning
        className="rich-editor-content"
        onInput={handleInput}
        placeholder={placeholder}
      />
    </div>
  );
};

export default BuilderRichEditor;

