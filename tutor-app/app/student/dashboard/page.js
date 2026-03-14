'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import TutorCard from '@/components/TutorCard';
import ChatThread from '@/components/ChatThread';

const SUBJECTS = ['Math', 'Science', 'English', 'History', 'Other'];
const GRADES = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('search');
  const [profile, setProfile] = useState(null);

  // Search state
  const [tutors, setTutors] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filters, setFilters] = useState({ zip: '', subject: '', grade: '', format: 'all' });

  // Messages state
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatOtherName, setChatOtherName] = useState('');
  const [chatOtherId, setChatOtherId] = useState(null);

  // Sessions state
  const [upcomingSessions, setUpcomingSessions] = useState([]);

  // Settings/Edit state
  const [settingsForm, setSettingsForm] = useState(null);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState('');

  // Password verification state
  const [isVerified, setIsVerified] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        if (data.user.role !== 'student') {
          router.push('/tutor/dashboard');
          return;
        }
        setUser(data.user);
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const searchTutors = useCallback(async () => {
    setSearchLoading(true);
    const params = new URLSearchParams();
    if (filters.zip) params.set('zip', filters.zip);
    if (filters.subject) params.set('subject', filters.subject);
    if (filters.grade) params.set('grade', filters.grade);
    if (filters.format && filters.format !== 'all') params.set('format', filters.format);

    try {
      const res = await fetch(`/api/tutors/search?${params}`);
      const data = await res.json();
      setTutors(Array.isArray(data) ? data : []);
    } catch {
      setTutors([]);
    }
    setSearchLoading(false);
  }, [filters]);

  useEffect(() => {
    if (user) searchTutors();
  }, [user, searchTutors]);

  const loadSessions = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/sessions');
      const data = await res.json();
      setUpcomingSessions(Array.isArray(data) ? data : []);
    } catch {
      setUpcomingSessions([]);
    }
  }, [user]);

  useEffect(() => {
    if (user && activeTab === 'search') {
      loadSessions();
    }
  }, [user, activeTab, loadSessions]);

  useEffect(() => {
    if (user && activeTab === 'messages') {
      fetch('/api/messages')
        .then(res => res.json())
        .then(data => setConversations(Array.isArray(data) ? data : []))
        .catch(() => {});
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (user && (activeTab === 'profile' || activeTab === 'edit') && !settingsForm) {
      fetch('/api/students/profile')
        .then(res => res.json())
        .then(data => {
          setProfile(data);
          setSettingsForm({
            name: data.name || '',
            age: data.age || '',
            grade: data.grade || '',
            school: data.school || '',
            zip_code: data.zip_code || '',
            format_pref: data.format_pref || 'online',
            subjects: data.subjects || [],
          });
        })
        .catch(() => {});
    }
  }, [user, activeTab, settingsForm]);

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
      // Refresh messages
      if (activeConversation) {
        const res = await fetch(`/api/messages/${activeConversation}`);
        const data = await res.json();
        setChatMessages(data.messages || []);
      }
    } catch {}
  };

  const handleVerifyPassword = async (e) => {
    e.preventDefault();
    setVerifyError('');
    setVerifyLoading(true);

    try {
      const res = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: verifyPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsVerified(true);
      } else {
        setVerifyError(data.error || 'Verification failed');
      }
    } catch {
      setVerifyError('Something went wrong');
    } finally {
      setVerifyLoading(false);
    }
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsMsg('');
    try {
      const res = await fetch('/api/students/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settingsForm,
          age: settingsForm.age ? parseInt(settingsForm.age) : null,
        }),
      });
      if (res.ok) {
        setSettingsMsg('Profile saved successfully!');
        // Refresh profile data
        const profileRes = await fetch('/api/students/profile');
        const profileData = await profileRes.json();
        setProfile(profileData);
      }
    } catch {}
    setSettingsSaving(false);
  };

  const toggleSettingsSubject = (subject) => {
    setSettingsForm(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
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
    { id: 'search', label: 'Search Tutors' },
    { id: 'messages', label: 'Messages (Student)' },
    { id: 'profile', label: 'My Profile' },
    { id: 'edit', label: 'Edit Profile' },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen mesh-bg pt-24 pb-12">
        <div className="w-full mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 max-w-[100vw]">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-white/40 glass-panel p-1.5 rounded-2xl w-max mx-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { 
                setActiveTab(tab.id); 
                setActiveConversation(null);
                if (tab.id !== 'edit') {
                  setIsVerified(false);
                  setVerifyPassword('');
                  setVerifyError('');
                }
              }}
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

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column (Search & Results) */}
            <div className="flex-1">
              {/* Filters */}
              <div className="bg-white/60 glass-panel rounded-3xl p-6 mb-10 bento-hover">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    value={filters.zip}
                    onChange={(e) => setFilters({...filters, zip: e.target.value})}
                    className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-400 bg-white"
                  />
                  <select
                    value={filters.subject}
                    onChange={(e) => setFilters({...filters, subject: e.target.value})}
                    className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-400 bg-white"
                  >
                    <option value="">All Subjects</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select
                    value={filters.grade}
                    onChange={(e) => setFilters({...filters, grade: e.target.value})}
                    className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-400 bg-white"
                  >
                    <option value="">All Grades</option>
                    {GRADES.map(g => <option key={g} value={g}>{g} Grade</option>)}
                  </select>
                  <select
                    value={filters.format}
                    onChange={(e) => setFilters({...filters, format: e.target.value})}
                    className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-400 bg-white"
                  >
                    <option value="all">All Formats</option>
                    <option value="online">Online</option>
                    <option value="in-person">In-Person</option>
                  </select>
                </div>
                <button
                  onClick={searchTutors}
                  className="mt-3 bg-orange-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 border-0 cursor-pointer"
                >
                  Search
                </button>
              </div>

              {/* Results */}
              {searchLoading ? (
                <div className="text-center py-10 text-gray-400">Searching...</div>
              ) : tutors.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-400 text-sm">No tutors found. Try adjusting your filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {tutors.map(tutor => (
                    <TutorCard key={tutor.user_id} tutor={tutor} />
                  ))}
                </div>
              )}
            </div>

            {/* Right Column (Upcoming Sessions Sidebar) */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="bg-white/60 glass-panel rounded-3xl p-6 bento-hover sticky top-24">
                <h3 className="text-lg font-bold tracking-tight text-gray-900 mb-6">Upcoming Sessions</h3>
                {upcomingSessions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100/80 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl">📅</span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">No upcoming sessions</p>
                    <p className="text-xs text-gray-400 mt-1">Message a tutor to book your first class.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingSessions.map(session => (
                      <div key={session.id} className="bg-white/90 border border-gray-100 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                        <p className="text-xs font-mono uppercase tracking-widest text-orange-600 font-semibold mb-1 m-0">Student: {session.other_name}</p>
                        <h4 className="text-base text-gray-900 font-bold m-0 mb-2">{session.date}</h4>
                        <div className="flex flex-col gap-1 text-sm text-gray-600 font-mono">
                          <span className="flex items-center gap-2"><span>🕒</span> {session.time}</span>
                          <span className="flex items-center gap-2"><span>⏱</span> {session.duration_minutes} min</span>
                          <span className="flex items-center gap-2 capitalize">
                            <span>{session.format === 'in-person' ? '🏫' : '💻'}</span> {session.format || 'online'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="flex gap-0 border border-gray-200 rounded-xl overflow-hidden" style={{ height: '500px' }}>
            {/* Conversation List */}
            <div className={`w-full sm:w-80 border-r border-gray-200 overflow-y-auto bg-white flex-shrink-0 ${activeConversation ? 'hidden sm:block' : ''}`}>
              {conversations.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm px-4">
                  No conversations yet. Find a tutor and start a conversation!
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

            {/* Chat Area */}
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

        {/* Profile View Tab */}
        {activeTab === 'profile' && profile && (
          <div className="max-w-2xl bg-white/60 glass-panel rounded-3xl p-8 bento-hover mx-auto">
            <div className="flex items-start gap-5 mb-8">
              <div className="w-20 h-20 rounded-2xl bg-gray-900 flex items-center justify-center text-white font-mono font-bold text-3xl flex-shrink-0 shadow-sm">
                {profile.name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">{profile.name || 'No name set'}</h2>
                <p className="text-xs font-mono uppercase tracking-widest text-orange-600 font-semibold mb-2">{profile.grade ? `${profile.grade} Grade` : 'Student'}</p>
                {profile.zip_code && <p className="text-sm text-gray-500 font-mono border border-gray-200 inline-block px-3 py-1 rounded-full">{profile.zip_code}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-widest text-gray-400 font-semibold mb-3">Academic Info</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 font-light flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-400">School:</span> {profile.school || 'Not specified'}
                  </p>
                  <p className="text-sm text-gray-700 font-light flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-400">Age:</span> {profile.age || 'Not specified'}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-mono uppercase tracking-widest text-gray-400 font-semibold mb-3">Preferences</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 font-light flex justify-between border-b border-gray-100 pb-2 capitalize">
                    <span className="text-gray-400">Format:</span> {profile.format_pref || 'Online'}
                  </p>
                </div>
              </div>
            </div>

            {profile.subjects?.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xs font-mono uppercase tracking-widest text-gray-400 font-semibold mb-3">Subjects of Interest</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.subjects.map((s, i) => (
                    <span key={i} className="bg-gray-100/80 text-gray-700 px-3 py-1.5 rounded-xl text-sm font-medium">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit Profile Tab (Password Protected) */}
        {activeTab === 'edit' && (
          <div className="max-w-2xl bg-white/60 glass-panel rounded-3xl p-8 bento-hover mx-auto">
            {!isVerified ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">🔒</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">Password Required</h2>
                <p className="text-sm text-gray-500 mb-8 px-8">To edit your profile, please enter your password for security.</p>
                
                <form onSubmit={handleVerifyPassword} className="max-w-xs mx-auto space-y-4">
                  {verifyError && (
                    <div className="bg-red-50 text-red-600 text-xs px-4 py-2 rounded-lg border border-red-100">{verifyError}</div>
                  )}
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={verifyPassword}
                    onChange={(e) => setVerifyPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                    required
                  />
                  <button
                    type="submit"
                    disabled={verifyLoading}
                    className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold text-sm hover:bg-orange-600 transition-colors border-0 cursor-pointer disabled:opacity-50"
                  >
                    {verifyLoading ? 'Verifying...' : 'Unlock Editor'}
                  </button>
                </form>
              </div>
            ) : settingsForm && (
              <>
                <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-8">Edit Profile</h2>
                <form onSubmit={saveSettings} className="space-y-6">
                  {settingsMsg && (
                    <div className="bg-green-50/50 border border-green-100 text-green-700 text-sm px-4 py-3 rounded-xl">{settingsMsg}</div>
                  )}

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-semibold mb-2">Name</label>
                    <input
                      type="text"
                      value={settingsForm.name}
                      onChange={(e) => setSettingsForm({...settingsForm, name: e.target.value})}
                      className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-semibold mb-2">Age</label>
                      <input
                        type="number"
                        value={settingsForm.age}
                        onChange={(e) => setSettingsForm({...settingsForm, age: e.target.value})}
                        className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-semibold mb-2">Grade</label>
                      <select
                        value={settingsForm.grade}
                        onChange={(e) => setSettingsForm({...settingsForm, grade: e.target.value})}
                        className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                      >
                        <option value="">Select grade</option>
                        {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-semibold mb-2">School</label>
                    <input
                      type="text"
                      value={settingsForm.school}
                      onChange={(e) => setSettingsForm({...settingsForm, school: e.target.value})}
                      className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-semibold mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={settingsForm.zip_code}
                      onChange={(e) => setSettingsForm({...settingsForm, zip_code: e.target.value})}
                      className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-semibold mb-3">Preferred Format</label>
                    <div className="flex gap-3">
                      {[
                        { value: 'online', label: 'Online' },
                        { value: 'in-person', label: 'In-Person' },
                        { value: 'either', label: 'Either' },
                      ].map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setSettingsForm({...settingsForm, format_pref: opt.value})}
                          className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200 border cursor-pointer ${
                            settingsForm.format_pref === opt.value
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
                    <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-semibold mb-3">Subjects</label>
                    <div className="flex flex-wrap gap-2">
                      {SUBJECTS.map(subject => (
                        <button
                          key={subject}
                          type="button"
                          onClick={() => toggleSettingsSubject(subject)}
                          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border cursor-pointer ${
                            settingsForm.subjects.includes(subject)
                              ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                              : 'bg-white/80 text-gray-600 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={settingsSaving}
                      className="w-full sm:w-auto bg-orange-600 text-white px-8 py-3.5 rounded-xl text-sm font-semibold hover:bg-orange-700 border-0 cursor-pointer disabled:opacity-50 transition-colors"
                    >
                      {settingsSaving ? 'Saving...' : 'Save Profile Details'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        )}
        </div>
      </main>
    </>
  );
}
