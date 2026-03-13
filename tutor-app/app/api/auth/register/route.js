import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password, role } = await request.json();

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Email, password, and role are required' }, { status: 400 });
    }

    if (!['student', 'tutor'].includes(role)) {
      return NextResponse.json({ error: 'Role must be student or tutor' }, { status: 400 });
    }

    const db = getDb();

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const password_hash = await hashPassword(password);
    const result = db.prepare(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)'
    ).run(email, password_hash, role);

    const user = { id: result.lastInsertRowid, email, role };

    // Create empty profile
    if (role === 'student') {
      db.prepare('INSERT INTO student_profiles (user_id) VALUES (?)').run(user.id);
    } else {
      db.prepare('INSERT INTO tutor_profiles (user_id) VALUES (?)').run(user.id);
    }

    const token = createToken(user);
    await setAuthCookie(token);

    return NextResponse.json({ user, redirect: `/${role}/onboarding` });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
