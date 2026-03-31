import { NextResponse } from 'next/server';
import { getCurrentUser, verifyPassword } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { password } = await request.json();
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const db = getDb();
    const storedUser = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(user.id);
    
    if (!storedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

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
