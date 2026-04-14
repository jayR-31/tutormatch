import { NextResponse } from 'next/server';
import {
  usersCol,
  tutorProfilesCol,
  getDocs,
  query,
  where,
  queryToArray,
  docToObj,
} from '@/lib/firestore';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const zip = searchParams.get('zip') || '';
    const subject = searchParams.get('subject') || '';
    const grade = searchParams.get('grade') || '';
    const format = searchParams.get('format') || '';

    // Get all onboarded users
    const usersQuery = query(usersCol(), where('onboarded', '==', true), where('role', '==', 'tutor'));
    const usersSnap = await getDocs(usersQuery);
    const onboardedUserIds = new Set(usersSnap.docs.map(d => d.id));
    const userEmailMap = {};
    usersSnap.docs.forEach(d => {
      userEmailMap[d.id] = d.data().email;
    });

    // Get all tutor profiles
    const profilesSnap = await getDocs(tutorProfilesCol());
    let tutors = profilesSnap.docs
      .filter(d => onboardedUserIds.has(d.id))
      .map(d => ({
        ...docToObj(d),
        email: userEmailMap[d.id] || '',
      }));

    // Apply filters client-side (Firestore doesn't support LIKE queries)
    if (zip) {
      tutors = tutors.filter(t => t.zip_code === zip);
    }

    if (subject) {
      tutors = tutors.filter(t =>
        (t.subjects || []).some(s =>
          s.toLowerCase().includes(subject.toLowerCase())
        )
      );
    }

    if (grade) {
      tutors = tutors.filter(t =>
        (t.grade_levels || []).some(g =>
          g.toLowerCase().includes(grade.toLowerCase())
        )
      );
    }

    if (format && format !== 'all') {
      tutors = tutors.filter(t => {
        if (format === 'online') return t.format_type === 'online' || t.format_type === 'both';
        if (format === 'in-person') return t.format_type === 'in-person' || t.format_type === 'both';
        return true;
      });
    }

    // Sort by name
    tutors.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    return NextResponse.json(tutors);
  } catch (error) {
    console.error('Search tutors error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
