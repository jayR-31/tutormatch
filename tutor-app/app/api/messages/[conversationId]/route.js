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
    const participant = db.prepare(
      'SELECT id FROM conversation_participants WHERE conversation_id = ? AND user_id = ?'
    ).get(conversationId, user.id);

    if (!participant) {
      return NextResponse.json({ error: 'Conversation not found or access denied' }, { status: 404 });
    }

    const conversation = db.prepare('SELECT * FROM conversations WHERE id = ?').get(conversationId);

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
        s.status as session_status,
        s.subjects as session_subjects
      FROM messages m
      LEFT JOIN student_profiles sp ON m.sender_id = sp.user_id
      LEFT JOIN tutor_profiles tp ON m.sender_id = tp.user_id
      LEFT JOIN sessions s ON m.reference_id = s.id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC
    `).all(conversationId);

    // Get other participants' info
    let otherName = 'Unknown';
    let otherId = null;

    if (conversation.is_group) {
      otherName = conversation.name || 'Group Chat';
    } else {
      const otherPart = db.prepare('SELECT user_id FROM conversation_participants WHERE conversation_id = ? AND user_id != ?').get(conversationId, user.id);
      if (otherPart) {
        otherId = otherPart.user_id;
        const otherUser = db.prepare('SELECT role FROM users WHERE id = ?').get(otherId);
        if (otherUser?.role === 'tutor') {
          const tp = db.prepare('SELECT name FROM tutor_profiles WHERE user_id = ?').get(otherId);
          otherName = tp?.name || 'Unknown';
        } else {
          const sp = db.prepare('SELECT name FROM student_profiles WHERE user_id = ?').get(otherId);
          otherName = sp?.name || 'Unknown';
        }
      }
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
