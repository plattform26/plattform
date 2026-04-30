import { 
  sendPaymentConfirmationEmail, 
  sendSaleNotificationToInstructor, 
  sendSaleNotificationToAdmin 
} from '../src/lib/mail';

async function testEmails() {
  const testEmail = 'azulno26@hotmail.com';
  const testName = 'Diego (Prueba Total)';
  const testCourse = 'Curso de Prueba Blindada';
  const testAmount = 100;
  const testUrl = 'https://www.plattform.mx';

  console.log('🚀 Iniciando prueba de los 3 giros...');

  try {
    // 1. Giro Alumno
    console.log('📧 Enviando correo a Alumno...');
    await sendPaymentConfirmationEmail(testEmail, testName, testCourse, testAmount, undefined, testUrl);
    
    // 2. Giro Instructor
    console.log('📧 Enviando correo a Instructor...');
    await sendSaleNotificationToInstructor(testEmail, testName, testCourse, testUrl);
    
    // 3. Giro Admin
    console.log('📧 Enviando correo a Admin...');
    await sendSaleNotificationToAdmin(testName, testCourse, testAmount, undefined, testUrl);

    console.log('✅ ¡Los 3 correos fueron enviados a Resend exitosamente!');
  } catch (error: any) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

testEmails();
