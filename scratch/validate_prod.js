const https = require('https');

const urls = [
  'https://plattform.mx/plataforma-de-cursos-online',
  'https://plattform.mx/vender-cursos-online',
  'https://plattform.mx/lms-para-academias',
  'https://plattform.mx/plataforma-para-creadores',
  'https://plattform.mx/academia-digital',
  'https://plattform.mx/recursos',
  'https://plattform.mx/recursos/como-vender-cursos-online',
  'https://plattform.mx/recursos/que-es-un-lms',
  'https://plattform.mx/recursos/crear-academia-digital',
  'https://plattform.mx/recursos/errores-al-vender-cursos-online',
  'https://plattform.mx/recursos/plataforma-cursos-online-vs-whatsapp-drive-zoom'
];

function fetchPage(url, depth = 0) {
  if (depth > 5) {
    return Promise.resolve({
      status: 500,
      html: '',
      error: 'Demasiadas redirecciones'
    });
  }
  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          const u = new URL(url);
          redirectUrl = u.origin + redirectUrl;
        }
        resolve(fetchPage(redirectUrl, depth + 1).then(r => ({
          ...r,
          redirectedFrom: url,
          originalStatus: res.statusCode
        })));
        return;
      }
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          html: data
        });
      });
    }).on('error', (err) => {
      resolve({
        status: 500,
        html: '',
        error: err.message
      });
    });
  });
}

function extractTag(html, regex) {
  const match = html.match(regex);
  if (match && match[1]) {
    return match[1].trim().replace(/\s+/g, ' ');
  }
  return 'N/A';
}

function extractJsonLd(html) {
  const regex = /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let match;
  const list = [];
  while ((match = regex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      list.push(parsed);
    } catch (e) {
      list.push({ error: 'Invalid JSON', raw: match[1] });
    }
  }
  return list;
}

async function validate() {
  // First fetch sitemap to verify sitemap presence
  const sitemapRes = await fetchPage('https://plattform.mx/sitemap.xml');
  const sitemapHtml = sitemapRes.html;

  console.log('| URL | Status HTTP | Title | H1 | Canonical | En Sitemap | Observaciones |');
  console.log('|---|---|---|---|---|---|---|');

  for (const url of urls) {
    const res = await fetchPage(url);
    if (res.status !== 200) {
      console.log(`| ${url} | ${res.status} | N/A | N/A | N/A | N/A | Error al acceder a la URL: ${res.error || 'Status ' + res.status} |`);
      continue;
    }

    const html = res.html;

    // Extract title
    const title = extractTag(html, /<title>([\s\S]*?)<\/title>/i);

    // Extract H1 (first H1)
    const h1 = extractTag(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);

    // Extract canonical link
    const canonical = extractTag(html, /<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i) || extractTag(html, /href="([^"]+)"[^>]*rel="canonical"/i);

    // Check presence in sitemap
    const inSitemap = sitemapHtml.includes(`<loc>${url}</loc>`) ? 'Sí' : 'No';

    const observations = [];

    // Check gratis language
    const gratisWords = ['gratis', 'gratuito', 'sin costo', 'prueba gratis', 'cuenta gratis', 'academia gratis', 'starter gratis'];
    const foundGratis = [];
    const textOnly = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ');
    for (const word of gratisWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      if (regex.test(textOnly)) {
        foundGratis.push(word);
      }
    }
    // Also check for specific phrases in lower case
    if (html.toLowerCase().includes('gratis') && !url.includes('whatsapp-drive-zoom')) {
      // Allow student checkouts/audit occurrences if they exist in main code, but let's see if it's in this landing HTML
      // Let's filter out standard "gratis" check if it is part of the layout (like preview gratis for students, if any, but let's check)
      const matches = html.match(/gratis|gratuito|sin costo/gi);
      if (matches) {
        foundGratis.push(...matches);
      }
    }

    if (foundGratis.length > 0) {
      observations.push(`⚠️ Menciones gratuidad: [${[...new Set(foundGratis)].join(', ')}]`);
    } else {
      observations.push('✓ Sin menciones de gratuidad');
    }

    // Check JSON-LD
    const jsonLds = extractJsonLd(html);
    if (jsonLds.length === 0) {
      observations.push('⚠️ Falta JSON-LD');
    } else {
      let jsonLdValid = true;
      let priceMatch = true;
      for (const js of jsonLds) {
        if (js.error) {
          jsonLdValid = false;
          observations.push(`⚠️ JSON-LD inválido: ${js.error}`);
        } else {
          // Check offer price if present
          const checkPrice = (obj) => {
            if (obj && typeof obj === 'object') {
              if (obj.price !== undefined) {
                if (parseFloat(obj.price) === 0) {
                  priceMatch = false;
                }
              }
              for (const k in obj) {
                checkPrice(obj[k]);
              }
            }
          };
          checkPrice(js);
        }
      }
      if (jsonLdValid) {
        observations.push('✓ JSON-LD válido');
      }
      if (!priceMatch) {
        observations.push('⚠️ Precio JSON-LD en 0.00');
      }
    }

    // Check CTAs
    if (url.includes('/recursos')) {
      if (html.includes('href="/') || html.includes('href="https://plattform.mx/')) {
        observations.push('✓ CTAs enlazados');
      } else {
        observations.push('⚠️ CTAs no enlazados');
      }
    } else {
      if (html.includes('href="/register') || html.includes('href="https://plattform.mx/register')) {
        observations.push('✓ CTAs enlazados');
      } else {
        observations.push('⚠️ CTAs no enlazados');
      }
    }

    // Indexable content check
    const charCount = textOnly.replace(/\s+/g, '').length;
    if (charCount > 500) {
      observations.push(`✓ Indexable (${charCount} caracteres)`);
    } else {
      observations.push(`⚠️ Poco contenido (${charCount} caracteres)`);
    }

    const statusStr = res.originalStatus ? `${res.status} (Redir ${res.originalStatus})` : `${res.status}`;
    console.log(`| [${url.replace('https://plattform.mx', '')}](${url}) | ${statusStr} | \`${title}\` | \`${h1}\` | \`${canonical}\` | ${inSitemap} | ${observations.join('; ')} |`);
  }
}

validate();
