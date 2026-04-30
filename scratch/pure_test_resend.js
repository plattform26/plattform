const https = require('https');

const API_KEY = 're_i6jVg9w5_EMt5rxtEwa67DjBkWjrHs1zq';
const FROM = 'Plattform <soporte@plattform.mx>';
const TO = 'azulno26@hotmail.com';

function sendTestEmail(role) {
  const data = JSON.stringify({
    from: FROM,
    to: [TO],
    subject: `Prueba de Giro: ${role}`,
    html: `<h1>Prueba exitosa para ${role}</h1><p>Si recibes esto, el API de Resend y el dominio soporte@plattform.mx están funcionando perfectamente.</p>`
  });

  const options = {
    hostname: 'api.resend.com',
    port: 443,
    path: '/emails',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Length': data.length
    }
  };

  const req = https.request(options, (res) => {
    let responseBody = '';
    res.on('data', (d) => { responseBody += d; });
    res.on('end', () => {
      console.log(`[${role}] Status: ${res.statusCode}`);
      console.log(`[${role}] Response: ${responseBody}`);
    });
  });

  req.on('error', (error) => {
    console.error(`[${role}] Error:`, error);
  });

  req.write(data);
  req.end();
}

console.log('🚀 Iniciando prueba directa de los 3 giros via API...');
sendTestEmail('ALUMNO');
sendTestEmail('INSTRUCTOR');
sendTestEmail('ADMIN');
