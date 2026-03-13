import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const profile = db.prepare('SELECT * FROM student_profiles WHERE user_id = ?').get(user.id);
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    return NextResponse.json({
      ...profile,
      subjects: JSON.parse(profile.subjects || '[]'),
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
    const db = getDb();

    db.prepare(`
      UPDATE student_profiles SET
        name = ?, age = ?, grade = ?, school = ?, zip_code = ?,
        format_pref = ?, subjects = ?, photo_url = ?
      WHERE user_id = ?
    `).run(
      data.name || '',
      data.age || null,
      data.grade || '',
      data.school || '',
      data.zip_code || '',
      data.format_pref || 'online',
      JSON.stringify(data.subjects || []),
      data.photo_url || '',
      user.id
    );

    // Mark as onboarded
    db.prepare('UPDATE users SET onboarded = 1 WHERE id = ?').run(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update student profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
