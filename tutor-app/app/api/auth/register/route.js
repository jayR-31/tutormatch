import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';
import ztz from 'zipcode-to-timezone';

export async function POST(request) {
  try {
    const { email, password, role, zipCode } = await request.json();

    if (!email || !password || !role || !zipCode) {
      return NextResponse.json({ error: 'Email, password, role, and zip code are required' }, { status: 400 });
    }

    if (!['student', 'tutor'].includes(role)) {
      return NextResponse.json({ error: 'Role must be student or tutor' }, { status: 400 });
    }

    const timezone = ztz.lookup(zipCode) || 'UTC';
    const db = getDb();

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const password_hash = await hashPassword(password);
    const result = db.prepare(
      'INSERT INTO users (email, password_hash, role, zip_code, timezone) VALUES (?, ?, ?, ?, ?)'
    ).run(email, password_hash, role, zipCode, timezone);

    const user = { id: result.lastInsertRowid, email, role };

    // Create empty profile with zip code
    if (role === 'student') {
      db.prepare('INSERT INTO student_profiles (user_id, zip_code) VALUES (?, ?)').run(user.id, zipCode);
    } else {
      db.prepare('INSERT INTO tutor_profiles (user_id, zip_code) VALUES (?, ?)').run(user.id, zipCode);
    }

    const token = createToken(user);
    await setAuthCookie(token);

    return NextResponse.json({ user, redirect: `/${role}/onboarding` });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
