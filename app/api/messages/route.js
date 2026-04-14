import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  docToObj,
} from '@/lib/firestore';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get all conversations where user is a participant
    const convsSnap = await getDocs(collection(db, 'conversations'));
    const conversations = [];

    for (const convDoc of convsSnap.docs) {
      const conv = docToObj(convDoc);

      // Check if user is a participant
      const partSnap = await getDoc(doc(db, 'conversations', conv.id, 'participants', user.id));
      if (!partSnap.exists()) continue;

      // Get messages for this conversation
      const msgsQuery = query(
        collection(db, 'conversations', conv.id, 'messages'),
        orderBy('created_at', 'desc'),
        limit(1)
      );
      const msgsSnap = await getDocs(msgsQuery);
      const lastMessage = msgsSnap.empty ? '' : msgsSnap.docs[0].data().content;

      // Count unread messages
      const unreadQuery = query(
        collection(db, 'conversations', conv.id, 'messages'),
        where('sender_id', '!=', user.id),
        where('read', '==', false)
      );
      let unreadCount = 0;
      try {
        const unreadSnap = await getDocs(unreadQuery);
        unreadCount = unreadSnap.size;
      } catch {
        // Composite query may need index, fall back to 0
      }

      // Get other participant name
      let otherName = conv.name || 'Unknown';
      let otherId = null;

      if (!conv.is_group) {
        const partsSnap = await getDocs(collection(db, 'conversations', conv.id, 'participants'));
        for (const partDoc of partsSnap.docs) {
          if (partDoc.id !== user.id) {
            otherId = partDoc.id;
            // Try tutor profile first, then student
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

      conversations.push({
        id: conv.id,
        is_group: conv.is_group || false,
        name: conv.name || null,
        last_message_at: conv.last_message_at || '',
        other_name: otherName,
        other_id: otherId,
        last_message: lastMessage,
        unread_count: unreadCount,
      });
    }

    // Sort by last_message_at descending
    conversations.sort((a, b) => (b.last_message_at || '').localeCompare(a.last_message_at || ''));

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

    let conversationId = reqConvId;

    if (conversationId) {
      // Verify user is a participant
      const partSnap = await getDoc(doc(db, 'conversations', conversationId, 'participants', user.id));
      if (!partSnap.exists()) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    } else if (isGroup || participantIds) {
      // Create new group chat
      const allParticipants = [...new Set([...(participantIds || []), user.id])];
      const convDoc = await addDoc(collection(db, 'conversations'), {
        is_group: true,
        name: name || 'Group Chat',
        last_message_at: new Date().toISOString(),
      });
      conversationId = convDoc.id;

      for (const pid of allParticipants) {
        const { setDoc } = await import('@/lib/firestore');
        await setDoc(doc(db, 'conversations', conversationId, 'participants', pid), {
          user_id: pid,
          joined_at: new Date().toISOString(),
        });
      }
    } else {
      // 1-to-1 conversation — find existing
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
        const { setDoc } = await import('@/lib/firestore');
        const convDoc = await addDoc(collection(db, 'conversations'), {
          is_group: false,
          student_id: user.role === 'student' ? user.id : receiverId,
          tutor_id: user.role === 'tutor' ? user.id : receiverId,
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

    // Insert message
    await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
      conversation_id: conversationId,
      sender_id: user.id,
      content,
      read: false,
      type: 'text',
      reference_id: null,
      created_at: new Date().toISOString(),
    });

    // Resolve receiverId for 1-on-1 if missing
    let targetReceiverId = receiverId;
    if (!targetReceiverId && conversationId) {
      const convSnap = await getDoc(doc(db, 'conversations', conversationId));
      const conv = convSnap.exists() ? convSnap.data() : {};
      if (!conv.is_group) {
        const partsSnap = await getDocs(collection(db, 'conversations', conversationId, 'participants'));
        for (const partDoc of partsSnap.docs) {
          if (partDoc.id !== user.id) {
            targetReceiverId = partDoc.id;
            break;
          }
        }
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

          await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
            conversation_id: conversationId,
            sender_id: targetReceiverId,
            content: autoResponse,
            read: false,
            type: 'text',
            reference_id: null,
            created_at: new Date().toISOString(),
          });
        }
      }
    }

    // Update last message time
    await updateDoc(doc(db, 'conversations', conversationId), {
      last_message_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, conversationId });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
