import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { doc, updateDoc } from '@/lib/firestore';
import { db } from '@/lib/firebase';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.redirect(new URL('/tutor/subscription', request.url));
    }

    // Verify the checkout session with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.redirect(new URL('/tutor/subscription', request.url));
    }

    const userId = session.client_reference_id || session.metadata?.userId;

    if (userId) {
      // Mark user as subscribed in Firestore
      await updateDoc(doc(db, 'users', userId), {
        subscribed: true,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        subscribed_at: new Date().toISOString(),
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    return NextResponse.redirect(`${baseUrl}/tutor/dashboard`);
  } catch (error) {
    console.error('Stripe success error:', error);
    return NextResponse.redirect(new URL('/tutor/subscription', request.url));
  }
}
