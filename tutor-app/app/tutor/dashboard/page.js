'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ChatThread from '@/components/ChatThread';

const SUBJECTS = ['Math', 'Science', 'English', 'History', 'Other'];
const GRADES = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

export default function TutorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('messages');
  const [profile, setProfile] = useState(null);

  // Messages state
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatOtherName, setChatOtherName] = useState('');
  const [chatOtherId, setChatOtherId] = useState(null);

  // Sessions state
  const [upcomingSessions, setUpcomingSessions] = useState([]);

  // Edit profile state
  const [editForm, setEditForm] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editMsg, setEditMsg] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        if (data.user.role !== 'tutor') {
          router.push('/student/dashboard');
          return;
        }
        setUser(data.user);
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const loadSessions = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/sessions');
      const data = await res.json();
      setUpcomingSessions(Array.isArray(data) ? data : []);
    } catch {
      setUpcomingSessions([]);
    }
  };

  useEffect(() => {
    if (user && activeTab === 'sessions') {
      loadSessions();
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (user) {
      fetch('/api/tutors/profile')
        .then(res => res.json())
        .then(data => {
          setProfile(data);
          setEditForm({
            name: data.name || '',
            age: data.age || '',
            zip_code: data.zip_code || '',
            subjects: data.subjects || [],
            skills: data.skills || '',
            format_type: data.format_type || 'online',
            bio: data.bio || '',
            grade_levels: data.grade_levels || [],
          });
        })
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (user && activeTab === 'messages') {
      fetch('/api/messages')
        .then(res => res.json())
        .then(data => setConversations(Array.isArray(data) ? data : []))
        .catch(() => {});
    }
  }, [user, activeTab]);

  const openConversation = async (conversationId) => {
    setActiveConversation(conversationId);
    try {
      const res = await fetch(`/api/messages/${conversationId}`);
      const data = await res.json();
      setChatMessages(data.messages || []);
      setChatOtherName(data.otherName || 'Unknown');
      setChatOtherId(data.otherId);
    } catch {
      setChatMessages([]);
    }
  };

  const sendMessage = async (content) => {
    if (!chatOtherId) return;
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: chatOtherId, content }),
      });
      if (activeConversation) {
        const res = await fetch(`/api/messages/${activeConversation}`);
        const data = await res.json();
        setChatMessages(data.messages || []);
      }
    } catch {}
  };

  const toggleSubject = (subject) => {
    setEditForm(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const toggleGrade = (grade) => {
    setEditForm(prev => ({
      ...prev,
      grade_levels: prev.grade_levels.includes(grade)
        ? prev.grade_levels.filter(g => g !== grade)
        : [...prev.grade_levels, grade]
    }));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    setEditMsg('');
    try {
      const res = await fetch('/api/tutors/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          age: editForm.age ? parseInt(editForm.age) : null,
        }),
      });
      if (res.ok) {
        setEditMsg('Profile saved successfully!');
        // Refresh profile
        const profileRes = await fetch('/api/tutors/profile');
        const profileData = await profileRes.json();
        setProfile(profileData);
      }
    } catch {}
    setEditSaving(false);
  };

  const formatLabel = {
    online: 'Online Only',
    'in-person': 'In-Person Only',
    both: 'Online & In-Person',
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="text-center py-20 text-gray-400">Loading...</div>
      </>
    );
  }

  const tabs = [
    { id: 'sessions', label: 'Upcoming Sessions' },
    { id: 'messages', label: 'Messages' },
    { id: 'profile', label: 'My Profile' },
    { id: 'edit', label: 'Edit Profile' },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen mesh-bg pt-24 pb-12">
        <div className="w-full mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 max-w-[100vw]">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-white/40 glass-panel p-1.5 rounded-2xl w-max">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setActiveConversation(null); }}
              className={`px-6 py-2.5 text-sm font-medium rounded-xl cursor-pointer transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'bg-transparent text-gray-500 hover:text-gray-900 hover:bg-white/50 border-transparent border-0'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="flex gap-0 border border-gray-200 rounded-xl overflow-hidden" style={{ height: '500px' }}>
            <div className={`w-full sm:w-80 border-r border-gray-200 overflow-y-auto bg-white flex-shrink-0 ${activeConversation ? 'hidden sm:block' : ''}`}>
              {conversations.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm px-4">
                  No messages yet. Students will reach out once they find your profile!
                </div>
              ) : (
                conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv.id)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 cursor-pointer bg-transparent hover:bg-orange-50 ${
                      activeConversation === conv.id ? 'bg-orange-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-medium text-sm flex-shrink-0">
                        {conv.other_name ? conv.other_name.charAt(0) : '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 m-0 truncate">{conv.other_name}</p>
                        <p className="text-xs text-gray-500 m-0 truncate">{conv.last_message || 'No messages'}</p>
                      </div>
                      {conv.unread_count > 0 && (
                        <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className={`flex-1 ${!activeConversation ? 'hidden sm:flex' : 'flex'} flex-col`}>
              {activeConversation ? (
                <>
                  <button
                    onClick={() => setActiveConversation(null)}
                    className="sm:hidden px-4 py-2 text-sm text-orange-600 bg-transparent border-0 border-b border-gray-200 cursor-pointer text-left"
                  >
                    ← Back to conversations
                  </button>
                  <ChatThread
                    messages={chatMessages}
                    currentUserId={user.id}
                    otherId={chatOtherId}
                    onSendMessage={sendMessage}
                    otherName={chatOtherName}
                    onRefreshMessages={() => openConversation(activeConversation)}
                  />
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  Select a conversation
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="max-w-2xl bg-white/60 glass-panel rounded-3xl p-8 bento-hover">
            <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-8">Upcoming Sessions</h2>
            {upcomingSessions.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-gray-100/80 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📅</span>
                </div>
                <p className="text-sm text-gray-500 font-medium">No upcoming sessions</p>
                <p className="text-xs text-gray-400 mt-1">Accept session proposals from your students in Messages.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {upcomingSessions.map(session => (
                  <div key={session.id} className="bg-white/90 border border-gray-100 rounded-2xl p-5 shadow-sm relative overflow-hidden flex justify-between items-center">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500"></div>
                    <div>
                      <p className="text-xs font-mono uppercase tracking-widest text-orange-600 font-semibold mb-1 m-0">Student: {session.other_name}</p>
                      <h4 className="text-lg text-gray-900 font-bold m-0 mb-2">{session.date}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 font-mono flex-wrap">
                        <span className="flex items-center gap-1.5"><span>🕒</span> {session.time}</span>
                        <span className="flex items-center gap-1.5"><span>⏱</span> {session.duration_minutes} min</span>
                        <span className="flex items-center gap-1.5 capitalize">
                          <span>{session.format === 'in-person' ? '🏫' : '💻'}</span> {session.format || 'online'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Profile Tab */}
        {activeTab === 'profile' && profile && (
          <div className="max-w-2xl bg-white/60 glass-panel rounded-3xl p-8 bento-hover">
            <div className="flex items-start gap-5 mb-8">
              <div className="w-20 h-20 rounded-2xl bg-gray-900 flex items-center justify-center text-white font-mono font-bold text-3xl flex-shrink-0 shadow-sm">
                {profile.name?.charAt(0)?.toUpperCase() || 'T'}
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">{profile.name || 'No name set'}</h2>
                <p className="text-xs font-mono uppercase tracking-widest text-orange-600 font-semibold mb-2">{formatLabel[profile.format_type] || profile.format_type}</p>
                {profile.zip_code && <p className="text-sm text-gray-500 font-mono border border-gray-200 inline-block px-3 py-1 rounded-full">{profile.zip_code}</p>}
              </div>
            </div>

            {profile.bio && (
              <div className="mb-8">
                <h3 className="text-xs font-mono uppercase tracking-widest text-gray-400 font-semibold mb-3">Bio</h3>
                <p className="text-sm text-gray-700 leading-relaxed font-light">{profile.bio}</p>
              </div>
            )}

            {profile.subjects?.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xs font-mono uppercase tracking-widest text-gray-400 font-semibold mb-3">Subjects</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.subjects.map((s, i) => (
                    <span key={i} className="bg-gray-100/80 text-gray-700 px-3 py-1.5 rounded-xl text-sm font-medium">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {profile.grade_levels?.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xs font-mono uppercase tracking-widest text-gray-400 font-semibold mb-2">Grade Levels</h3>
                <p className="text-sm text-gray-700 font-light">{profile.grade_levels.join(', ')}</p>
              </div>
            )}

            {profile.skills && (
              <div className="mb-4">
                <h3 className="text-xs font-mono uppercase tracking-widest text-gray-400 font-semibold mb-2">Skills</h3>
                <p className="text-sm text-gray-700 font-light">{profile.skills}</p>
              </div>
            )}
          </div>
        )}

        {/* Edit Profile Tab */}
        {activeTab === 'edit' && editForm && (
          <div className="max-w-2xl bg-white/60 glass-panel rounded-3xl p-8 bento-hover">
            <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-8">Edit Profile</h2>
            <form onSubmit={saveProfile} className="space-y-6">
              {editMsg && (
                <div className="bg-green-50/50 border border-green-100 text-green-700 text-sm px-4 py-3 rounded-xl">{editMsg}</div>
              )}

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-semibold mb-2">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-semibold mb-2">Age</label>
                  <input
                    type="number"
                    value={editForm.age}
                    onChange={(e) => setEditForm({...editForm, age: e.target.value})}
                    className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-semibold mb-2">ZIP Code</label>
                  <input
                    type="text"
                    value={editForm.zip_code}
                    onChange={(e) => setEditForm({...editForm, zip_code: e.target.value})}
                    className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-semibold mb-3">Subjects</label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map(subject => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => toggleSubject(subject)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border cursor-pointer ${
                        editForm.subjects.includes(subject)
                          ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                          : 'bg-white/80 text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-semibold mb-3">Grade Levels</label>
                <div className="flex flex-wrap gap-2">
                  {GRADES.map(grade => (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => toggleGrade(grade)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border cursor-pointer ${
                        editForm.grade_levels.includes(grade)
                          ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                          : 'bg-white/80 text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-semibold mb-2">Skills</label>
                <input
                  type="text"
                  value={editForm.skills}
                  onChange={(e) => setEditForm({...editForm, skills: e.target.value})}
                  className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-semibold mb-3">Format</label>
                <div className="flex gap-3">
                  {[
                    { value: 'online', label: 'Online' },
                    { value: 'in-person', label: 'In-Person' },
                    { value: 'both', label: 'Both' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setEditForm({...editForm, format_type: opt.value})}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200 border cursor-pointer ${
                        editForm.format_type === opt.value
                          ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                          : 'bg-white/80 text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-semibold mb-2">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={editSaving}
                  className="w-full sm:w-auto bg-orange-600 text-white px-8 py-3.5 rounded-xl text-sm font-semibold hover:bg-orange-700 border-0 cursor-pointer disabled:opacity-50 transition-colors"
                >
                  {editSaving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
        </div>
      </main>
    </>
  );
}
