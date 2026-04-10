'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = searchParams.get('courseId');

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [error, setError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (!courseId) {
      router.push('/');
      return;
    }

    fetch(`/api/instructor/courses/${courseId}`) 
      .then(res => res.json())
      .then(data => {
        setCourse(data);
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudo cargar la información del curso');
        setLoading(false);
      });
  }, [courseId, router]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setError('');
    
    try {
      if (couponCode.toUpperCase() === 'PROMO20' && courseId) {
        setAppliedCoupon({ code: 'PROMO20', discountPercent: 20 });
      } else {
        setError('Cupón no válido o no aplicable a este curso');
      }
    } catch (err) {
      setError('Error al validar el cupón');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          couponCode: appliedCoupon?.code || null,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar checkout');
      }
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message);
      setCheckoutLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#070d1a] flex items-center justify-center text-white">
      <div className="animate-pulse">Cargando resumen de compra...</div>
    </div>
  );

  if (!course) return (
    <div className="min-h-screen bg-[#070d1a] flex items-center justify-center text-white p-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Error al cargar el curso</h1>
        <Link href="/" className="text-cyan-400">Volver al catálogo</Link>
      </div>
    </div>
  );

  const originalPrice = Number(course.price);
  const discount = appliedCoupon ? (originalPrice * appliedCoupon.discountPercent) / 100 : 0;
  const finalPrice = originalPrice - discount;

  return (
    <div className="min-h-screen bg-[#070d1a] text-white py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href={`/courses/${course.slug}`} className="text-gray-400 hover:text-cyan-400 text-sm transition-colors flex items-center gap-2 mb-4">
          ← Volver al curso
        </Link>
        <h1 className="text-3xl font-space-grotesk font-bold mb-10 text-center">Resumen de tu <span className="text-cyan-400">compra</span></h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#152035] border border-blue-500/20 rounded-2xl p-6 flex gap-6 items-start">
              <div className="w-32 aspect-video bg-blue-900/50 rounded-xl overflow-hidden flex-shrink-0">
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">📚</div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">{course.title}</h3>
                <p className="text-sm text-gray-400 mb-2">Por {course.instructor.name} {course.instructor.lastName}</p>
                <div className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">{course.category}</div>
              </div>
            </div>

            <div className="bg-[#152035] border border-blue-500/20 rounded-2xl p-6">
              <h4 className="text-sm font-bold text-gray-300 mb-4">¿Tienes un cupón de descuento?</h4>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Código de cupón"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 bg-[#0d1524] border border-blue-500/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 uppercase"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={couponLoading}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                >
                  {couponLoading ? '...' : 'Aplicar'}
                </button>
              </div>
              {appliedCoupon && (
                <div className="mt-4 flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-sm text-green-400">
                   <div className="flex items-center gap-2">
                     <span>✅ Cupón {appliedCoupon.code} aplicado</span>
                     <span className="font-bold text-xs">(-{appliedCoupon.discountPercent}%)</span>
                   </div>
                   <button onClick={() => setAppliedCoupon(null)} className="text-gray-400 hover:text-white">Eliminar</button>
                </div>
              )}
              {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-[#152035] border border-blue-500/30 rounded-2xl p-6 sticky top-24 shadow-2xl">
              <h3 className="text-lg font-bold mb-6 border-b border-blue-500/10 pb-4">Detalle del pago</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Precio base</span>
                  <span>${originalPrice.toFixed(2)} MXN</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-400 italic">
                    <span>Descuento cupón</span>
                    <span>-${discount.toFixed(2)} MXN</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-4 border-t border-blue-500/10">
                  <span>Total</span>
                  <span className="text-cyan-400">${finalPrice.toFixed(2)} MXN</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {checkoutLoading ? 'Procesando...' : 'Pagar con Stripe →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#070d1a] flex items-center justify-center text-white font-black uppercase tracking-[0.3em] text-[10px]">
        Iniciando Checkout...
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}