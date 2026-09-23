'use client';
import LegalLayout from '@/components/legal/LegalLayout';
import Link from 'next/link';

export default function CookiesPage() {
  const sections = [
    { id: '1-que-son', title: '1. ¿Qué son las cookies?' },
    { id: '2-cookies-utilizamos', title: '2. Cookies que utilizamos' },
    { id: '3-cookies-terceros', title: '3. Cookies de terceros' },
    { id: '4-gestion', title: '4. Gestión de cookies' },
    { id: '5-almacenamiento', title: '5. Almacenamiento local' },
    { id: '6-actualizaciones', title: '6. Actualizaciones' },
    { id: '7-contacto', title: '7. Contacto' },
  ];

  const handleResetPreferences = () => {
    localStorage.removeItem('plattform_cookie_consent');
    window.location.reload();
  };

  return (
    <LegalLayout 
      title="Política de Cookies" 
      lastUpdated="23 de septiembre de 2026"
      sections={sections}
    >
      <div className="space-y-8">
        <section id="1-que-son" className="scroll-mt-32">
          <h2>1. ¿Qué son las cookies?</h2>
          <p>
            Las cookies son pequeños archivos de texto que los sitios web almacenan en su dispositivo cuando los visita. Permiten que el sitio recuerde información sobre su visita, como sus preferencias o su estado de sesión, facilitando la navegación y mejorando la experiencia de uso.
          </p>
          <p>
            Además de las cookies, Plattform puede utilizar tecnologías similares como el almacenamiento local del navegador (localStorage) y tokens de sesión.
          </p>
        </section>

        <section id="2-cookies-utilizamos" className="scroll-mt-32">
          <h2>2. Cookies que utilizamos</h2>
          
          <h3>2.1 Cookies estrictamente necesarias</h3>
          <p>Son indispensables para el funcionamiento de la Plataforma. Sin ellas no es posible prestar el servicio.</p>
          
          <div className="overflow-x-auto my-6 border border-white/10 rounded-2xl bg-[#0d1524]">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs uppercase bg-[#0A1F44] text-cyan-400 border-b border-white/10">
                <tr>
                  <th scope="col" className="px-6 py-4 font-bold">Cookie</th>
                  <th scope="col" className="px-6 py-4 font-bold">Finalidad</th>
                  <th scope="col" className="px-6 py-4 font-bold">Duración</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-cyan-300">accessToken</td>
                  <td className="px-6 py-4">Mantener la sesión del usuario autenticado</td>
                  <td className="px-6 py-4">15 minutos</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-cyan-300">refreshToken</td>
                  <td className="px-6 py-4">Renovar la sesión sin requerir reingreso de credenciales</td>
                  <td className="px-6 py-4">30 días</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-cyan-300">__stripe_mid</td>
                  <td className="px-6 py-4">Prevención de fraude en pagos (Stripe)</td>
                  <td className="px-6 py-4">1 año</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-cyan-300">__stripe_sid</td>
                  <td className="px-6 py-4">Sesión de procesamiento de pago (Stripe)</td>
                  <td className="px-6 py-4">30 minutos</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="bg-cyan-900/20 border border-cyan-500/20 px-6 py-4 rounded-xl text-sm">
            <strong>Base legal:</strong> Estas cookies no requieren consentimiento por ser necesarias para la prestación del servicio expresamente solicitado por el usuario.
          </p>

          <h3>2.2 Cookies funcionales</h3>
          <p>Permiten recordar preferencias del usuario para mejorar la experiencia.</p>
          
          <div className="overflow-x-auto my-6 border border-white/10 rounded-2xl bg-[#0d1524]">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs uppercase bg-[#0A1F44] text-cyan-400 border-b border-white/10">
                <tr>
                  <th scope="col" className="px-6 py-4 font-bold">Cookie</th>
                  <th scope="col" className="px-6 py-4 font-bold">Finalidad</th>
                  <th scope="col" className="px-6 py-4 font-bold">Duración</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-cyan-300">sidebar_state</td>
                  <td className="px-6 py-4">Recordar si el panel lateral está expandido o colapsado</td>
                  <td className="px-6 py-4">Sesión</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-cyan-300">lesson_progress</td>
                  <td className="px-6 py-4">Guardar posición de lectura dentro de una lección</td>
                  <td className="px-6 py-4">Sesión</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>2.3 Cookies analíticas</h3>
          <p>Nos ayudan a entender cómo los usuarios interactúan con la Plataforma para mejorar el servicio. La información se recopila de forma agregada y disociada.</p>
          
          <div className="overflow-x-auto my-6 border border-white/10 rounded-2xl bg-[#0d1524]">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs uppercase bg-[#0A1F44] text-cyan-400 border-b border-white/10">
                <tr>
                  <th scope="col" className="px-6 py-4 font-bold">Cookie</th>
                  <th scope="col" className="px-6 py-4 font-bold">Finalidad</th>
                  <th scope="col" className="px-6 py-4 font-bold">Duración</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-cyan-300">_vercel_insights</td>
                  <td className="px-6 py-4">Métricas de rendimiento y uso de la aplicación</td>
                  <td className="px-6 py-4">1 año</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>2.4 Cookies publicitarias</h3>
          <p>
            <strong>Plattform no utiliza cookies publicitarias ni de seguimiento con fines de mercadotecnia de terceros.</strong>
          </p>
        </section>

        <section id="3-cookies-terceros" className="scroll-mt-32">
          <h2>3. Cookies de terceros</h2>
          <p>Algunos servicios integrados en la Plataforma pueden instalar sus propias cookies:</p>
          
          <div className="space-y-4">
            <div className="bg-[#0d1524] border border-white/10 p-6 rounded-2xl">
              <h4 className="text-white font-bold mb-2">Stripe</h4>
              <p className="text-sm text-gray-400 mb-2">Procesamiento de pagos y prevención de fraude.</p>
              <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-400 hover:underline">Política de privacidad: stripe.com/privacy</a>
            </div>
            
            <div className="bg-[#0d1524] border border-white/10 p-6 rounded-2xl">
              <h4 className="text-white font-bold mb-2">Vercel</h4>
              <p className="text-sm text-gray-400 mb-2">Alojamiento y métricas de rendimiento.</p>
              <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-400 hover:underline">Política de privacidad: vercel.com/legal/privacy-policy</a>
            </div>
          </div>

          <p className="mt-6">Plattform no controla las cookies instaladas por estos terceros. Recomendamos consultar sus respectivas políticas de privacidad.</p>
        </section>

        <section id="4-gestion" className="scroll-mt-32">
          <h2>4. Gestión de cookies</h2>
          
          <h3>4.1 Desde la Plataforma</h3>
          <p>
            Al ingresar por primera vez a Plattform, se mostrará un aviso que le permitirá aceptar o rechazar las cookies no esenciales. Puede modificar su elección en cualquier momento desde la configuración de su cuenta, o utilizando el botón en la parte inferior de esta página.
          </p>

          <h3>4.2 Desde su navegador</h3>
          <p>Puede configurar su navegador para bloquear o eliminar cookies. A continuación, los enlaces a las instrucciones de los navegadores más comunes:</p>
          <ul className="list-disc pl-6 space-y-2 marker:text-cyan-500">
            <li><strong>Google Chrome:</strong> Configuración → Privacidad y seguridad → Cookies y otros datos de sitios</li>
            <li><strong>Mozilla Firefox:</strong> Ajustes → Privacidad y seguridad → Cookies y datos del sitio</li>
            <li><strong>Safari:</strong> Preferencias → Privacidad → Gestionar datos de sitios web</li>
            <li><strong>Microsoft Edge:</strong> Configuración → Cookies y permisos del sitio</li>
          </ul>

          <h3>4.3 Consecuencias de deshabilitar cookies</h3>
          <p className="bg-rose-900/10 border border-rose-500/20 px-6 py-4 rounded-xl text-rose-200">
            <strong>Importante:</strong> Si bloquea las cookies estrictamente necesarias, no podrá iniciar sesión ni acceder al contenido adquirido. La Plataforma dejará de funcionar correctamente.
          </p>
          <p>
            El bloqueo de cookies funcionales o analíticas no impide el uso de la Plataforma, pero puede afectar la experiencia de navegación.
          </p>
        </section>

        <section id="5-almacenamiento" className="scroll-mt-32">
          <h2>5. Almacenamiento local</h2>
          <p>
            Plattform utiliza el almacenamiento local del navegador (localStorage) para guardar preferencias de interfaz que no contienen datos personales identificables. Esta información permanece en su dispositivo hasta que la elimine manualmente o borre los datos de navegación.
          </p>
        </section>

        <section id="6-actualizaciones" className="scroll-mt-32">
          <h2>6. Actualizaciones de esta política</h2>
          <p>
            Esta Política de Cookies puede actualizarse para reflejar cambios en las tecnologías utilizadas o en la normativa aplicable. La versión vigente estará siempre disponible en <strong>plattform.mx/cookies</strong>, indicando la fecha de última actualización.
          </p>
        </section>

        <section id="7-contacto" className="scroll-mt-32 pb-12 border-b border-white/5">
          <h2>7. Contacto</h2>
          <p>Para dudas sobre el uso de cookies en Plattform:</p>
          <p><a href="mailto:soporte@plattform.mx" className="text-cyan-400 hover:underline">soporte@plattform.mx</a></p>
        </section>

        <div className="pt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-sm text-gray-500 font-bold">
            <p className="text-white mb-1 text-base">Plattform</p>
            <p>Diego Castellanos Maya</p>
            <p>Ciudad de México, México</p>
          </div>
          
          <button 
            onClick={handleResetPreferences}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-colors border border-white/10 shadow-lg shrink-0"
          >
            Gestionar mis preferencias de cookies
          </button>
        </div>
      </div>
    </LegalLayout>
  );
}
