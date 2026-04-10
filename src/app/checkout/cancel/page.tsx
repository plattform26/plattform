import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-[#070d1a] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#152035] border border-blue-500/20 rounded-3xl p-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
         <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center text-5xl mx-auto mb-6">⚠️</div>
         <h1 className="text-3xl font-space-grotesk font-bold mb-4">Pago cancelado</h1>
         <p className="text-gray-400 mb-8 leading-relaxed">
           No se ha realizado ningún cobro en tu tarjeta. Puedes intentar el pago nuevamente cuando estés listo.
         </p>
         
         <div className="space-y-4">
            <Link
              href="/"
              className="block w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl font-bold hover:scale-105 transition-transform"
            >
              Volver al catálogo →
            </Link>
         </div>
      </div>
    </div>
  );
}
