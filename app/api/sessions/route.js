import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  docToObj,
} from '@/lib/firestore';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get all accepted sessions
    const sessionsQuery = query(
      collection(db, 'sessions'),
      where('status', '==', 'accepted'),
      orderBy('date', 'asc')
    );
    const sessionsSnap = await getDocs(sessionsQuery);

    const sessions = [];

    for (const sessionDoc of sessionsSnap.docs) {
      const session = docToObj(sessionDoc);

      // Check if user is a participant in the conversation
      const partSnap = await getDoc(doc(db, 'conversations', session.conversation_id, 'participants', user.id));
      if (!partSnap.exists()) continue;

      // Get names
      let otherName = 'Unknown';
      let otherId = session.sender_id === user.id ? session.receiver_id : session.sender_id;

      if (session.is_group) {
        const convSnap = await getDoc(doc(db, 'conversations', session.conversation_id));
        otherName = convSnap.exists() ? (convSnap.data().name || 'Group Session') : 'Group Session';
      } else if (otherId) {
        if (user.role === 'student') {
          const tutorSnap = await getDoc(doc(db, 'tutorProfiles', otherId));
          otherName = tutorSnap.exists() ? (tutorSnap.data().name || 'Unknown') : 'Unknown';
        } else {
          const studentSnap = await getDoc(doc(db, 'studentProfiles', otherId));
          otherName = studentSnap.exists() ? (studentSnap.data().name || 'Unknown') : 'Unknown';
        }
      }

      sessions.push({
        ...session,
        subjects: session.subjects || [],
        other_name: otherName,
        other_id: otherId,
      });
    }

    return NextResponse.json(sessions);
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

    let conversationId = reqConvId;

    if (!conversationId) {
      // Find existing 1-to-1 conversation
      const convsSnap = await getDocs(collection(db, 'conversations'));
      let found = false;

      for (const convDoc of convsSnap.docs) {
        const conv = convDoc.data();
        if (conv.is_group) continue;

        const partsSnap = await getDocs(collection(db, 'conversations', convDoc.id, 'participants'));
        const partIds = partsSnap.docs.map(d => d.id);

        if (partIds.includes(user.id) && partIds.includes(receiverId) && partIds.length === 2) {
          conversationId = convDoc.id;
          found = true;
          break;
        }
      }

      if (!found) {
        const convDoc = await addDoc(collection(db, 'conversations'), {
          is_group: false,
          last_message_at: new Date().toISOString(),
        });
        conversationId = convDoc.id;

        await setDoc(doc(db, 'conversations', conversationId, 'participants', user.id), {
          user_id: user.id,
          joined_at: new Date().toISOString(),
        });
        await setDoc(doc(db, 'conversations', conversationId, 'participants', receiverId), {
          user_id: receiverId,
          joined_at: new Date().toISOString(),
        });
      }
    }

    // Create session
    const sessionDoc = await addDoc(collection(db, 'sessions'), {
      conversation_id: conversationId,
      sender_id: user.id,
      receiver_id: isGroup ? null : receiverId,
      is_group: isGroup ? true : false,
      date,
      time,
      duration_minutes,
      format,
      subjects: subjects || [],
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    // Insert proposal message
    const subjectsList = subjects && subjects.length > 0 ? ` for ${subjects.join(', ')}` : '';
    const content = `Proposed a ${duration_minutes}-minute ${format} session on ${date} at ${time}${subjectsList}.`;

    await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
      conversation_id: conversationId,
      sender_id: user.id,
      content,
      type: 'proposal',
      reference_id: sessionDoc.id,
      read: false,
      created_at: new Date().toISOString(),
    });

    // Update conversation last message time
    await updateDoc(doc(db, 'conversations', conversationId), {
      last_message_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, sessionId: sessionDoc.id });
  } catch (error) {
    console.error('Create session error:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
