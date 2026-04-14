import { NextResponse } from 'next/server';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';
import ztz from 'zipcode-to-timezone';
import {
  usersCol,
  tutorProfilesCol,
  studentProfilesCol,
  addDoc,
  getDocs,
  query,
  where,
  setDoc,
  doc,
} from '@/lib/firestore';
import { db } from '@/lib/firebase';

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

    // Check if email already exists
    const existingQuery = query(usersCol(), where('email', '==', email));
    const existingSnap = await getDocs(existingQuery);
    if (!existingSnap.empty) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const password_hash = await hashPassword(password);

    // Create user document
    const userDoc = await addDoc(usersCol(), {
      email,
      password_hash,
      role,
      zip_code: zipCode,
      timezone,
      onboarded: false,
      created_at: new Date().toISOString(),
    });

    const user = { id: userDoc.id, email, role };

    // Create empty profile with zip code, using same ID as user doc
    if (role === 'student') {
      await setDoc(doc(db, 'studentProfiles', userDoc.id), {
        user_id: userDoc.id,
        name: '',
        age: null,
        grade: '',
        school: '',
        zip_code: zipCode,
        format_pref: 'online',
        subjects: [],
        photo_url: '',
      });
    } else {
      await setDoc(doc(db, 'tutorProfiles', userDoc.id), {
        user_id: userDoc.id,
        name: '',
        age: null,
        zip_code: zipCode,
        subjects: [],
        skills: '',
        format_type: 'online',
        bio: '',
        photo_url: '',
        grade_levels: [],
      });
    }

    const token = createToken(user);
    await setAuthCookie(token);

    return NextResponse.json({ user, redirect: `/${role}/onboarding` });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
