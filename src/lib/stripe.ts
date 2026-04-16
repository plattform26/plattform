import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY === 'sk_test_mock_secret_key') {
  console.error('❌ FATAL: STRIPE_SECRET_KEY no configurada correctamente en .env');
  // En producción esto debería fallar estrepitosamente para evitar comportamientos erráticos
}

export const stripe = new Stripe(STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-03-25.dahlia',
  appInfo: {
    name: 'Plattform',
    version: '0.1.0',
  },
});
