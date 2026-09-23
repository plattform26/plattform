import LegalLayout from '@/components/legal/LegalLayout';
import Link from 'next/link';

export default function ReembolsosPage() {
  const sections = [
    { id: '1-alcance', title: '1. Alcance' },
    { id: '2-reembolsos-estudiantes', title: '2. Reembolsos para estudiantes' },
    { id: '3-reembolsos-instructores', title: '3. Reembolsos para instructores' },
    { id: '4-procedimiento', title: '4. Procedimiento de solicitud' },
    { id: '5-efectos', title: '5. Efectos del reembolso' },
    { id: '6-decision-plattform', title: '6. Decisión de Plattform' },
    { id: '7-comisiones', title: '7. Comisiones no reembolsables' },
    { id: '8-derechos', title: '8. Derechos del consumidor' },
    { id: '9-contacto', title: '9. Contacto' },
  ];

  return (
    <LegalLayout 
      title="Política de Reembolsos" 
      lastUpdated="23 de septiembre de 2026"
      sections={sections}
    >
      <div className="space-y-8">
        <section id="1-alcance" className="scroll-mt-32">
          <h2>1. Alcance</h2>
          <p>
            La presente Política de Reembolsos forma parte integrante de los <Link href="/terminos" className="text-cyan-400 hover:underline">Términos y Condiciones</Link> de Plattform y regula las condiciones bajo las cuales procede la devolución de montos pagados por cursos y suscripciones.
          </p>
        </section>

        <section id="2-reembolsos-estudiantes" className="scroll-mt-32">
          <h2>2. Reembolsos de cursos para estudiantes</h2>
          
          <h3>2.1 Supuestos en que procede el reembolso</h3>
          <p>Plattform evaluará solicitudes de reembolso en los siguientes casos:</p>
          
          <div className="bg-emerald-900/10 border border-emerald-500/20 p-6 rounded-2xl space-y-4 my-6">
            <div>
              <p className="font-bold text-emerald-400 mb-1">a) Falla técnica no resuelta</p>
              <p className="text-gray-300 text-sm m-0">Cuando el estudiante no haya podido acceder al contenido adquirido por causas técnicas atribuibles a la Plataforma, y dicha falla no haya sido subsanada dentro de los cinco (5) días hábiles siguientes al reporte.</p>
            </div>
            <div>
              <p className="font-bold text-emerald-400 mb-1">b) Contenido sustancialmente distinto al ofrecido</p>
              <p className="text-gray-300 text-sm m-0">Cuando el contenido del curso difiera de manera sustancial de lo descrito en su ficha pública al momento de la compra.</p>
            </div>
            <div>
              <p className="font-bold text-emerald-400 mb-1">c) Cobro duplicado o erróneo</p>
              <p className="text-gray-300 text-sm m-0">Cuando se haya generado un cargo duplicado o un cobro por un monto distinto al precio publicado.</p>
            </div>
            <div>
              <p className="font-bold text-emerald-400 mb-1">d) Compra no autorizada</p>
              <p className="text-gray-300 text-sm m-0">Cuando la transacción se haya realizado sin el consentimiento del titular de la tarjeta, previa acreditación correspondiente.</p>
            </div>
          </div>

          <h3>2.2 Plazo para solicitar el reembolso</h3>
          <p>
            La solicitud debe presentarse dentro de los <strong>siete (7) días naturales</strong> siguientes a la fecha de compra, salvo en el supuesto de compra no autorizada, donde el plazo será de treinta (30) días naturales.
          </p>

          <h3>2.3 Supuestos en que NO procede el reembolso</h3>
          <p>No procederá la devolución cuando:</p>
          <ul className="list-disc pl-6 space-y-2 marker:text-rose-500 bg-rose-900/10 border border-rose-500/20 p-6 rounded-2xl text-gray-300">
            <li>El estudiante haya completado más del <strong>25% del contenido</strong> del curso</li>
            <li>El estudiante haya obtenido el certificado de terminación</li>
            <li>Haya transcurrido el plazo señalado en la sección 2.2</li>
            <li>La solicitud se funde exclusivamente en un cambio de opinión, disponibilidad de tiempo o expectativas subjetivas no relacionadas con la descripción publicada del curso</li>
            <li>Se detecte uso indebido del contenido, descarga no autorizada o intento de distribución</li>
            <li>El acceso al curso haya sido otorgado de forma gratuita o mediante inscripción manual sin costo</li>
          </ul>
        </section>

        <section id="3-reembolsos-instructores" className="scroll-mt-32">
          <h2>3. Reembolsos de suscripciones para instructores</h2>
          
          <h3>3.1 Primer periodo de suscripción</h3>
          <p>
            Los instructores que contraten por primera vez un plan de suscripción podrán solicitar el reembolso íntegro dentro de los <strong>siete (7) días naturales</strong> siguientes a la contratación, siempre que:
          </p>
          <ul className="list-disc pl-6 space-y-2 marker:text-cyan-500">
            <li>No hayan publicado ningún curso</li>
            <li>No hayan recibido ninguna inscripción de estudiantes</li>
          </ul>

          <h3>3.2 Renovaciones</h3>
          <p>
            Las renovaciones automáticas <strong>no son reembolsables</strong>. El instructor puede cancelar la renovación automática en cualquier momento desde su panel de control, surtiendo efecto al término del periodo vigente.
          </p>

          <h3>3.3 Cambio de plan</h3>
          <p>
            Los cambios de plan durante un periodo vigente no generan reembolso proporcional. El nuevo plan y su tarifa aplicarán a partir del siguiente ciclo de facturación.
          </p>
        </section>

        <section id="4-procedimiento" className="scroll-mt-32">
          <h2>4. Procedimiento para solicitar un reembolso</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            
            <div className="bg-[#0d1524] border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/0 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-900/30 border border-cyan-500/30 text-cyan-400 font-bold shrink-0 font-space-grotesk text-lg">
                  1
                </div>
                <div>
                  <h3 className="text-white mt-0 mb-2 font-bold text-lg">Enviar la solicitud</h3>
                  <p className="text-sm text-gray-400 m-0 leading-relaxed">
                    Escriba a <a href="mailto:soporte@plattform.mx" className="text-cyan-400 hover:underline">soporte@plattform.mx</a> con el asunto <strong>"Solicitud de reembolso"</strong>, incluyendo: nombre completo, correo de la cuenta, curso o plan, fecha de la compra, motivo detallado y evidencia de respaldo.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#0d1524] border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/0 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-900/30 border border-cyan-500/30 text-cyan-400 font-bold shrink-0 font-space-grotesk text-lg">
                  2
                </div>
                <div>
                  <h3 className="text-white mt-0 mb-2 font-bold text-lg">Evaluación</h3>
                  <p className="text-sm text-gray-400 m-0 leading-relaxed">
                    Plattform revisará la solicitud y podrá requerir información adicional. La evaluación considera el avance registrado, la naturaleza del motivo y el cumplimiento de los plazos establecidos.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#0d1524] border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/0 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-900/30 border border-cyan-500/30 text-cyan-400 font-bold shrink-0 font-space-grotesk text-lg">
                  3
                </div>
                <div>
                  <h3 className="text-white mt-0 mb-2 font-bold text-lg">Respuesta</h3>
                  <p className="text-sm text-gray-400 m-0 leading-relaxed">
                    Plattform emitirá una respuesta dentro de los <strong>diez (10) días hábiles</strong> siguientes a la recepción de la solicitud completa.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#0d1524] border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/0 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-900/30 border border-cyan-500/30 text-cyan-400 font-bold shrink-0 font-space-grotesk text-lg">
                  4
                </div>
                <div>
                  <h3 className="text-white mt-0 mb-2 font-bold text-lg">Ejecución</h3>
                  <p className="text-sm text-gray-400 m-0 leading-relaxed">
                    En caso procedente, el reembolso se procesará a través de Stripe al método original. El reflejo depende del banco, generalmente entre <strong>5 y 15 días hábiles</strong>.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        <section id="5-efectos" className="scroll-mt-32">
          <h2>5. Efectos del reembolso</h2>
          <p>Al procesarse un reembolso:</p>
          <ul className="list-disc pl-6 space-y-2 marker:text-cyan-500">
            <li>Se revoca de forma inmediata el acceso al curso o a las funcionalidades del plan</li>
            <li>Se cancelan los certificados que hubieran sido emitidos respecto de dicho curso</li>
            <li>Se ajusta la liquidación correspondiente al instructor, descontando el monto reembolsado de su siguiente liquidación</li>
          </ul>
        </section>

        <section id="6-decision-plattform" className="scroll-mt-32">
          <h2>6. Reembolsos por decisión de Plattform</h2>
          <p>Plattform podrá emitir reembolsos de forma unilateral, sin solicitud previa del Usuario, cuando:</p>
          <ul className="list-disc pl-6 space-y-2 marker:text-cyan-500">
            <li>Se retire un curso de la Plataforma por infracción grave de los Términos y Condiciones por parte del instructor</li>
            <li>Se detecte un error sistémico en el cobro</li>
            <li>Lo determine una autoridad competente</li>
          </ul>
        </section>

        <section id="7-comisiones" className="scroll-mt-32">
          <h2>7. Comisiones no reembolsables</h2>
          <p>
            Las comisiones cobradas por el procesador de pagos (Stripe) por la transacción original no son recuperables por Plattform y, en consecuencia, tampoco son reembolsables al instructor en las operaciones que resulten en devolución al estudiante.
          </p>
        </section>

        <section id="8-derechos" className="scroll-mt-32">
          <h2>8. Derechos del consumidor</h2>
          <p>
            Nada en esta Política limita o excluye los derechos que la <strong>Ley Federal de Protección al Consumidor</strong> otorga a los consumidores en México.
          </p>
          <p>
            En caso de inconformidad con la resolución de una solicitud de reembolso, el Usuario podrá acudir ante la <strong>Procuraduría Federal del Consumidor (PROFECO)</strong>.
          </p>
          <p>
            <strong>Teléfono del Consumidor:</strong> 55 5568 8722 (Ciudad de México)<br/>
            <strong>Sitio web:</strong> <a href="https://www.profeco.gob.mx" target="_blank" rel="noopener noreferrer">www.profeco.gob.mx</a>
          </p>
        </section>

        <section id="9-contacto" className="scroll-mt-32 pb-12 border-b border-white/5">
          <h2>9. Contacto</h2>
          <p>
            <strong>Solicitudes de reembolso y facturación:</strong> <a href="mailto:soporte@plattform.mx">soporte@plattform.mx</a>
          </p>
        </section>

        <div className="pt-8 text-sm text-gray-500 font-bold">
          <p className="text-white mb-1 text-base">Plattform</p>
          <p>Diego Castellanos Maya</p>
          <p>Ciudad de México, México</p>
        </div>
      </div>
    </LegalLayout>
  );
}
