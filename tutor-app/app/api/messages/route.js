import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();

    const conversations = db.prepare(`
      SELECT c.*,
        CASE WHEN c.student_id = ? THEN tp.name ELSE sp.name END as other_name,
        CASE WHEN c.student_id = ? THEN c.tutor_id ELSE c.student_id END as other_id,
        CASE WHEN c.student_id = ? THEN 'tutor' ELSE 'student' END as other_role,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ? AND read = 0) as unread_count
      FROM conversations c
      LEFT JOIN tutor_profiles tp ON c.tutor_id = tp.user_id
      LEFT JOIN student_profiles sp ON c.student_id = sp.user_id
      WHERE c.student_id = ? OR c.tutor_id = ?
      ORDER BY c.last_message_at DESC
    `).all(user.id, user.id, user.id, user.id, user.id, user.id);

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json({ error: 'Failed to get conversations' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { receiverId, content } = await request.json();

    if (!receiverId || !content) {
      return NextResponse.json({ error: 'Receiver and content required' }, { status: 400 });
    }

    const db = getDb();

    // Determine student_id and tutor_id
    const receiver = db.prepare('SELECT id, role FROM users WHERE id = ?').get(receiverId);
    if (!receiver) {
      return NextResponse.json({ error: 'Receiver not found' }, { status: 404 });
    }

    let studentId, tutorId;
    if (user.role === 'student') {
      studentId = user.id;
      tutorId = receiverId;
    } else {
      studentId = receiverId;
      tutorId = user.id;
    }

    // Find or create conversation
    let conversation = db.prepare(
      'SELECT * FROM conversations WHERE student_id = ? AND tutor_id = ?'
    ).get(studentId, tutorId);

    if (!conversation) {
      const result = db.prepare(
        'INSERT INTO conversations (student_id, tutor_id) VALUES (?, ?)'
      ).run(studentId, tutorId);
      conversation = { id: result.lastInsertRowid };
    }

    // Insert message
    db.prepare(
      'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)'
    ).run(conversation.id, user.id, content);

    // Auto-payment simulation if tutor asks for money
    if (user.role === 'tutor') {
      const moneyMatch = content.match(/\$(\d+(?:\.\d{2})?)/) || content.match(/(\d+(?:\.\d{2})?)\s*dollars/i);
      if (moneyMatch) {
        const amount = parseFloat(moneyMatch[1]);
        if (!isNaN(amount)) {
          const paidAmount = Math.max(0, amount - 15);
          const autoResponse = `[System Message] The student has sent a payment of $${paidAmount.toFixed(2)}.`;
          
          db.prepare(
            'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)'
          ).run(conversation.id, receiverId, autoResponse);
        }
      }
    }

    // Update last message time
    db.prepare(
      'UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(conversation.id);

    return NextResponse.json({ success: true, conversationId: conversation.id });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
