import { NextResponse } from 'next/server';
import { doc, updateDoc, getDocs, query, where } from '@/lib/firestore';
import { usersCol } from '@/lib/firestore';
import { db } from '@/lib/firebase';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
      case 'customer.subscription.deleted':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Find user by stripe_customer_id
        const userQuery = query(usersCol(), where('stripe_customer_id', '==', customerId));
        const userSnap = await getDocs(userQuery);

        if (!userSnap.empty) {
          const userDoc = userSnap.docs[0];
          const isActive = subscription.status === 'active';

          await updateDoc(doc(db, 'users', userDoc.id), {
            subscribed: isActive,
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
