import { NextResponse } from 'next/server';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth';
import {
  usersCol,
  docToObj,
  getDocs,
  query,
  where,
} from '@/lib/firestore';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Find user by email
    const userQuery = query(usersCol(), where('email', '==', email));
    const userSnap = await getDocs(userQuery);

    if (userSnap.empty) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const userDoc = userSnap.docs[0];
    const user = docToObj(userDoc);

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = createToken({ id: user.id, email: user.email, role: user.role });
    await setAuthCookie(token);

    let redirect;
    if (!user.onboarded) {
      redirect = `/${user.role}/onboarding`;
    } else if (user.role === 'tutor' && !user.subscribed) {
      redirect = '/tutor/subscription';
    } else {
      redirect = `/${user.role}/dashboard`;
    }

    return NextResponse.json({
      user: { id: user.id, email: user.email, role: user.role },
      redirect,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
