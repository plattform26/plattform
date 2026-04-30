const https = require('https');

const API_KEY = 're_i6jVg9w5_EMt5rxtEwa67DjBkWjrHs1zq';
const data = JSON.stringify({
  from: 'Plattform <soporte@plattform.mx>',
  to: ['azulno26@hotmail.com'],
  subject: 'Prueba de Conexión Plattform (Clave 2)',
  html: '<h1>Si lees esto, la segunda clave funciona</h1>',
  text: 'SI LEES ESTO, LA SEGUNDA CLAVE FUNCIONA'
});

const options = {
  hostname: 'api.resend.com',
  port: 443,
  path: '/emails',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
  });
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();
