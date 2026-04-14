import { NextResponse } from 'next/server';
import { createToken, setAuthCookie } from '@/lib/auth';
import { hashPassword } from '@/lib/auth';
import {
  usersCol,
  getDocs,
  query,
  where,
  addDoc,
  setDoc,
  doc,
} from '@/lib/firestore';
import { db } from '@/lib/firebase';

export async function POST(request) {
  try {
    const { email, displayName, uid, role, zipCode } = await request.json();

    if (!email || !uid) {
      return NextResponse.json({ error: 'Email and uid are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingQuery = query(usersCol(), where('email', '==', email));
    const existingSnap = await getDocs(existingQuery);

    let user;
    let isNewUser = false;

    if (!existingSnap.empty) {
      // Existing user — log them in
      const userDoc = existingSnap.docs[0];
      const userData = userDoc.data();
      user = { id: userDoc.id, email: userData.email, role: userData.role };

      const redirect = userData.onboarded
        ? `/${userData.role}/dashboard`
        : `/${userData.role}/onboarding`;

      const token = createToken(user);
      await setAuthCookie(token);

      return NextResponse.json({ user, redirect });
    } else {
      // New user — register them
      const userRole = role || 'student';
      const userZip = zipCode || '';
      isNewUser = true;

      // Create a random password hash for Google users (they won't use it)
      const randomPassword = `google_${uid}_${Date.now()}`;
      const password_hash = await hashPassword(randomPassword);

      const userDoc = await addDoc(usersCol(), {
        email,
        password_hash,
        role: userRole,
        zip_code: userZip,
        timezone: '',
        onboarded: false,
        google_uid: uid,
        created_at: new Date().toISOString(),
      });

      user = { id: userDoc.id, email, role: userRole };

      // Create empty profile
      if (userRole === 'student') {
        await setDoc(doc(db, 'studentProfiles', userDoc.id), {
          user_id: userDoc.id,
          name: displayName || '',
          age: null,
          grade: '',
          school: '',
          zip_code: userZip,
          format_pref: 'online',
          subjects: [],
          photo_url: '',
        });
      } else {
        await setDoc(doc(db, 'tutorProfiles', userDoc.id), {
          user_id: userDoc.id,
          name: displayName || '',
          age: null,
          zip_code: userZip,
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

      return NextResponse.json({ user, redirect: `/${userRole}/onboarding` });
    }
  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.json({ error: 'Google authentication failed' }, { status: 500 });
  }
}
