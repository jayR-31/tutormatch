'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function TutorProfilePage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [tutor, setTutor] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data?.user) setUser(data.user); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`/api/tutors/${id}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { setTutor(data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [id]);

  const sendMessage = async () => {
    if (!messageText.trim() || !user) return;
    setSendingMessage(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: parseInt(id), content: messageText }),
      });
      if (res.ok) {
        setMessageSent(true);
        setMessageText('');
      }
    } catch {}
    setSendingMessage(false);
  };

  const formatLabel = {
    online: 'Online Only',
    'in-person': 'In-Person Only',
    both: 'Online & In-Person',
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="text-center py-20 text-gray-400">Loading...</div>
      </>
    );
  }

  if (!tutor) {
    return (
      <>
        <Navbar />
        <div className="text-center py-20">
          <p className="text-gray-500">Tutor not found.</p>
          <button onClick={() => router.back()} className="text-orange-600 mt-2 bg-transparent border-0 cursor-pointer text-sm">
            ← Go back
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-orange-600 bg-transparent border-0 cursor-pointer mb-6">
          ← Back to search
        </button>

        <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start gap-5 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-2xl flex-shrink-0">
              {tutor.name?.charAt(0)?.toUpperCase() || 'T'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 m-0">{tutor.name}</h1>
              <p className="text-sm text-gray-500 mt-1 m-0">{formatLabel[tutor.format_type] || tutor.format_type}</p>
              {tutor.zip_code && (
                <p className="text-sm text-gray-400 mt-1 m-0 flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  ZIP: {tutor.zip_code}
                </p>
              )}
            </div>
          </div>

          {/* Bio */}
          {tutor.bio && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">About</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{tutor.bio}</p>
            </div>
          )}

          {/* Subjects */}
          {tutor.subjects?.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Subjects</h2>
              <div className="flex flex-wrap gap-2">
                {tutor.subjects.map((s, i) => (
                  <span key={i} className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Grade Levels */}
          {tutor.grade_levels?.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Grade Levels</h2>
              <p className="text-sm text-gray-600">{tutor.grade_levels.join(', ')}</p>
            </div>
          )}

          {/* Skills */}
          {tutor.skills && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Skills & Expertise</h2>
              <p className="text-sm text-gray-600">{tutor.skills}</p>
            </div>
          )}

          {/* Message Section */}
          {user && user.role === 'student' && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Send a Message</h2>
              {messageSent ? (
                <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-lg">
                  Message sent! Check your Messages tab to continue the conversation.
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Hi, I'd like to learn more about your tutoring..."
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-400"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sendingMessage || !messageText.trim()}
                    className="bg-orange-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 border-0 cursor-pointer disabled:opacity-50"
                  >
                    {sendingMessage ? 'Sending...' : 'Send'}
                  </button>
                </div>
              )}
            </div>
          )}

          {!user && (
            <div className="border-t border-gray-200 pt-6 mt-6 text-center">
              <p className="text-sm text-gray-500">
                <a href="/login?role=student" className="text-orange-600 no-underline font-medium">Sign in</a> to message this tutor.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
