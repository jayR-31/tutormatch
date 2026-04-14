import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { doc, getDoc, updateDoc, docToObj } from '@/lib/firestore';
import { db } from '@/lib/firebase';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const profileSnap = await getDoc(doc(db, 'tutorProfiles', user.id));
    if (!profileSnap.exists()) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const profile = docToObj(profileSnap);

    return NextResponse.json({
      ...profile,
      subjects: profile.subjects || [],
      grade_levels: profile.grade_levels || [],
    });
  } catch (error) {
    console.error('Get tutor profile error:', error);
    return NextResponse.json({ error: 'Failed to get profile' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();

    await updateDoc(doc(db, 'tutorProfiles', user.id), {
      name: data.name || '',
      age: data.age || null,
      zip_code: data.zip_code || '',
      subjects: data.subjects || [],
      skills: data.skills || '',
      format_type: data.format_type || 'online',
      bio: data.bio || '',
      photo_url: data.photo_url || '',
      grade_levels: data.grade_levels || [],
    });

    await updateDoc(doc(db, 'users', user.id), { onboarded: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update tutor profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
