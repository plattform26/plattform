import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    if (!process.env.STRIPE_CONNECT_ACCOUNT_ID) {
      return NextResponse.json({ error: 'STRIPE_CONNECT_ACCOUNT_ID no configurado' }, { status: 500 });
    }

    const accountLink = await stripe.accountLinks.create({
      account: process.env.STRIPE_CONNECT_ACCOUNT_ID,
      type: 'account_onboarding',
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/instructor/finances`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/instructor/finances?connected=true`,
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (err: any) {
    console.error('Stripe Connect Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
