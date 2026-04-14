import { NextResponse } from 'next/server';
import { getCurrentUser, verifyPassword } from '@/lib/auth';
import { doc, getDoc, docToObj } from '@/lib/firestore';
import { db } from '@/lib/firebase';

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { password } = await request.json();
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const userSnap = await getDoc(doc(db, 'users', user.id));

    if (!userSnap.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const storedUser = docToObj(userSnap);
    const isValid = await verifyPassword(password, storedUser.password_hash);

    if (isValid) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }
  } catch (error) {
    console.error('Verify password error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
