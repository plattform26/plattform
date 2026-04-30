const { execSync } = require('child_process');
try {
  console.log('🔄 Ejecutando generación de favicons...');
  execSync('npx tsx scripts/generate-favicons.ts', { stdio: 'inherit' });
} catch (e) {
  console.error('⚠️ Fallo en la generación de favicons:', e.message);
}

/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development';

// Solo permitimos 'unsafe-eval' en desarrollo para el hot-reload de Next.js
const scriptSrc = isDev 
  ? "'self' 'unsafe-inline' 'unsafe-eval' js.stripe.com checkout.stripe.com"
  : "'self' 'unsafe-inline' js.stripe.com checkout.stripe.com";

const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  {
    // Content-Security-Policy en modo Report-Only para validación sin bloqueos
    key: 'Content-Security-Policy-Report-Only',
    value: `
      default-src 'self';
      script-src ${scriptSrc};
      connect-src 'self' *.supabase.co api.openai.com api.stripe.com;
      img-src 'self' *.supabase.co data: blob:;
      style-src 'self' 'unsafe-inline';
      frame-src 'self' js.stripe.com hooks.stripe.com;
      font-src 'self' data: fonts.gstatic.com;
      worker-src 'self' blob:;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
    `.replace(/\s{2,}/g, ' ').trim(),
  },
];

module.exports = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};