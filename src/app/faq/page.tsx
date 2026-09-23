'use client';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';

interface FAQ {
  pregunta: string;
  respuesta: React.ReactNode;
}

interface Subsection {
  titulo: string;
  preguntas: FAQ[];
}

interface Category {
  categoria: string;
  icono: string;
  subsecciones: Subsection[];
}

const faqData: Category[] = [
  {
    categoria: "Para estudiantes",
    icono: "🎓",
    subsecciones: [
      {
        titulo: "Cuenta y registro",
        preguntas: [
          {
            pregunta: "¿Necesito pagar para registrarme?",
            respuesta: "No. El registro en Plattform es completamente gratuito. Solo pagas cuando adquieres un curso."
          },
          {
            pregunta: "¿Qué necesito para crear mi cuenta?",
            respuesta: "Únicamente tu nombre, apellidos, correo electrónico y una contraseña. No pedimos datos de tarjeta hasta que decidas comprar un curso."
          },
          {
            pregunta: "No me llegó el correo de verificación, ¿qué hago?",
            respuesta: "Revisa tu carpeta de spam o correo no deseado. Si después de diez minutos no aparece, escríbenos a soporte@plattform.mx y lo resolvemos."
          },
          {
            pregunta: "¿Qué pasa si me registro y no compro nada?",
            respuesta: "Si tu cuenta no registra ninguna compra ni actividad de inicio de sesión durante tres meses continuos, será eliminada automáticamente. Te enviaremos un aviso por correo quince días antes, y basta con que inicies sesión para conservarla."
          },
          {
            pregunta: "¿Puedo cambiar mi correo electrónico?",
            respuesta: "El correo es tu identificador de acceso y no puede modificarse. Si necesitas cambiarlo, escríbenos a soporte@plattform.mx para evaluar tu caso."
          },
          {
            pregunta: "Olvidé mi contraseña",
            respuesta: "Desde la pantalla de inicio de sesión haz clic en '¿Olvidaste tu contraseña?' y recibirás un enlace de recuperación válido por 30 minutos."
          }
        ]
      },
      {
        titulo: "Compras y pagos",
        preguntas: [
          {
            pregunta: "¿Qué formas de pago aceptan?",
            respuesta: "Tarjetas de crédito y débito procesadas de forma segura a través de Stripe."
          },
          {
            pregunta: "¿Los precios incluyen impuestos?",
            respuesta: "Sí. Todos los precios están expresados en pesos mexicanos e incluyen los impuestos aplicables."
          },
          {
            pregunta: "¿Guardan mi tarjeta?",
            respuesta: "No. Plattform nunca almacena números completos de tarjeta. El procesamiento lo realiza Stripe, certificado bajo el estándar internacional PCI-DSS."
          },
          {
            pregunta: "¿Puedo pedir factura?",
            respuesta: "Sí. Envía tus datos fiscales a soporte@plattform.mx dentro del mismo mes de tu compra."
          },
          {
            pregunta: "¿Tienen cupones de descuento?",
            respuesta: "Algunos instructores generan códigos promocionales para sus cursos. Si tienes uno, puedes aplicarlo en la pantalla de compra antes de pagar."
          },
          {
            pregunta: "¿Puedo pedir reembolso?",
            respuesta: "Sí, bajo ciertas condiciones. Consulta nuestra Política de Reembolsos para conocer los supuestos y plazos aplicables."
          }
        ]
      },
      {
        titulo: "Acceso al contenido",
        preguntas: [
          {
            pregunta: "¿Por cuánto tiempo tengo acceso al curso?",
            respuesta: "El acceso es permanente mientras tu cuenta esté activa. No hay fechas de vencimiento."
          },
          {
            pregunta: "¿Puedo ver los cursos desde mi celular?",
            respuesta: "Sí. Plattform funciona desde cualquier navegador en computadora, tableta o teléfono."
          },
          {
            pregunta: "¿Puedo descargar los videos o el contenido?",
            respuesta: "No. El contenido está protegido por derechos de autor de cada instructor y su descarga o redistribución está prohibida por nuestros Términos y Condiciones."
          },
          {
            pregunta: "¿Qué pasa si el instructor retira su curso?",
            respuesta: "Si ya lo adquiriste, conservas tu acceso al contenido. El curso simplemente deja de aparecer en el catálogo público para nuevos estudiantes."
          },
          {
            pregunta: "¿Puedo compartir mi cuenta con un amigo?",
            respuesta: "No. Las cuentas son personales e intransferibles. Compartir credenciales es causal de suspensión inmediata sin derecho a reembolso."
          }
        ]
      },
      {
        titulo: "Evaluaciones y certificados",
        preguntas: [
          {
            pregunta: "¿Cómo funcionan las evaluaciones?",
            respuesta: "Cada curso incluye una evaluación final, y algunos cursos también tienen evaluaciones por módulo. El instructor define el porcentaje mínimo de aprobación de cada una."
          },
          {
            pregunta: "¿Cuántas veces puedo intentar una evaluación?",
            respuesta: "Los intentos son ilimitados. Puedes reintentarlo las veces que necesites hasta aprobar."
          },
          {
            pregunta: "¿Cómo obtengo mi certificado?",
            respuesta: "El certificado se genera automáticamente cuando completas el 100% de las lecciones y apruebas todas las evaluaciones requeridas del curso."
          },
          {
            pregunta: "¿Los certificados tienen validez oficial?",
            respuesta: "No. Son constancias de formación continua que acreditan que completaste y aprobaste el curso. No constituyen títulos, grados académicos ni certificaciones con reconocimiento de validez oficial ante la Secretaría de Educación Pública."
          },
          {
            pregunta: "¿Puedo verificar la autenticidad de un certificado?",
            respuesta: "Sí. Cada certificado incluye un código único de verificación con el formato PLT-AAAA-XXXX."
          },
          {
            pregunta: "¿Puedo descargar o imprimir mi certificado?",
            respuesta: "Sí. Desde tu panel puedes visualizarlo, descargarlo e imprimirlo en cualquier momento."
          }
        ]
      }
    ]
  },
  {
    categoria: "Para instructores",
    icono: "👨‍🏫",
    subsecciones: [
      {
        titulo: "Empezar a enseñar",
        preguntas: [
          {
            pregunta: "¿Qué necesito para publicar cursos?",
            respuesta: "Contratar uno de nuestros planes de suscripción mensual y tener contenido propio que quieras enseñar."
          },
          {
            pregunta: "¿Necesito saber programar o diseñar?",
            respuesta: "No. El constructor de cursos es completamente visual. Escribes tu contenido, agregas videos mediante enlaces y creas tus evaluaciones sin escribir una línea de código."
          },
          {
            pregunta: "¿Cuánto cuesta publicar?",
            respuesta: "Depende del plan que elijas. Consulta los planes vigentes y sus características en plattform.mx/planes."
          },
          {
            pregunta: "¿Puedo probar antes de pagar?",
            respuesta: "Puedes registrarte gratuitamente y explorar la plataforma. Para publicar y vender cursos necesitas un plan activo."
          },
          {
            pregunta: "¿Qué tipo de cursos puedo crear?",
            respuesta: "Cualquier conocimiento propio que quieras enseñar: capacitación empresarial, herramientas digitales, habilidades profesionales, formación académica, disciplinas creativas, entre otros. El contenido debe ser original o contar con las licencias correspondientes."
          }
        ]
      },
      {
        titulo: "Ingresos y comisiones",
        preguntas: [
          {
            pregunta: "¿Cómo recibo mi dinero?",
            respuesta: "Los pagos llegan directamente a tu cuenta bancaria mediante Stripe. Plattform no maneja monedero virtual ni retiene fondos."
          },
          {
            pregunta: "¿Cuánto retiene Plattform?",
            respuesta: "Retenemos una comisión por venta cuyo porcentaje depende de tu plan. Adicionalmente, Stripe cobra su propia comisión por procesamiento de pago."
          },
          {
            pregunta: "¿Cuándo recibo mis ingresos?",
            respuesta: "Los plazos de liquidación dependen de Stripe, que en México suele transferir dentro de los siete días hábiles siguientes a la transacción."
          },
          {
            pregunta: "¿Puedo poner el precio que quiera a mis cursos?",
            respuesta: "Sí, dentro de los rangos permitidos por la plataforma. Tú decides el valor de tu conocimiento."
          }
        ]
      },
      {
        titulo: "Crear y gestionar cursos",
        preguntas: [
          {
            pregunta: "¿Puedo editar un curso después de publicarlo?",
            respuesta: "Sí. Puedes modificar títulos, contenido, precios y agregar lecciones en cualquier momento. Los estudiantes inscritos verán las actualizaciones automáticamente."
          },
          {
            pregunta: "¿Los videos se alojan en Plattform?",
            respuesta: "No. Los videos deben estar en YouTube, Vimeo o Loom. En Plattform insertas el enlace y el sistema lo integra automáticamente en la lección."
          },
          {
            pregunta: "¿Puedo hibernar un curso temporalmente?",
            respuesta: "Sí. Hibernar oculta el curso del catálogo público conservando todo el contenido. Solo puedes hibernar cursos que no tengan estudiantes activos inscritos."
          },
          {
            pregunta: "¿Puedo ver el avance de mis estudiantes?",
            respuesta: "Sí. Desde tu panel puedes consultar el progreso individual, último acceso, resultados de evaluaciones y certificados obtenidos."
          },
          {
            pregunta: "¿Puedo crear cupones de descuento?",
            respuesta: "Sí. Puedes generar códigos con porcentaje de descuento, fecha de expiración y número máximo de usos."
          }
        ]
      },
      {
        titulo: "Suscripción y límites",
        preguntas: [
          {
            pregunta: "¿Qué pasa si cancelo mi suscripción?",
            respuesta: "Tus cursos se hibernan y dejan de aparecer en el catálogo público. Los estudiantes que ya los adquirieron conservan su acceso. Puedes reactivarlos contratando nuevamente un plan."
          },
          {
            pregunta: "¿Qué pasa si alcanzo el límite de estudiantes de mi plan?",
            respuesta: "No podrás recibir nuevas inscripciones hasta que actualices a un plan superior. Los estudiantes ya inscritos no se ven afectados."
          },
          {
            pregunta: "¿Puedo cambiar de plan?",
            respuesta: "Sí, en cualquier momento desde tu panel. El nuevo plan aplica a partir del siguiente ciclo de facturación."
          },
          {
            pregunta: "¿Mi cuenta se elimina si no publico nada?",
            respuesta: "Si te registras como instructor pero no contratas ningún plan y no inicias sesión durante tres meses continuos, tu cuenta será eliminada. Te avisaremos por correo quince días antes."
          }
        ]
      }
    ]
  },
  {
    categoria: "Privacidad y seguridad",
    icono: "🔒",
    subsecciones: [
      {
        titulo: "Protección de datos",
        preguntas: [
          {
            pregunta: "¿Qué datos personales recopilan?",
            respuesta: "Nombre, apellidos, correo electrónico y datos de uso de la plataforma. Para instructores, adicionalmente información de su academia. Consulta el Aviso de Privacidad para el detalle completo."
          },
          {
            pregunta: "¿Venden mis datos?",
            respuesta: "No. Plattform no vende, renta ni comercializa datos personales con terceros."
          },
          {
            pregunta: "¿Cómo protegen mi contraseña?",
            respuesta: "Las contraseñas se almacenan cifradas mediante el algoritmo bcrypt. Ni siquiera nosotros podemos verlas."
          },
          {
            pregunta: "¿Cómo ejerzo mis derechos ARCO?",
            respuesta: "Envía tu solicitud a soporte@plattform.mx siguiendo el procedimiento descrito en nuestro Aviso de Privacidad."
          },
          {
            pregunta: "¿Puedo eliminar mi cuenta?",
            respuesta: "Sí, en cualquier momento escribiendo a soporte@plattform.mx. Conservaremos únicamente la información mínima requerida por obligaciones fiscales."
          }
        ]
      }
    ]
  },
  {
    categoria: "Soporte técnico",
    icono: "🛠️",
    subsecciones: [
      {
        titulo: "Resolución de problemas",
        preguntas: [
          {
            pregunta: "No puedo iniciar sesión",
            respuesta: "Verifica que tu correo esté correctamente escrito y que hayas confirmado tu cuenta. Si el problema persiste, usa la opción de recuperar contraseña o escríbenos."
          },
          {
            pregunta: "El video de una lección no carga",
            respuesta: "Verifica tu conexión a internet e intenta recargar la página. Si el problema continúa, repórtalo indicando el curso y la lección específica."
          },
          {
            pregunta: "No se guardó mi progreso",
            respuesta: "El progreso se guarda automáticamente al marcar una lección como completada. Si notas inconsistencias, escríbenos con el detalle."
          },
          {
            pregunta: "¿Cómo reporto un problema?",
            respuesta: "Escribe a soporte@plattform.mx indicando tu nombre, correo registrado y una descripción del problema. Si puedes adjuntar una captura de pantalla, mejor."
          },
          {
            pregunta: "¿Cuál es el horario de atención?",
            respuesta: "Respondemos de lunes a viernes de 9:00 a 18:00 horas (tiempo del centro de México). Buscamos responder dentro de las 24 horas hábiles siguientes."
          }
        ]
      }
    ]
  }
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return faqData;
    }

    const term = searchTerm.toLowerCase();
    
    return faqData.map(category => {
      const filteredSubsections = category.subsecciones.map(sub => {
        const filteredPreguntas = sub.preguntas.filter(
          faq => 
            faq.pregunta.toLowerCase().includes(term) || 
            (typeof faq.respuesta === 'string' && faq.respuesta.toLowerCase().includes(term))
        );
        return { ...sub, preguntas: filteredPreguntas };
      }).filter(sub => sub.preguntas.length > 0);

      return { ...category, subsecciones: filteredSubsections };
    }).filter(category => category.subsecciones.length > 0);
  }, [searchTerm]);

  // Handle auto-expansion on search
  useEffect(() => {
    if (searchTerm.trim()) {
      const newExpanded = new Set<string>();
      filteredData.forEach(cat => {
        cat.subsecciones.forEach(sub => {
          sub.preguntas.forEach((faq, idx) => {
            newExpanded.add(`${cat.categoria}-${sub.titulo}-${idx}`);
          });
        });
      });
      setExpanded(newExpanded);
    } else {
      setExpanded(new Set());
    }
  }, [searchTerm, filteredData]);

  const toggleAccordion = (id: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  return (
    <div className="min-h-screen bg-[#070d1a] text-[#CBD5E1] font-sans">
      <header className="fixed top-0 left-0 right-0 h-20 border-b border-white/5 bg-[#070d1a]/80 backdrop-blur-xl z-50 flex items-center px-6 lg:px-12">
        <Link href="/" className="font-space-grotesk font-black text-2xl tracking-tighter italic text-white hover:text-cyan-400 transition-colors">
          PLATTFORM
        </Link>
      </header>

      <main className="pt-32 pb-24 px-6 lg:px-12 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-space-grotesk text-4xl md:text-5xl font-black text-white mb-6">Preguntas Frecuentes</h1>
          <p className="text-sm text-gray-500 mb-8 uppercase tracking-widest font-bold">Última actualización: 23 de septiembre de 2026</p>
          <div className="relative max-w-xl mx-auto">
            <input 
              type="text" 
              placeholder="Busca tu duda (ej. certificados, pagos...)" 
              className="w-full bg-[#0d1524] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-500 transition-colors shadow-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          </div>
        </div>

        <div className="space-y-16">
          {filteredData.length === 0 ? (
            <div className="text-center py-16 px-6 border border-white/5 rounded-3xl bg-white/5 max-w-lg mx-auto">
              <p className="text-4xl mb-4">🤔</p>
              <h3 className="text-xl font-bold text-white mb-2">No encontramos coincidencias</h3>
              <p className="text-gray-400 text-sm mb-6">No hay resultados para "{searchTerm}". Intenta con otras palabras clave.</p>
              <p className="text-sm text-gray-400">¿No encuentras lo que buscas? Escríbenos a <a href="mailto:soporte@plattform.mx" className="text-cyan-400 font-bold hover:underline">soporte@plattform.mx</a></p>
            </div>
          ) : (
            filteredData.map(category => (
              <section key={category.categoria} className="scroll-mt-32">
                <h2 className="text-2xl font-space-grotesk font-black text-white mb-8 flex items-center gap-3 uppercase tracking-wider">
                  <span>{category.icono}</span> {category.categoria}
                </h2>
                
                <div className="space-y-10 pl-2 md:pl-8 border-l border-white/5">
                  {category.subsecciones.map(sub => (
                    <div key={sub.titulo}>
                      <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4">{sub.titulo}</h3>
                      <div className="space-y-3">
                        {sub.preguntas.map((faq, idx) => {
                          const faqId = `${category.categoria}-${sub.titulo}-${idx}`;
                          const isExpanded = expanded.has(faqId);
                          return (
                            <div key={faqId} className="bg-[#0d1524] border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/10">
                              <button 
                                className="w-full text-left px-6 py-5 flex justify-between items-center transition-colors focus:outline-none"
                                onClick={() => toggleAccordion(faqId)}
                              >
                                <span className="font-bold text-sm text-gray-200 pr-8">{faq.pregunta}</span>
                                <span className={`text-cyan-500 transition-transform duration-300 shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>
                                  ▼
                                </span>
                              </button>
                              <div 
                                className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                              >
                                <div className="px-6 pb-6 text-sm text-gray-400 leading-relaxed pt-2">
                                  {faq.respuesta}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>

        {/* Sección de Contacto al final */}
        <section className="mt-24 pt-12 border-t border-white/5 text-center">
          <div className="inline-block bg-[#0d1524] border border-white/10 rounded-3xl p-8 max-w-xl">
            <h2 className="text-xl font-bold text-white mb-4">📬 ¿Aún tienes dudas?</h2>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Para cualquier duda, solicitud o reporte —soporte técnico, privacidad, datos personales, facturación o reembolsos— escríbenos a:
            </p>
            <a href="mailto:soporte@plattform.mx" className="inline-block px-8 py-4 bg-cyan-500/10 text-cyan-400 font-bold rounded-xl hover:bg-cyan-500/20 transition-colors border border-cyan-500/30">
              soporte@plattform.mx
            </a>
            <p className="text-xs text-gray-500 mt-6">
              Respondemos de lunes a viernes de 9:00 a 18:00 horas (tiempo del centro de México).
            </p>
          </div>
        </section>

      </main>

      <footer className="border-t border-white/5 bg-[#0a1122] py-12 px-6 lg:px-12 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
          <div className="font-space-grotesk font-black text-xl tracking-tighter italic text-white/30">PLATTFORM</div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-600">Crea. Vende. Escala.</p>
          <div className="flex flex-wrap justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-4">
            <Link href="/privacidad" className="hover:text-cyan-400 transition-colors">Privacidad</Link>
            <Link href="/terminos" className="hover:text-cyan-400 transition-colors">Términos</Link>
            <Link href="/reembolsos" className="hover:text-cyan-400 transition-colors">Reembolsos</Link>
            <Link href="/cookies" className="hover:text-cyan-400 transition-colors">Cookies</Link>
            <Link href="/faq" className="hover:text-cyan-400 transition-colors">FAQ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
