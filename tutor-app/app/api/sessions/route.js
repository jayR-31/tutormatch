import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();

    // Get all accepted upcoming sessions for the user
    // Join with student/tutor profiles to get the OTHER person's name
    const sessions = db.prepare(`
      SELECT s.*, 
        CASE WHEN s.sender_id = ? THEN receiver_tp.name ELSE sender_tp.name END as tutor_name,
        CASE WHEN s.sender_id = ? THEN receiver_sp.name ELSE sender_sp.name END as student_name
      FROM sessions s
      LEFT JOIN tutor_profiles sender_tp ON s.sender_id = sender_tp.user_id
      LEFT JOIN tutor_profiles receiver_tp ON s.receiver_id = receiver_tp.user_id
      LEFT JOIN student_profiles sender_sp ON s.sender_id = sender_sp.user_id
      LEFT JOIN student_profiles receiver_sp ON s.receiver_id = receiver_sp.user_id
      WHERE (s.sender_id = ? OR s.receiver_id = ?) 
        AND s.status = 'accepted'
      ORDER BY s.date ASC, s.time ASC
    `).all(user.id, user.id, user.id, user.id);

    // Format the names correctly based on role
    const formattedSessions = sessions.map(s => {
      const otherUserIsReceiver = s.sender_id === user.id;
      const otherId = otherUserIsReceiver ? s.receiver_id : s.sender_id;
      // If I am a student, the other person is a tutor, so their name is in tutor_name
      // If I am a tutor, the other person is a student, so their name is in student_name
      return {
        ...s,
        other_name: user.role === 'student' ? s.tutor_name : s.student_name,
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

    const { receiverId, date, time, duration_minutes, format } = await request.json();

    if (!receiverId || !date || !time || !duration_minutes || !format) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = getDb();

    // Get conversation id
    let studentId, tutorId;
    if (user.role === 'student') {
      studentId = user.id;
      tutorId = receiverId;
    } else {
      studentId = receiverId;
      tutorId = user.id;
    }

    let conversation = db.prepare(
      'SELECT id FROM conversations WHERE student_id = ? AND tutor_id = ?'
    ).get(studentId, tutorId);

    if (!conversation) {
      const result = db.prepare(
        'INSERT INTO conversations (student_id, tutor_id) VALUES (?, ?)'
      ).run(studentId, tutorId);
      conversation = { id: result.lastInsertRowid };
    }

    // Insert session
    const sessionResult = db.prepare(`
      INSERT INTO sessions (conversation_id, sender_id, receiver_id, date, time, duration_minutes, format) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(conversation.id, user.id, receiverId, date, time, duration_minutes, format);

    const sessionId = sessionResult.lastInsertRowid;

    // Insert message of type 'proposal'
    const content = `Proposed a ${duration_minutes}-minute ${format} session on ${date} at ${time}.`;
    db.prepare(`
      INSERT INTO messages (conversation_id, sender_id, content, type, reference_id) 
      VALUES (?, ?, ?, 'proposal', ?)
    `).run(conversation.id, user.id, content, sessionId);

    // Update conversation last message time
    db.prepare('UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?').run(conversation.id);

    return NextResponse.json({ success: true, sessionId });
  } catch (error) {
    console.error('Create session error:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
