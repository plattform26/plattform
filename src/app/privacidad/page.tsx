import LegalLayout from '@/components/legal/LegalLayout';
import Link from 'next/link';

export default function PrivacidadPage() {
  const sections = [
    { id: '1-identidad', title: '1. Identidad y domicilio' },
    { id: '2-datos', title: '2. Datos recabados' },
    { id: '3-finalidades', title: '3. Finalidades' },
    { id: '4-transferencias', title: '4. Transferencias' },
    { id: '5-arco', title: '5. Derechos ARCO' },
    { id: '6-revocacion', title: '6. Revocación' },
    { id: '7-conservacion', title: '7. Conservación de datos' },
    { id: '8-cookies', title: '8. Uso de cookies' },
    { id: '9-seguridad', title: '9. Medidas de seguridad' },
    { id: '10-menores', title: '10. Menores de edad' },
    { id: '11-modificaciones', title: '11. Modificaciones' },
    { id: '12-autoridad', title: '12. Autoridad competente' },
    { id: '13-consentimiento', title: '13. Consentimiento' },
  ];

  return (
    <LegalLayout 
      title="Aviso de Privacidad Integral" 
      lastUpdated="23 de septiembre de 2026"
      sections={sections}
    >
      <div className="space-y-8">
        <section id="1-identidad" className="scroll-mt-32">
          <h2>1. Identidad y domicilio del responsable</h2>
          <p>
            <strong>Diego Castellanos Maya</strong>, persona física con actividad empresarial, en lo sucesivo <strong>"Plattform"</strong> o <strong>"el Responsable"</strong>, con domicilio en Ciudad de México, México, y correo electrónico de contacto <a href="mailto:soporte@plattform.mx">soporte@plattform.mx</a>, es responsable del tratamiento de sus datos personales conforme a lo dispuesto por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), su Reglamento y demás disposiciones aplicables.
          </p>
        </section>

        <section id="2-datos" className="scroll-mt-32">
          <h2>2. Datos personales que recabamos</h2>
          <p>
            Para las finalidades señaladas en el presente Aviso de Privacidad, podemos recabar sus datos personales de las siguientes formas: cuando usted nos los proporciona directamente al registrarse o utilizar la plataforma, y cuando obtenemos información a través de otras fuentes permitidas por la ley.
          </p>
          
          <h3>2.1 Datos de identificación</h3>
          <ul className="list-disc pl-6 space-y-2 marker:text-cyan-500">
            <li>Nombre completo</li>
            <li>Apellidos</li>
            <li>Correo electrónico</li>
            <li>Contraseña (almacenada de forma cifrada mediante algoritmo bcrypt)</li>
          </ul>

          <h3>2.2 Datos adicionales para instructores</h3>
          <ul className="list-disc pl-6 space-y-2 marker:text-cyan-500">
            <li>Nombre de la academia o marca comercial</li>
            <li>Descripción profesional</li>
            <li>Institución de procedencia (opcional)</li>
            <li>Imagen de perfil o logotipo (opcional)</li>
            <li>Perfil de LinkedIn (opcional)</li>
          </ul>

          <h3>2.3 Datos de facturación y pago</h3>
          <p>
            Los pagos se procesan exclusivamente a través de <strong>Stripe</strong>, nuestro procesador de pagos certificado bajo el estándar PCI-DSS. <strong>Plattform no almacena en ningún momento números completos de tarjetas de crédito o débito, CVV, ni credenciales bancarias.</strong> Únicamente conservamos:
          </p>
          <ul className="list-disc pl-6 space-y-2 marker:text-cyan-500">
            <li>Identificador de transacción generado por Stripe</li>
            <li>Últimos cuatro dígitos de la tarjeta (con fines de identificación)</li>
            <li>Monto, moneda y fecha de la transacción</li>
            <li>Estado del pago</li>
          </ul>

          <h3>2.4 Datos de uso de la plataforma</h3>
          <ul className="list-disc pl-6 space-y-2 marker:text-cyan-500">
            <li>Cursos adquiridos e inscripciones activas</li>
            <li>Progreso de avance en lecciones</li>
            <li>Resultados de evaluaciones y número de intentos</li>
            <li>Certificados obtenidos</li>
            <li>Fecha y hora del último acceso</li>
            <li>Dirección IP y tipo de navegador (con fines de seguridad)</li>
          </ul>

          <h3>2.5 Datos sensibles</h3>
          <p>
            <strong>Plattform no recaba datos personales sensibles</strong>, entendidos como aquellos que afecten la esfera más íntima de su titular, tales como origen racial o étnico, estado de salud, información genética, creencias religiosas, filosóficas o morales, afiliación sindical, opiniones políticas o preferencia sexual.
          </p>
        </section>

        <section id="3-finalidades" className="scroll-mt-32">
          <h2>3. Finalidades del tratamiento</h2>
          
          <h3>3.1 Finalidades primarias (necesarias)</h3>
          <p>Sus datos personales serán utilizados para las siguientes finalidades que son necesarias para la existencia y cumplimiento de la relación jurídica entre usted y Plattform:</p>
          <ul className="list-disc pl-6 space-y-2 marker:text-cyan-500">
            <li>Crear, verificar y administrar su cuenta de usuario</li>
            <li>Autenticar su identidad al iniciar sesión</li>
            <li>Procesar la compra de cursos y suscripciones</li>
            <li>Otorgar acceso al contenido educativo adquirido</li>
            <li>Registrar y mostrar su progreso académico</li>
            <li>Calificar evaluaciones y emitir certificados de terminación</li>
            <li>Enviar comunicaciones transaccionales relacionadas con su cuenta, compras y certificados</li>
            <li>Brindar soporte técnico</li>
            <li>Cumplir con obligaciones fiscales y legales aplicables</li>
            <li>Prevenir fraudes y garantizar la seguridad de la plataforma</li>
          </ul>

          <h3>3.2 Finalidades secundarias (opcionales)</h3>
          <p>Las siguientes finalidades no son necesarias para la relación jurídica, pero nos permiten brindarle una mejor experiencia:</p>
          <ul className="list-disc pl-6 space-y-2 marker:text-cyan-500">
            <li>Envío de información sobre nuevos cursos, promociones y novedades de la plataforma</li>
            <li>Realización de encuestas de satisfacción</li>
            <li>Elaboración de estadísticas y análisis internos de uso (de forma agregada y disociada)</li>
            <li>Recomendación personalizada de contenido educativo</li>
          </ul>
          <p>
            <strong>Si usted no desea que sus datos sean tratados para las finalidades secundarias</strong>, puede manifestarlo enviando un correo electrónico a <a href="mailto:soporte@plattform.mx">soporte@plattform.mx</a> con el asunto "Limitación de uso de datos", indicando su nombre completo y el correo electrónico asociado a su cuenta. La negativa para el uso de sus datos personales para estas finalidades no será motivo para que le neguemos los servicios que solicita o contrata con nosotros.
          </p>
        </section>

        <section id="4-transferencias" className="scroll-mt-32">
          <h2>4. Transferencias de datos personales</h2>
          <p>
            Sus datos personales pueden ser transferidos y tratados dentro y fuera del territorio mexicano por las siguientes personas o entidades, con las finalidades que se indican:
          </p>
          
          <div className="overflow-x-auto my-6 border border-white/10 rounded-2xl bg-[#0d1524]">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs uppercase bg-[#0A1F44] text-cyan-400 border-b border-white/10">
                <tr>
                  <th scope="col" className="px-6 py-4 font-bold">Destinatario</th>
                  <th scope="col" className="px-6 py-4 font-bold">Finalidad</th>
                  <th scope="col" className="px-6 py-4 font-bold">Ubicación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">Stripe, Inc.</td>
                  <td className="px-6 py-4">Procesamiento de pagos con tarjeta</td>
                  <td className="px-6 py-4 text-gray-400">Estados Unidos</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">Supabase Inc.</td>
                  <td className="px-6 py-4">Alojamiento y almacenamiento de base de datos</td>
                  <td className="px-6 py-4 text-gray-400">Estados Unidos</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">Vercel Inc.</td>
                  <td className="px-6 py-4">Alojamiento de la aplicación web</td>
                  <td className="px-6 py-4 text-gray-400">Estados Unidos</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">Resend</td>
                  <td className="px-6 py-4">Envío de correos electrónicos transaccionales</td>
                  <td className="px-6 py-4 text-gray-400">Estados Unidos</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">OpenAI, L.L.C.</td>
                  <td className="px-6 py-4">Generación asistida de contenido educativo (solo para instructores que usen esta función)</td>
                  <td className="px-6 py-4 text-gray-400">Estados Unidos</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">Autoridades competentes</td>
                  <td className="px-6 py-4">Cumplimiento de requerimientos legales</td>
                  <td className="px-6 py-4 text-gray-400">México</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            Estas transferencias son necesarias para el mantenimiento y cumplimiento de la relación jurídica entre usted y Plattform, por lo que de conformidad con el artículo 37 de la LFPDPPP, no requieren de su consentimiento. Todos nuestros proveedores cuentan con medidas de seguridad y confidencialidad adecuadas conforme a estándares internacionales.
          </p>
          <p>
            <strong>Plattform no vende, renta ni comercializa sus datos personales con terceros.</strong>
          </p>
        </section>

        <section id="5-arco" className="scroll-mt-32">
          <h2>5. Derechos ARCO</h2>
          <p>
            Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (<strong>Acceso</strong>). Asimismo, es su derecho solicitar la corrección de su información personal en caso de que esté desactualizada, sea inexacta o incompleta (<strong>Rectificación</strong>); que la eliminemos de nuestros registros cuando considere que la misma no está siendo utilizada conforme a los principios, deberes y obligaciones previstas en la normativa (<strong>Cancelación</strong>); así como oponerse al uso de sus datos personales para fines específicos (<strong>Oposición</strong>).
          </p>

          <h3>5.1 Procedimiento para ejercer sus derechos ARCO</h3>
          <p>Para ejercer cualquiera de estos derechos, deberá enviar una solicitud al correo electrónico <a href="mailto:soporte@plattform.mx">soporte@plattform.mx</a> con el asunto "Solicitud de Derechos ARCO", conteniendo la siguiente información:</p>
          <ol className="list-decimal pl-6 space-y-2 marker:text-cyan-500 font-bold">
            <li><span className="font-normal">Nombre completo del titular y correo electrónico para recibir la respuesta</span></li>
            <li><span className="font-normal">Documento que acredite su identidad (copia de identificación oficial vigente) o, en su caso, el documento que acredite la representación legal</span></li>
            <li><span className="font-normal">Descripción clara y precisa de los datos personales respecto de los que busca ejercer alguno de los derechos ARCO</span></li>
            <li><span className="font-normal">Cualquier otro elemento o documento que facilite la localización de los datos personales</span></li>
            <li><span className="font-normal">En caso de solicitudes de rectificación, deberá indicar las modificaciones a realizarse y aportar la documentación que sustente su petición</span></li>
          </ol>

          <h3>5.2 Plazos de respuesta</h3>
          <p>
            Plattform responderá su solicitud en un plazo máximo de <strong>20 días hábiles</strong> contados desde la fecha de recepción. En caso de resultar procedente, la respuesta se hará efectiva dentro de los <strong>15 días hábiles</strong> siguientes a la fecha en que se comunique la respuesta. Estos plazos podrán ser ampliados una sola vez por un periodo igual, siempre y cuando así lo justifiquen las circunstancias del caso.
          </p>

          <h3>5.3 Limitaciones</h3>
          <p>El ejercicio del derecho de cancelación u oposición podrá resultar improcedente en los casos previstos por la ley, particularmente cuando:</p>
          <ul className="list-disc pl-6 space-y-2 marker:text-cyan-500">
            <li>Los datos sean necesarios para cumplir obligaciones fiscales derivadas de compras realizadas</li>
            <li>Exista una obligación legal de conservar la información</li>
            <li>Los datos sean necesarios para el cumplimiento de obligaciones contractuales vigentes</li>
          </ul>
        </section>

        <section id="6-revocacion" className="scroll-mt-32">
          <h2>6. Revocación del consentimiento</h2>
          <p>
            Usted puede revocar el consentimiento que nos haya otorgado para el tratamiento de sus datos personales. Sin embargo, es importante que tenga en cuenta que no en todos los casos podremos atender su solicitud o concluir el uso de forma inmediata, ya que es posible que por alguna obligación legal requiramos seguir tratando sus datos personales.
          </p>
          <p>
            Para revocar su consentimiento, siga el mismo procedimiento señalado en la sección 5.1 de este Aviso.
          </p>
        </section>

        <section id="7-conservacion" className="scroll-mt-32">
          <h2>7. Conservación y eliminación de datos</h2>
          
          <h3>7.1 Cuentas activas con historial de compras</h3>
          <p>
            Conservaremos sus datos personales durante el tiempo que mantenga una cuenta activa en la plataforma, y posteriormente durante el plazo que las obligaciones fiscales y legales nos exijan, que en México es de <strong>cinco años</strong> para efectos de comprobantes fiscales digitales.
          </p>
          <p>
            Los usuarios que hayan adquirido al menos un curso conservarán acceso permanente a los cursos adquiridos y a sus certificados obtenidos, salvo que soliciten expresamente la eliminación de su cuenta.
          </p>

          <h3>7.2 Cuentas sin actividad de compra</h3>
          <p>
            <strong>Las cuentas de usuarios —tanto estudiantes como instructores— que se hayan registrado en la plataforma pero que no hayan realizado ninguna compra ni suscripción, y que no registren actividad de inicio de sesión durante un periodo continuo de tres (3) meses, serán eliminadas de forma automática y permanente.</strong>
          </p>
          <p>
            Antes de proceder con la eliminación, Plattform enviará un correo electrónico de aviso a la dirección registrada, con al menos <strong>quince (15) días naturales de anticipación</strong>, informando la fecha programada de eliminación y ofreciendo la posibilidad de conservar la cuenta mediante un inicio de sesión.
          </p>
          <p>
            La eliminación comprende la totalidad de los datos asociados a la cuenta y es irreversible. Una vez eliminada, el usuario podrá registrarse nuevamente en cualquier momento creando una cuenta nueva.
          </p>

          <h3>7.3 Eliminación voluntaria</h3>
          <p>
            Usted puede solicitar la eliminación de su cuenta en cualquier momento escribiendo a <a href="mailto:soporte@plattform.mx">soporte@plattform.mx</a>. Conservaremos únicamente la información mínima necesaria para cumplir obligaciones fiscales derivadas de compras previas.
          </p>
        </section>

        <section id="8-cookies" className="scroll-mt-32">
          <h2>8. Uso de cookies y tecnologías de rastreo</h2>
          <p>
            Plattform utiliza cookies y tecnologías similares para el correcto funcionamiento de la plataforma. Para conocer el detalle de las cookies que utilizamos y cómo gestionarlas, consulte nuestra <Link href="/cookies" className="font-bold text-cyan-400 hover:underline">Política de Cookies</Link>.
          </p>
        </section>

        <section id="9-seguridad" className="scroll-mt-32">
          <h2>9. Medidas de seguridad</h2>
          <p>
            Plattform ha implementado medidas de seguridad administrativas, técnicas y físicas para proteger sus datos personales contra daño, pérdida, alteración, destrucción o uso, acceso o tratamiento no autorizado, entre las que destacan:
          </p>
          <ul className="list-disc pl-6 space-y-2 marker:text-cyan-500">
            <li>Cifrado de contraseñas mediante algoritmo bcrypt con factor de costo elevado</li>
            <li>Conexiones cifradas mediante protocolo HTTPS/TLS en toda la plataforma</li>
            <li>Tokens de sesión con expiración automática</li>
            <li>Segregación de accesos por rol de usuario</li>
            <li>Procesamiento de pagos delegado a proveedor certificado PCI-DSS</li>
            <li>Respaldos periódicos de información</li>
          </ul>
          <p>
            No obstante lo anterior, ningún sistema es completamente infalible. En caso de que ocurra una vulneración de seguridad que afecte de forma significativa sus derechos patrimoniales o morales, le informaremos de manera inmediata a través del correo electrónico registrado.
          </p>
        </section>

        <section id="10-menores" className="scroll-mt-32">
          <h2>10. Menores de edad</h2>
          <p>
            Los servicios de Plattform están dirigidos a personas mayores de 18 años. Los menores de edad únicamente podrán utilizar la plataforma con el consentimiento expreso y bajo la supervisión de su padre, madre o tutor legal, quien será responsable del tratamiento de los datos del menor.
          </p>
          <p>
            Si tenemos conocimiento de que hemos recabado datos de un menor de edad sin el consentimiento correspondiente, procederemos a eliminar dicha información.
          </p>
        </section>

        <section id="11-modificaciones" className="scroll-mt-32">
          <h2>11. Modificaciones al Aviso de Privacidad</h2>
          <p>
            El presente Aviso de Privacidad puede sufrir modificaciones, cambios o actualizaciones derivadas de nuevos requerimientos legales, de nuestras propias necesidades por los productos o servicios que ofrecemos, de nuestras prácticas de privacidad, o por otras causas.
          </p>
          <p>
            Nos comprometemos a mantenerlo informado sobre los cambios que pueda sufrir el presente Aviso de Privacidad a través de la publicación de la versión actualizada en <strong>plattform.mx/privacidad</strong>, indicando la fecha de última actualización. En caso de cambios sustanciales, le notificaremos adicionalmente por correo electrónico.
          </p>
        </section>

        <section id="12-autoridad" className="scroll-mt-32">
          <h2>12. Autoridad competente</h2>
          <p>
            Si usted considera que su derecho a la protección de datos personales ha sido lesionado por alguna conducta u omisión de nuestra parte, o presume alguna violación a las disposiciones previstas en la LFPDPPP, su Reglamento y demás ordenamientos aplicables, podrá interponer su inconformidad o denuncia ante el <strong>Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales (INAI)</strong>.
          </p>
          <p>
            Para mayor información, visite <a href="https://www.inai.org.mx" target="_blank" rel="noopener noreferrer">www.inai.org.mx</a>
          </p>
        </section>

        <section id="13-consentimiento" className="scroll-mt-32 pb-12 border-b border-white/5">
          <h2>13. Consentimiento</h2>
          <p>Al registrarse en Plattform y utilizar nuestros servicios, usted manifiesta:</p>
          <ol className="list-decimal pl-6 space-y-2 marker:text-cyan-500 font-bold">
            <li><span className="font-normal">Que ha leído, entendido y acordado los términos expuestos en el presente Aviso de Privacidad</span></li>
            <li><span className="font-normal">Que otorga su consentimiento para el tratamiento de sus datos personales conforme a las finalidades primarias aquí descritas</span></li>
            <li><span className="font-normal">Que es mayor de edad o cuenta con la autorización de su padre, madre o tutor legal</span></li>
          </ol>
        </section>

        <div className="pt-8 text-sm text-gray-500 font-bold">
          <p className="text-white mb-1 text-base">Plattform</p>
          <p>Diego Castellanos Maya</p>
          <p>Ciudad de México, México</p>
          <p><a href="mailto:soporte@plattform.mx" className="text-cyan-400 hover:underline">soporte@plattform.mx</a></p>
        </div>
      </div>
    </LegalLayout>
  );
}
