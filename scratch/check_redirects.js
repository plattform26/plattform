const https = require('https');
const http = require('http');

const testUrls = [
  'http://plattform.mx',
  'http://www.plattform.mx',
  'https://www.plattform.mx',
  'https://plattform.mx',
  'https://www.plattform.mx/plataforma-de-cursos-online',
  'https://plattform.mx/plataforma-de-cursos-online'
];

function checkHeaders(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      resolve({
        url,
        status: res.statusCode,
        location: res.headers.location || 'None',
        contentType: res.headers['content-type'] || 'None',
        server: res.headers.server || 'None'
      });
    }).on('error', (err) => {
      resolve({
        url,
        status: 500,
        error: err.message
      });
    });
  });
}

async function run() {
  for (const url of testUrls) {
    const res = await checkHeaders(url);
    console.log(JSON.stringify(res, null, 2));
  }
}

run();
