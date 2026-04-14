import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  docToObj,
} from '@/lib/firestore';

export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { conversationId } = await params;

    // Verify user is part of conversation
    const partSnap = await getDoc(doc(db, 'conversations', conversationId, 'participants', user.id));
    if (!partSnap.exists()) {
      return NextResponse.json({ error: 'Conversation not found or access denied' }, { status: 404 });
    }

    const convSnap = await getDoc(doc(db, 'conversations', conversationId));
    const conversation = convSnap.exists() ? docToObj(convSnap) : {};

    // Get all messages
    const msgsQuery = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('created_at', 'asc')
    );
    const msgsSnap = await getDocs(msgsQuery);

    // Build messages with sender names and session data
    const messages = [];
    for (const msgDoc of msgsSnap.docs) {
      const msg = docToObj(msgDoc);

      // Mark as read if not from current user
      if (msg.sender_id !== user.id && !msg.read) {
        await updateDoc(doc(db, 'conversations', conversationId, 'messages', msgDoc.id), {
          read: true,
        });
      }

      // Get sender name
      let senderName = 'Unknown';
      const tutorSnap = await getDoc(doc(db, 'tutorProfiles', msg.sender_id));
      if (tutorSnap.exists() && tutorSnap.data().name) {
        senderName = tutorSnap.data().name;
      } else {
        const studentSnap = await getDoc(doc(db, 'studentProfiles', msg.sender_id));
        if (studentSnap.exists() && studentSnap.data().name) {
          senderName = studentSnap.data().name;
        }
      }

      // Get linked session data if reference_id exists
      let sessionData = {};
      if (msg.reference_id) {
        const sessionSnap = await getDoc(doc(db, 'sessions', msg.reference_id));
        if (sessionSnap.exists()) {
          const session = sessionSnap.data();
          sessionData = {
            session_date: session.date,
            session_time: session.time,
            session_duration: session.duration_minutes,
            session_format: session.format,
            session_status: session.status,
            session_subjects: session.subjects,
          };
        }
      }

      messages.push({
        ...msg,
        sender_name: senderName,
        ...sessionData,
      });
    }

    // Get other participant info
    let otherName = 'Unknown';
    let otherId = null;

    if (conversation.is_group) {
      otherName = conversation.name || 'Group Chat';
    } else {
      const partsSnap = await getDocs(collection(db, 'conversations', conversationId, 'participants'));
      for (const partDoc of partsSnap.docs) {
        if (partDoc.id !== user.id) {
          otherId = partDoc.id;
          const tutorSnap = await getDoc(doc(db, 'tutorProfiles', partDoc.id));
          if (tutorSnap.exists() && tutorSnap.data().name) {
            otherName = tutorSnap.data().name;
          } else {
            const studentSnap = await getDoc(doc(db, 'studentProfiles', partDoc.id));
            if (studentSnap.exists() && studentSnap.data().name) {
              otherName = studentSnap.data().name;
            }
          }
          break;
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
