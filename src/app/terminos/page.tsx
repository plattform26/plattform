import LegalLayout from '@/components/legal/LegalLayout';

export default function TerminosPage() {
  return (
    <LegalLayout 
      title="Términos y Condiciones" 
      lastUpdated="Octubre 2026"
    >
      <div id="content" className="min-h-[500px]">
        {/* El contenido completo será pegado aquí */}
        <p className="text-gray-400 italic">El contenido legal detallado de esta sección será publicado próximamente.</p>
      </div>
    </LegalLayout>
  );
}
