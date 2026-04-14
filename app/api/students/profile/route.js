import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { doc, getDoc, updateDoc, docToObj } from '@/lib/firestore';
import { db } from '@/lib/firebase';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const profileSnap = await getDoc(doc(db, 'studentProfiles', user.id));
    if (!profileSnap.exists()) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const profile = docToObj(profileSnap);

    return NextResponse.json({
      ...profile,
      subjects: profile.subjects || [],
    });
  } catch (error) {
    console.error('Get student profile error:', error);
    return NextResponse.json({ error: 'Failed to get profile' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();

    await updateDoc(doc(db, 'studentProfiles', user.id), {
      name: data.name || '',
      age: data.age || null,
      grade: data.grade || '',
      school: data.school || '',
      zip_code: data.zip_code || '',
      format_pref: data.format_pref || 'online',
      subjects: data.subjects || [],
      photo_url: data.photo_url || '',
    });

    await updateDoc(doc(db, 'users', user.id), { onboarded: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update student profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
