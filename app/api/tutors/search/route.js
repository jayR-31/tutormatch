import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const zip = searchParams.get('zip') || '';
    const subject = searchParams.get('subject') || '';
    const grade = searchParams.get('grade') || '';
    const format = searchParams.get('format') || '';

    const db = getDb();

    let query = 'SELECT tp.*, u.email FROM tutor_profiles tp JOIN users u ON tp.user_id = u.id WHERE u.onboarded = 1';
    const params = [];

    if (zip) {
      query += ' AND tp.zip_code = ?';
      params.push(zip);
    }

    if (subject) {
      query += ' AND tp.subjects LIKE ?';
      params.push(`%${subject}%`);
    }

    if (grade) {
      query += ' AND tp.grade_levels LIKE ?';
      params.push(`%${grade}%`);
    }

    if (format && format !== 'all') {
      if (format === 'online') {
        query += " AND (tp.format_type = 'online' OR tp.format_type = 'both')";
      } else if (format === 'in-person') {
        query += " AND (tp.format_type = 'in-person' OR tp.format_type = 'both')";
      }
    }

    query += ' ORDER BY tp.name ASC';

    const tutors = db.prepare(query).all(...params);

    const result = tutors.map(t => ({
      ...t,
      subjects: JSON.parse(t.subjects || '[]'),
      grade_levels: JSON.parse(t.grade_levels || '[]'),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Search tutors error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
