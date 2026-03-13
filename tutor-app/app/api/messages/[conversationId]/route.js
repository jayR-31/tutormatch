import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { conversationId } = await params;
    const db = getDb();

    // Verify user is part of conversation
    const conversation = db.prepare(
      'SELECT * FROM conversations WHERE id = ? AND (student_id = ? OR tutor_id = ?)'
    ).get(conversationId, user.id, user.id);

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Mark messages as read
    db.prepare(
      'UPDATE messages SET read = 1 WHERE conversation_id = ? AND sender_id != ?'
    ).run(conversationId, user.id);

    // Get messages
    const messages = db.prepare(`
      SELECT m.*, 
        CASE WHEN m.sender_id = sp.user_id THEN sp.name
             WHEN m.sender_id = tp.user_id THEN tp.name
             ELSE 'Unknown' END as sender_name,
        s.date as session_date,
        s.time as session_time,
        s.duration_minutes as session_duration,
        s.format as session_format,
        s.status as session_status
      FROM messages m
      LEFT JOIN student_profiles sp ON m.sender_id = sp.user_id
      LEFT JOIN tutor_profiles tp ON m.sender_id = tp.user_id
      LEFT JOIN sessions s ON m.reference_id = s.id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC
    `).all(conversationId);

    // Get other person's info
    const otherId = conversation.student_id === user.id ? conversation.tutor_id : conversation.student_id;
    const otherUser = db.prepare('SELECT role FROM users WHERE id = ?').get(otherId);
    let otherName = 'Unknown';
    if (otherUser?.role === 'tutor') {
      const tp = db.prepare('SELECT name FROM tutor_profiles WHERE user_id = ?').get(otherId);
      otherName = tp?.name || 'Unknown';
    } else {
      const sp = db.prepare('SELECT name FROM student_profiles WHERE user_id = ?').get(otherId);
      otherName = sp?.name || 'Unknown';
    }

    return NextResponse.json({
      messages,
      otherName,
      otherId,
      conversationId: conversation.id,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ error: 'Failed to get messages' }, { status: 500 });
  }
}
