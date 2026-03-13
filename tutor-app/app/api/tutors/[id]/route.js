import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const db = getDb();

    const tutor = db.prepare(`
      SELECT tp.*, u.email FROM tutor_profiles tp
      JOIN users u ON tp.user_id = u.id
      WHERE tp.user_id = ?
    `).get(id);

    if (!tutor) {
      return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...tutor,
      subjects: JSON.parse(tutor.subjects || '[]'),
      grade_levels: JSON.parse(tutor.grade_levels || '[]'),
    });
  } catch (error) {
    console.error('Get tutor error:', error);
    return NextResponse.json({ error: 'Failed to get tutor' }, { status: 500 });
  }
}
