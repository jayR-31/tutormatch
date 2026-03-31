import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const profile = db.prepare('SELECT * FROM tutor_profiles WHERE user_id = ?').get(user.id);
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    return NextResponse.json({
      ...profile,
      subjects: JSON.parse(profile.subjects || '[]'),
      grade_levels: JSON.parse(profile.grade_levels || '[]'),
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
    const db = getDb();

    db.prepare(`
      UPDATE tutor_profiles SET
        name = ?, age = ?, zip_code = ?, subjects = ?, skills = ?,
        format_type = ?, bio = ?, photo_url = ?, grade_levels = ?
      WHERE user_id = ?
    `).run(
      data.name || '',
      data.age || null,
      data.zip_code || '',
      JSON.stringify(data.subjects || []),
      data.skills || '',
      data.format_type || 'online',
      data.bio || '',
      data.photo_url || '',
      JSON.stringify(data.grade_levels || []),
      user.id
    );

    db.prepare('UPDATE users SET onboarded = 1 WHERE id = ?').run(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update tutor profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
