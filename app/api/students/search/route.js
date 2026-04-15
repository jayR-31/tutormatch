import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { collection, getDocs, getDoc, doc, docToObj } from '@/lib/firestore';

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Only tutors can browse students
    const userSnap = await getDoc(doc(db, 'users', user.id));
    if (!userSnap.exists() || userSnap.data().role !== 'tutor') {
      return NextResponse.json({ error: 'Only tutors can browse students' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const subjectFilter = searchParams.get('subject');
    const gradeFilter = searchParams.get('grade');
    const nameFilter = searchParams.get('name');

    // Get all student profiles
    const profilesSnap = await getDocs(collection(db, 'studentProfiles'));
    const students = [];

    for (const profileDoc of profilesSnap.docs) {
      const profile = docToObj(profileDoc);

      // Filter by subject
      if (subjectFilter && !(profile.subjects || []).includes(subjectFilter)) continue;

      // Filter by grade
      if (gradeFilter && profile.grade !== gradeFilter) continue;

      // Filter by name
      if (nameFilter && !(profile.name || '').toLowerCase().includes(nameFilter.toLowerCase())) continue;

      // Only include students who have completed onboarding (have a name)
      if (!profile.name) continue;

      students.push({
        id: profile.id,
        name: profile.name,
        grade: profile.grade || '',
        school: profile.school || '',
        subjects: profile.subjects || [],
        format_pref: profile.format_pref || 'online',
        zip_code: profile.zip_code || '',
      });
    }

    return NextResponse.json(students);
  } catch (error) {
    console.error('Student search error:', error);
    return NextResponse.json({ error: 'Failed to search students' }, { status: 500 });
  }
}
