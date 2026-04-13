'use client';

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="px-10 py-4 bg-cyan-600 text-white font-bold rounded-2xl shadow-xl hover:bg-cyan-500 transition-all hover:scale-105"
    >
      Imprimir Certificado / Guardar como PDF
    </button>
  );
}
