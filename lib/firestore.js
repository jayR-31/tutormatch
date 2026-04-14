import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

// Collection references
export const usersCol = () => collection(db, 'users');
export const tutorProfilesCol = () => collection(db, 'tutorProfiles');
export const studentProfilesCol = () => collection(db, 'studentProfiles');
export const conversationsCol = () => collection(db, 'conversations');
export const messagesCol = (conversationId) =>
  collection(db, 'conversations', conversationId, 'messages');
export const participantsCol = (conversationId) =>
  collection(db, 'conversations', conversationId, 'participants');
export const sessionsCol = () => collection(db, 'sessions');

// Helper to convert Firestore doc to plain object with id
export function docToObj(docSnap) {
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  // Convert Timestamps to ISO strings
  const converted = {};
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      converted[key] = value.toDate().toISOString();
    } else {
      converted[key] = value;
    }
  }
  return { id: docSnap.id, ...converted };
}

// Helper to convert query snapshot to array of objects
export function queryToArray(querySnap) {
  return querySnap.docs.map(docToObj);
}

export {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
};
