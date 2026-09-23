import LegalLayout from '@/components/legal/LegalLayout';
import Link from 'next/link';

export default function TerminosPage() {
  const sections = [
    { id: '1-aceptacion', title: '1. Aceptación de los términos' },
    { id: '2-descripcion', title: '2. Descripción del servicio' },
    { id: '3-registro', title: '3. Registro y cuenta de usuario' },
    { id: '4-estudiantes', title: '4. Términos para estudiantes' },
    { id: '5-instructores', title: '5. Términos para instructores' },
    { id: '6-precios', title: '6. Precios y pagos' },
    { id: '7-reembolsos', title: '7. Política de reembolsos' },
    { id: '8-propiedad', title: '8. Propiedad intelectual' },
    { id: '9-conducta', title: '9. Conducta del usuario' },
    { id: '10-suspension', title: '10. Suspensión y terminación' },
    { id: '11-disponibilidad', title: '11. Disponibilidad del servicio' },
    { id: '12-limitacion', title: '12. Limitación de responsabilidad' },
    { id: '13-modificaciones', title: '13. Modificaciones' },
    { id: '14-legislacion', title: '14. Legislación aplicable' },
    { id: '15-contacto', title: '15. Contacto' },
  ];

  return (
    <LegalLayout 
      title="Términos y Condiciones de Uso" 
      lastUpdated="23 de septiembre de 2026"
      sections={sections}
    >
      <div className="space-y-8">
        <section id="1-aceptacion" className="scroll-mt-32">
          <h2>1. Aceptación de los términos</h2>
          <p>
            Los presentes Términos y Condiciones regulan el acceso y uso de la plataforma educativa <strong>Plattform</strong>, operada por <strong>Diego Castellanos Maya</strong>, persona física con actividad empresarial, con domicilio en Ciudad de México, México (en adelante, <strong>"Plattform"</strong>, <strong>"la Plataforma"</strong> o <strong>"nosotros"</strong>).
          </p>
          <p>
            Al registrarse, acceder o utilizar cualquier funcionalidad de la Plataforma, usted (en adelante, <strong>"el Usuario"</strong>) manifiesta que ha leído, entendido y aceptado íntegramente estos Términos y Condiciones, así como nuestro <Link href="/privacidad" className="text-cyan-400 hover:underline">Aviso de Privacidad</Link>.
          </p>
          <p className="font-bold text-red-400">
            Si no está de acuerdo con alguna disposición de estos Términos, deberá abstenerse de utilizar la Plataforma.
          </p>
        </section>

        <section id="2-descripcion" className="scroll-mt-32">
          <h2>2. Descripción del servicio</h2>
          <p>
            Plattform es una plataforma tecnológica que permite a instructores crear, publicar y comercializar cursos en línea, y a estudiantes adquirir y consumir dicho contenido educativo.
          </p>
          
          <h3>2.1 Naturaleza del servicio</h3>
          <p>Plattform actúa exclusivamente como <strong>intermediario tecnológico</strong> entre instructores y estudiantes. Plattform:</p>
          <ul className="list-disc pl-6 space-y-2 marker:text-cyan-500">
            <li><strong>No es</strong> una institución educativa con reconocimiento de validez oficial de estudios (RVOE)</li>
            <li><strong>No es</strong> autora, productora ni propietaria del contenido publicado por los instructores</li>
            <li><strong>No garantiza</strong> resultados académicos, profesionales o laborales derivados del consumo de los cursos</li>
            <li><strong>No emite</strong> títulos, grados académicos ni certificaciones con validez oficial ante la Secretaría de Educación Pública</li>
          </ul>
          <p>
            Los certificados emitidos por Plattform son <strong>constancias de terminación de formación continua</strong> que acreditan que el estudiante completó y aprobó el contenido del curso correspondiente. No constituyen certificación profesional ni tienen validez oficial ante autoridades educativas.
          </p>
        </section>

        <section id="3-registro" className="scroll-mt-32">
          <h2>3. Registro y cuenta de usuario</h2>
          
          <h3>3.1 Requisitos</h3>
          <p>Para utilizar la Plataforma, el Usuario debe:</p>
          <ul className="list-disc pl-6 space-y-2 marker:text-cyan-500">
            <li>Ser mayor de 18 años, o contar con la autorización expresa de su padre, madre o tutor legal</li>
            <li>Proporcionar información veraz, completa y actualizada</li>
            <li>Verificar su dirección de correo electrónico</li>
            <li>Mantener la confidencialidad de sus credenciales de acceso</li>
          </ul>

          <h3>3.2 Responsabilidad sobre la cuenta</h3>
          <p>
            El Usuario es el único responsable de toda actividad que ocurra bajo su cuenta. Deberá notificar de inmediato a Plattform cualquier uso no autorizado o violación de seguridad enviando un correo a <a href="mailto:soporte@plattform.mx">soporte@plattform.mx</a>.
          </p>

          <h3>3.3 Cuentas inactivas sin compras</h3>
          <p>
            Las cuentas de Usuarios —tanto estudiantes como instructores— que no hayan realizado ninguna compra o contratado ninguna suscripción, y que no registren actividad de inicio de sesión durante un periodo continuo de <strong>tres (3) meses</strong>, serán eliminadas de forma automática y permanente.
          </p>
          <p>
            Plattform enviará un aviso por correo electrónico con al menos <strong>quince (15) días naturales de anticipación</strong> a la fecha de eliminación. El Usuario podrá conservar su cuenta simplemente iniciando sesión antes de la fecha señalada.
          </p>
          <p>Las cuentas con historial de compras no están sujetas a esta política de eliminación automática.</p>

          <h3>3.4 Prohibiciones</h3>
          <p>Queda estrictamente prohibido:</p>
          <ul className="list-disc pl-6 space-y-2 marker:text-cyan-500">
            <li>Compartir credenciales de acceso con terceros</li>
            <li>Crear múltiples cuentas con fines fraudulentos</li>
            <li>Suplantar la identidad de otra persona</li>
            <li>Utilizar información falsa en el registro</li>
          </ul>
        </section>

        <hr className="my-12 border-white/10" />

        <section id="4-estudiantes" className="scroll-mt-32 bg-cyan-900/10 border border-cyan-500/20 p-8 rounded-3xl">
          <h2 className="text-cyan-400 mt-0">4. Términos aplicables a estudiantes</h2>
          
          <h3>4.1 Adquisición de cursos</h3>
          <p>
            Al adquirir un curso, el estudiante obtiene una <strong>licencia personal, intransferible y no exclusiva</strong> para acceder al contenido con fines estrictamente educativos y personales.
          </p>

          <h3>4.2 Acceso al contenido</h3>
          <p>El acceso al curso adquirido será permanente, sujeto a que:</p>
          <ul className="list-disc pl-6 space-y-2 marker:text-cyan-500">
            <li>La cuenta del estudiante permanezca activa</li>
            <li>El curso continúe disponible en la Plataforma</li>
            <li>No se incumplan estos Términos y Condiciones</li>
          </ul>
          <p>
            En caso de que un instructor retire o hiberne un curso, los estudiantes previamente inscritos conservarán su acceso al contenido adquirido.
          </p>

          <h3>4.3 Prohibiciones específicas</h3>
          <p>Queda estrictamente prohibido:</p>
          <ul className="list-disc pl-6 space-y-2 marker:text-cyan-500">
            <li>Descargar, copiar, reproducir o distribuir el contenido de los cursos</li>
            <li>Grabar, capturar o redistribuir videos, textos o materiales del curso</li>
            <li>Compartir acceso a cursos con terceros no autorizados</li>
            <li>Comercializar, revender o sublicenciar el contenido adquirido</li>
            <li>Utilizar el contenido con fines comerciales sin autorización expresa del instructor</li>
          </ul>
          <p>
            El incumplimiento de estas disposiciones dará lugar a la suspensión inmediata de la cuenta sin derecho a reembolso, sin perjuicio de las acciones legales que correspondan.
          </p>

          <h3>4.4 Certificados</h3>
          <p>El estudiante obtendrá un certificado de terminación cuando:</p>
          <ul className="list-disc pl-6 space-y-2 marker:text-cyan-500">
            <li>Complete el 100% de las lecciones del curso</li>
            <li>Apruebe todas las evaluaciones requeridas con el puntaje mínimo establecido por el instructor</li>
          </ul>
          <p>Cada certificado contiene un código único de verificación y es intransferible.</p>
        </section>

        <section id="5-instructores" className="scroll-mt-32 bg-blue-900/10 border border-blue-500/20 p-8 rounded-3xl mt-8">
          <h2 className="text-blue-400 mt-0">5. Términos aplicables a instructores</h2>
          
          <h3>5.1 Planes de suscripción</h3>
          <p>
            Los instructores deben contratar y mantener vigente uno de los planes de suscripción disponibles para publicar y comercializar cursos en la Plataforma. Los planes vigentes, sus características y precios se encuentran publicados en <strong>plattform.mx/planes</strong>.
          </p>
          <p>La suscripción se renueva automáticamente cada periodo, salvo cancelación expresa del instructor.</p>

          <h3>5.2 Comisiones</h3>
          <p>
            Plattform retiene una comisión sobre cada venta de curso, cuyo porcentaje depende del plan contratado. La comisión se descuenta automáticamente del monto bruto de cada transacción antes de la liquidación al instructor.
          </p>
          <p>
            Adicionalmente, el procesador de pagos (Stripe) aplica sus propias comisiones por transacción, las cuales también se descuentan del monto bruto.
          </p>

          <h3>5.3 Liquidación de ingresos</h3>
          <p>
            Los ingresos netos correspondientes al instructor se transfieren directamente a su cuenta bancaria vinculada mediante Stripe, conforme a los plazos de liquidación establecidos por dicho procesador para México.
          </p>
          <p>Plattform no funge como custodio de fondos ni opera un monedero virtual.</p>

          <h3>5.4 Responsabilidad sobre el contenido</h3>
          <p>El instructor declara y garantiza que:</p>
          <ul className="list-disc pl-6 space-y-2 marker:text-blue-500">
            <li>Es titular de los derechos de propiedad intelectual del contenido que publica, o cuenta con las licencias y autorizaciones necesarias</li>
            <li>El contenido no infringe derechos de terceros</li>
            <li>El contenido no incluye material ilegal, difamatorio, discriminatorio, violento, sexualmente explícito o que promueva actividades ilícitas</li>
            <li>La información proporcionada sobre el curso (título, descripción, duración, nivel) es veraz y no induce a error</li>
          </ul>
          <p>
            <strong>El instructor es el único responsable del contenido que publica.</strong> Plattform no revisa previamente el contenido, pero se reserva el derecho de retirarlo cuando exista una denuncia fundada o incumplimiento evidente.
          </p>

          <h3>5.5 Cancelación de suscripción</h3>
          <p>Si el instructor cancela su suscripción o ésta vence sin renovación:</p>
          <ul className="list-disc pl-6 space-y-2 marker:text-blue-500">
            <li>Sus cursos serán hibernados y dejarán de estar disponibles en el catálogo público</li>
            <li>Los estudiantes previamente inscritos <strong>conservarán su acceso</strong> al contenido adquirido</li>
            <li>El instructor conservará acceso a su panel y a la información de sus estudiantes</li>
            <li>Podrá reactivar sus cursos contratando nuevamente un plan</li>
          </ul>

          <h3>5.6 Límites de plan</h3>
          <p>
            Cada plan tiene un límite de estudiantes activos. Al alcanzar dicho límite, no se podrán registrar nuevas inscripciones hasta que el instructor actualice a un plan superior.
          </p>
        </section>

        <hr className="my-12 border-white/10" />

        <section id="6-precios" className="scroll-mt-32">
          <h2>6. Precios y pagos</h2>
          
          <h3>6.1 Precios</h3>
          <p>
            Todos los precios se expresan en <strong>pesos mexicanos (MXN)</strong> e incluyen los impuestos aplicables, salvo que se indique lo contrario.
          </p>
          <p>
            Plattform se reserva el derecho de modificar los precios de los planes de suscripción, notificando a los instructores con al menos treinta (30) días naturales de anticipación.
          </p>
          <p>Los instructores establecen libremente el precio de sus cursos dentro de los rangos permitidos por la Plataforma.</p>

          <h3>6.2 Procesamiento de pagos</h3>
          <p>
            Todos los pagos se procesan a través de <strong>Stripe</strong>. Plattform no almacena datos completos de tarjetas de crédito o débito.
          </p>

          <h3>6.3 Facturación</h3>
          <p>
            Los Usuarios que requieran comprobante fiscal digital (CFDI) deberán solicitarlo dentro del mismo mes calendario de la compra, enviando sus datos fiscales a <a href="mailto:soporte@plattform.mx">soporte@plattform.mx</a>.
          </p>
        </section>

        <section id="7-reembolsos" className="scroll-mt-32">
          <h2>7. Política de reembolsos</h2>
          <p>
            Consulte nuestra <Link href="/reembolsos" className="text-cyan-400 hover:underline font-bold">Política de Reembolsos</Link> disponible en <strong>plattform.mx/reembolsos</strong>, la cual forma parte integrante de estos Términos y Condiciones.
          </p>
        </section>

        <section id="8-propiedad" className="scroll-mt-32">
          <h2>8. Propiedad intelectual</h2>
          
          <h3>8.1 Propiedad de Plattform</h3>
          <p>
            La marca "Plattform", su logotipo, diseño, código fuente, interfaz, estructura y todos los elementos que componen la Plataforma son propiedad exclusiva de Diego Castellanos Maya y están protegidos por la legislación aplicable en materia de propiedad intelectual e industrial.
          </p>

          <h3>8.2 Propiedad del contenido de cursos</h3>
          <p>
            Los instructores conservan la titularidad de los derechos de autor sobre el contenido que publican. Al publicar en Plattform, el instructor otorga a la Plataforma una <strong>licencia no exclusiva, mundial y libre de regalías</strong> para alojar, reproducir, mostrar y distribuir dicho contenido a los estudiantes inscritos, exclusivamente con la finalidad de prestar el servicio.
          </p>
          <p>
            Esta licencia permanece vigente mientras el contenido esté publicado y respecto de los estudiantes que lo hayan adquirido.
          </p>
        </section>

        <section id="9-conducta" className="scroll-mt-32">
          <h2>9. Conducta del usuario</h2>
          <p>Queda prohibido utilizar la Plataforma para:</p>
          <ul className="list-disc pl-6 space-y-2 marker:text-cyan-500">
            <li>Realizar actividades ilegales o fraudulentas</li>
            <li>Vulnerar la seguridad de la Plataforma o intentar acceder sin autorización a cuentas ajenas</li>
            <li>Introducir virus, malware o código malicioso</li>
            <li>Realizar ingeniería inversa, descompilar o desensamblar el software</li>
            <li>Extraer datos de forma automatizada (scraping) sin autorización expresa</li>
            <li>Acosar, difamar o discriminar a otros usuarios</li>
            <li>Enviar comunicaciones comerciales no solicitadas a otros usuarios</li>
          </ul>
        </section>

        <section id="10-suspension" className="scroll-mt-32">
          <h2>10. Suspensión y terminación</h2>
          
          <h3>10.1 Por parte de Plattform</h3>
          <p>Plattform podrá suspender o cancelar una cuenta, sin necesidad de aviso previo y sin derecho a reembolso, cuando:</p>
          <ul className="list-disc pl-6 space-y-2 marker:text-cyan-500">
            <li>Se incumplan estos Términos y Condiciones</li>
            <li>Se detecte actividad fraudulenta o sospechosa</li>
            <li>Se compartan credenciales de acceso</li>
            <li>Se distribuya contenido protegido sin autorización</li>
            <li>Exista una orden de autoridad competente</li>
          </ul>

          <h3>10.2 Por parte del usuario</h3>
          <p>
            El Usuario puede cancelar su cuenta en cualquier momento escribiendo a <a href="mailto:soporte@plattform.mx">soporte@plattform.mx</a>. La cancelación no genera derecho a reembolso de cursos ya adquiridos ni de periodos de suscripción en curso, salvo lo dispuesto en la Política de Reembolsos.
          </p>
        </section>

        <section id="11-disponibilidad" className="scroll-mt-32">
          <h2>11. Disponibilidad del servicio</h2>
          <p>
            Plattform realizará esfuerzos razonables para mantener la Plataforma disponible de forma continua. Sin embargo, no garantiza disponibilidad ininterrumpida y podrá realizar mantenimientos programados o de emergencia.
          </p>
          <p>
            Plattform no será responsable por interrupciones derivadas de fallas de terceros proveedores (alojamiento, procesamiento de pagos, servicios de correo), fuerza mayor, caso fortuito o causas ajenas a su control razonable.
          </p>
        </section>

        <section id="12-limitacion" className="scroll-mt-32">
          <h2>12. Limitación de responsabilidad</h2>
          <p>En la máxima medida permitida por la legislación aplicable:</p>
          <ul className="list-disc pl-6 space-y-2 marker:text-cyan-500">
            <li>Plattform no será responsable por daños indirectos, incidentales, especiales o consecuenciales derivados del uso o imposibilidad de uso de la Plataforma</li>
            <li>Plattform no garantiza la exactitud, calidad, pertinencia o utilidad del contenido publicado por los instructores</li>
            <li>La responsabilidad total de Plattform frente al Usuario, por cualquier concepto, no excederá el monto efectivamente pagado por dicho Usuario durante los tres meses previos al hecho que origine la reclamación</li>
          </ul>
          <p>Nada en esta cláusula limita los derechos que la Ley Federal de Protección al Consumidor otorga a los consumidores.</p>
        </section>

        <section id="13-modificaciones" className="scroll-mt-32">
          <h2>13. Modificaciones a los términos</h2>
          <p>
            Plattform podrá modificar estos Términos y Condiciones en cualquier momento. Las modificaciones sustanciales serán notificadas con al menos <strong>quince (15) días naturales de anticipación</strong> mediante correo electrónico o aviso destacado en la Plataforma.
          </p>
          <p>
            El uso continuado de la Plataforma tras la entrada en vigor de las modificaciones constituye aceptación de las mismas. Si el Usuario no está de acuerdo, podrá cancelar su cuenta conforme a lo señalado en la cláusula 10.2.
          </p>
        </section>

        <section id="14-legislacion" className="scroll-mt-32">
          <h2>14. Legislación aplicable y jurisdicción</h2>
          <p>
            Estos Términos y Condiciones se rigen por las leyes de los <strong>Estados Unidos Mexicanos</strong>.
          </p>
          <p>
            Para la interpretación y cumplimiento de los presentes Términos, las partes se someten expresamente a la jurisdicción de los tribunales competentes de la <strong>Ciudad de México</strong>, renunciando a cualquier otro fuero que pudiera corresponderles por razón de sus domicilios presentes o futuros.
          </p>
          <p>
            Lo anterior sin perjuicio del derecho de los consumidores de acudir ante la <strong>Procuraduría Federal del Consumidor (PROFECO)</strong> conforme a la Ley Federal de Protección al Consumidor.
          </p>
        </section>

        <section id="15-contacto" className="scroll-mt-32 pb-12 border-b border-white/5">
          <h2>15. Contacto</h2>
          <p>Para cualquier duda, aclaración o solicitud relacionada con estos Términos y Condiciones:</p>
          <p>
            <strong>Correo de contacto:</strong> <a href="mailto:soporte@plattform.mx">soporte@plattform.mx</a>
          </p>
          <p>
            Todas las solicitudes —soporte técnico, privacidad, datos personales, facturación y reembolsos— se atienden a través de este mismo correo.
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
