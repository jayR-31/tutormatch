import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  docToObj,
} from '@/lib/firestore';

export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { status } = await request.json();

    if (!['accepted', 'declined'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Check if session exists
    const sessionSnap = await getDoc(doc(db, 'sessions', id));
    if (!sessionSnap.exists()) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const session = docToObj(sessionSnap);

    if (session.is_group) {
      // Verify user is a participant in the conversation
      const partSnap = await getDoc(doc(db, 'conversations', session.conversation_id, 'participants', user.id));
      if (!partSnap.exists()) {
        return NextResponse.json({ error: 'Only participants can accept or decline' }, { status: 403 });
      }
    } else {
      if (session.receiver_id !== user.id) {
        return NextResponse.json({ error: 'Only the receiver can accept or decline' }, { status: 403 });
      }
    }

    // Update status
    await updateDoc(doc(db, 'sessions', id), { status });

    // Insert a system message
    const content = status === 'accepted' ? 'Session proposal was accepted.' : 'Session proposal was declined.';
    await addDoc(collection(db, 'conversations', session.conversation_id, 'messages'), {
      conversation_id: session.conversation_id,
      sender_id: user.id,
      content,
      type: 'text',
      reference_id: null,
      read: false,
      created_at: new Date().toISOString(),
    });

    await updateDoc(doc(db, 'conversations', session.conversation_id), {
      last_message_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update session error:', error);
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}
