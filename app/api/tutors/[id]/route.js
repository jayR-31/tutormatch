import { NextResponse } from 'next/server';
import { doc, getDoc, docToObj } from '@/lib/firestore';
import { db } from '@/lib/firebase';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const profileSnap = await getDoc(doc(db, 'tutorProfiles', id));
    if (!profileSnap.exists()) {
      return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });
    }

    const profile = docToObj(profileSnap);

    // Get user email
    const userSnap = await getDoc(doc(db, 'users', id));
    const user = userSnap.exists() ? docToObj(userSnap) : {};

    return NextResponse.json({
      ...profile,
      email: user.email || '',
      subjects: profile.subjects || [],
      grade_levels: profile.grade_levels || [],
    });
  } catch (error) {
    console.error('Get tutor error:', error);
    return NextResponse.json({ error: 'Failed to get tutor' }, { status: 500 });
  }
}
