'use client';

import { exportToCSV } from '@/lib/export-utils';

interface ExportEarningsButtonProps {
  data: any[];
}

export default function ExportEarningsButton({ data }: ExportEarningsButtonProps) {
  const handleExport = () => {
    // Preparar datos para el CSV con los nombres de columna solicitados por el usuario
    const exportData = data.map(t => ({
      'Fecha': t.createdAt.toLocaleDateString('es-MX'),
      'Alumno': `${t.user.name} ${t.user.lastName}`,
      'Curso': t.course?.title || 'N/A',
      'Precio Original': t.gross,
      '% Comisión Plataforma': t.platformCommRate || 15,
      'Comisión Retenida (Plattform)': t.platformFee.toFixed(2),
      'Fee Stripe (MX)': t.stripeFee.toFixed(2),
      'Neto a Recibir (Instructor)': t.net.toFixed(2)
    }));

    const fileName = `reporte-ingresos-${new Date().getTime()}`;
    exportToCSV(exportData, fileName);
  };

  return (
    <button 
      onClick={handleExport}
      className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-white/10 hover:text-white transition-all"
    >
      Descargar Reporte (CSV) ↓
    </button>
  );
}
