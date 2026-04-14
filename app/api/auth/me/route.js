import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { doc, getDoc, docToObj } from '@/lib/firestore';
import { db } from '@/lib/firebase';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userSnap = await getDoc(doc(db, 'users', user.id));

    if (!userSnap.exists()) {
      const { clearAuthCookie } = await import('@/lib/auth');
      await clearAuthCookie();
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const dbUser = docToObj(userSnap);

    return NextResponse.json({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        onboarded: dbUser.onboarded,
      },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Auth check failed' }, { status: 500 });
  }
}
