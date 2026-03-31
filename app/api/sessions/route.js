import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();

    // Get all accepted upcoming sessions for the user
    const sessions = db.prepare(`
      SELECT s.*, 
        c.name as group_name,
        CASE WHEN s.is_group = 1 THEN c.name 
             WHEN s.sender_id = ? THEN receiver_tp.name ELSE sender_tp.name END as tutor_name,
        CASE WHEN s.is_group = 1 THEN 'Group'
             WHEN s.sender_id = ? THEN receiver_sp.name ELSE sender_sp.name END as student_name
      FROM sessions s
      JOIN conversations c ON s.conversation_id = c.id
      JOIN conversation_participants cp ON c.id = cp.conversation_id
      LEFT JOIN tutor_profiles sender_tp ON s.sender_id = sender_tp.user_id
      LEFT JOIN tutor_profiles receiver_tp ON s.receiver_id = receiver_tp.user_id
      LEFT JOIN student_profiles sender_sp ON s.sender_id = sender_sp.user_id
      LEFT JOIN student_profiles receiver_sp ON s.receiver_id = receiver_sp.user_id
      WHERE cp.user_id = ? 
        AND s.status = 'accepted'
      ORDER BY s.date ASC, s.time ASC
    `).all(user.id, user.id, user.id);

    // Format the names correctly based on role
    const formattedSessions = sessions.map(s => {
      let other_name;
      if (s.is_group) {
        other_name = s.group_name || 'Group Session';
      } else {
        other_name = user.role === 'student' ? s.tutor_name : s.student_name;
      }
      
      const otherId = s.sender_id === user.id ? s.receiver_id : s.sender_id;

      return {
        ...s,
        other_name,
        other_id: otherId
      };
    });

    return NextResponse.json(formattedSessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json({ error: 'Failed to get sessions' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { receiverId, conversationId: reqConvId, date, time, duration_minutes, format, subjects, isGroup } = await request.json();

    if ((!receiverId && !reqConvId) || !date || !time || !duration_minutes || !format) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = getDb();

    // Get conversation id
    let conversationId = reqConvId;
    if (!conversationId) {
      // Find or create 1-to-1 conversation
      const existing = db.prepare(`
        SELECT conversation_id FROM conversation_participants cp1
        JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
        JOIN conversations c ON cp1.conversation_id = c.id
        WHERE c.is_group = 0 AND cp1.user_id = ? AND cp2.user_id = ?
      `).get(user.id, receiverId);

      if (existing) {
        conversationId = existing.conversation_id;
      } else {
        const result = db.prepare('INSERT INTO conversations (is_group) VALUES (0)').run();
        conversationId = result.lastInsertRowid;
        db.prepare('INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)').run(conversationId, user.id);
        db.prepare('INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)').run(conversationId, receiverId);
      }
    }

    // Insert session
    const sessionResult = db.prepare(`
      INSERT INTO sessions (conversation_id, sender_id, receiver_id, is_group, date, time, duration_minutes, format, subjects) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(conversationId, user.id, isGroup ? null : receiverId, isGroup ? 1 : 0, date, time, duration_minutes, format, JSON.stringify(subjects || []));

    const sessionId = sessionResult.lastInsertRowid;

    // Insert message of type 'proposal'
    const subjectsList = subjects && subjects.length > 0 ? ` for ${subjects.join(', ')}` : '';
    const content = `Proposed a ${duration_minutes}-minute ${format} session on ${date} at ${time}${subjectsList}.`;
    db.prepare(`
      INSERT INTO messages (conversation_id, sender_id, content, type, reference_id) 
      VALUES (?, ?, ?, 'proposal', ?)
    `).run(conversationId, user.id, content, sessionId);

    // Update conversation last message time
    db.prepare('UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?').run(conversationId);

    return NextResponse.json({ success: true, sessionId });
  } catch (error) {
    console.error('Create session error:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
