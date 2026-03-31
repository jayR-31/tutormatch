import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();

    // Get conversations user is a participant of
    const conversations = db.prepare(`
      SELECT c.*,
        CASE 
          WHEN c.is_group = 1 THEN c.name 
          ELSE (
            SELECT name FROM (
              SELECT name FROM student_profiles sp JOIN conversation_participants cp ON sp.user_id = cp.user_id WHERE cp.conversation_id = c.id AND cp.user_id != ?
              UNION
              SELECT name FROM tutor_profiles tp JOIN conversation_participants cp ON tp.user_id = cp.user_id WHERE cp.conversation_id = c.id AND cp.user_id != ?
            ) LIMIT 1
          )
        END as other_name,
        (SELECT user_id FROM conversation_participants WHERE conversation_id = c.id AND user_id != ? LIMIT 1) as other_id,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ? AND read = 0) as unread_count
      FROM conversations c
      JOIN conversation_participants cp_me ON c.id = cp_me.conversation_id
      WHERE cp_me.user_id = ?
      ORDER BY c.last_message_at DESC
    `).all(user.id, user.id, user.id, user.id, user.id);

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

    const { receiverId, participantIds, content, name, isGroup, conversationId: reqConvId } = await request.json();

    if (!content || (!receiverId && !participantIds && !reqConvId)) {
      return NextResponse.json({ error: 'Content and participants or conversationId required' }, { status: 400 });
    }

    const db = getDb();
    let conversationId = reqConvId;

    if (conversationId) {
      // Verify user is a participant
      const participant = db.prepare(
        'SELECT id FROM conversation_participants WHERE conversation_id = ? AND user_id = ?'
      ).get(conversationId, user.id);
      
      if (!participant) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    } else if (isGroup || participantIds) {
      // Create new group chat
      const allParticipants = [...new Set([...(participantIds || []), user.id])];
      const result = db.prepare(
        'INSERT INTO conversations (is_group, name) VALUES (1, ?)'
      ).run(name || 'Group Chat');
      conversationId = result.lastInsertRowid;

      const insertPart = db.prepare('INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)');
      for (const pid of allParticipants) {
        insertPart.run(conversationId, pid);
      }
    } else {
      // 1-to-1 conversation
      // Find existing
      const existing = db.prepare(`
        SELECT cp1.conversation_id FROM conversation_participants cp1
        JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
        JOIN conversations c ON cp1.conversation_id = c.id
        WHERE c.is_group = 0 AND cp1.user_id = ? AND cp2.user_id = ?
      `).get(user.id, receiverId);

      if (existing) {
        conversationId = existing.conversation_id;
      } else {
        const student_id = user.role === 'student' ? user.id : receiverId;
        const tutor_id = user.role === 'tutor' ? user.id : receiverId;
        
        const createConv = db.transaction(() => {
          const result = db.prepare('INSERT INTO conversations (is_group, student_id, tutor_id) VALUES (0, ?, ?)').run(student_id, tutor_id);
          const newId = result.lastInsertRowid;
          db.prepare('INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)').run(newId, user.id);
          db.prepare('INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)').run(newId, receiverId);
          return newId;
        });
        
        conversationId = createConv();
      }
    }

    // Insert message
    db.prepare(
      'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)'
    ).run(conversationId, user.id, content);

    // Resolve receiverId for 1-on-1 if missing (for legacy logic like auto-payment)
    let targetReceiverId = receiverId;
    if (!targetReceiverId && conversationId) {
      const conv = db.prepare('SELECT is_group FROM conversations WHERE id = ?').get(conversationId);
      if (conv && !conv.is_group) {
        const other = db.prepare('SELECT user_id FROM conversation_participants WHERE conversation_id = ? AND user_id != ?').get(conversationId, user.id);
        targetReceiverId = other?.user_id;
      }
    }

    // Auto-payment simulation if tutor asks for money
    if (user.role === 'tutor' && targetReceiverId) {
      const moneyMatch = content.match(/\$(\d+(?:\.\d{2})?)/) || content.match(/(\d+(?:\.\d{2})?)\s*dollars/i);
      if (moneyMatch) {
        const amount = parseFloat(moneyMatch[1]);
        if (!isNaN(amount)) {
          const paidAmount = Math.max(0, amount - 15);
          const autoResponse = `[System Message] The student has sent a payment of $${paidAmount.toFixed(2)}.`;
          
          db.prepare(
            'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)'
          ).run(conversationId, targetReceiverId, autoResponse);
        }
      }
    }

    // Update last message time
    db.prepare(
      'UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(conversationId);

    return NextResponse.json({ success: true, conversationId: conversationId });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
