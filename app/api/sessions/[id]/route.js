import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { status } = await request.json();

    if (!['accepted', 'declined'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const db = getDb();

    // Check if session exists and user is the receiver
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.receiver_id !== user.id) {
       return NextResponse.json({ error: 'Only the receiver can accept or decline' }, { status: 403 });
    }

    // Update status
    db.prepare('UPDATE sessions SET status = ? WHERE id = ?').run(status, id);

    // Insert a system message letting the channel know
    const content = status === 'accepted' ? 'Session proposal was accepted.' : 'Session proposal was declined.';
    db.prepare(`
      INSERT INTO messages (conversation_id, sender_id, content, type) 
      VALUES (?, ?, ?, 'text')
    `).run(session.conversation_id, user.id, content);
    
    db.prepare('UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?').run(session.conversation_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update session error:', error);
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}
