'use client';

import { useState } from 'react';

interface PasswordChangeModalProps {
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export default function PasswordChangeModal({ onClose, onSuccess }: PasswordChangeModalProps) {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Lógica de Estado de Visibilidad (Réplica de Login)
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMatching = form.newPassword === form.confirmPassword && form.newPassword !== '';
  const isValidLength = form.newPassword.length >= 8;
  const canSubmit = isMatching && isValidLength && form.currentPassword !== '' && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudo cambiar la contraseña');
      }

      onSuccess('✓ Contraseña actualizada correctamente');
      setTimeout(onClose, 2000);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
      {/* BACKDROP */}
      <div 
        className="absolute inset-0 bg-[#070d1a]/80 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      ></div>

      {/* MODAL CONTAINER */}
      <div className="relative w-full max-w-md bg-[#0d1524] border border-blue-500/20 rounded-[40px] p-10 shadow-2xl animate-scale-in">
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-8 text-gray-500 hover:text-white transition-colors"
          type="button"
        >
          ✕
        </button>

        <div className="space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <h2 className="text-2xl font-space-grotesk font-bold text-white italic uppercase tracking-tighter">Cambiar <span className="text-cyan-400">Contraseña</span></h2>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest italic">Mantén tu cuenta protegida.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* CURRENT PASSWORD (Mirror Login Structure) */}
            <div className="space-y-2 text-sm">
              <label className="block font-bold text-gray-500 uppercase tracking-widest text-[10px]">Contraseña Actual</label>
              <div className="relative">
                <input 
                  type={showCurrent ? "text" : "password"}
                  value={form.currentPassword}
                  onChange={e => setForm({ ...form, currentPassword: e.target.value })}
                  className="block w-full px-4 pr-11 py-3 bg-[#152035] border border-blue-500/10 rounded-xl focus:outline-none focus:border-blue-500 text-white transition-all placeholder:text-gray-600"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors"
                >
                  {showCurrent ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* NEW PASSWORD (Mirror Login Structure) */}
            <div className="space-y-2 text-sm">
              <label className="block font-bold text-gray-500 uppercase tracking-widest text-[10px]">Nueva Contraseña</label>
              <div className="relative">
                <input 
                  type={showNew ? "text" : "password"}
                  value={form.newPassword}
                  onChange={e => setForm({ ...form, newPassword: e.target.value })}
                  className={`block w-full px-4 pr-11 py-3 bg-[#152035] border ${form.newPassword.length > 0 && !isValidLength ? 'border-red-500' : 'border-blue-500/10'} rounded-xl focus:outline-none focus:border-blue-500 text-white transition-all placeholder:text-gray-600`}
                  placeholder="Mín. 8 caracteres"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors"
                >
                  {showNew ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD (Mirror Login Structure) */}
            <div className="space-y-2 text-sm">
              <label className="block font-bold text-gray-500 uppercase tracking-widest text-[10px]">Confirmar Nueva Contraseña</label>
              <div className="relative">
                <input 
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  className={`block w-full px-4 pr-11 py-3 bg-[#152035] border ${form.confirmPassword.length > 0 && !isMatching ? 'border-red-500' : 'border-blue-500/10'} rounded-xl focus:outline-none focus:border-blue-500 text-white transition-all placeholder:text-gray-600`}
                  placeholder="Repite tu contraseña"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors"
                >
                  {showConfirm ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* VALIDATION FEEDBACK */}
            <div className="space-y-2 min-h-[40px]">
              {form.newPassword.length > 0 && !isValidLength && (
                <p className="text-[10px] font-medium text-red-500 italic">La contraseña debe tener al menos 8 caracteres.</p>
              )}
              {form.confirmPassword.length > 0 && !isMatching && (
                <p className="text-[10px] font-medium text-red-500 italic">Las contraseñas no coinciden.</p>
              )}
              {error && (
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center">{error}</p>
              )}
            </div>

            <button 
              type="submit"
              disabled={!canSubmit}
              className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center ${
                canSubmit 
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:scale-[1.02] shadow-blue-500/20' 
                  : 'bg-white/5 text-gray-600 cursor-not-allowed'
              }`}
            >
              {loading ? 'Sincronizando...' : 'Actualizar Blindaje →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
