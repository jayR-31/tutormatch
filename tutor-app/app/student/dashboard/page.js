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
  const [editMode, setEditMode] = useState(false);
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
    if (user && activeTab === 'profile' && !settingsForm) {
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
    if (!activeConversation) return;
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: activeConversation, content }),
      });
      // Refresh messages
      const res = await fetch(`/api/messages/${activeConversation}`);
      const data = await res.json();
      setChatMessages(data.messages || []);
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
        // Return to view mode after brief message
        setTimeout(() => {
          setEditMode(false);
          setSettingsMsg('');
        }, 1500);
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
    { id: 'group-sessions', label: 'Group Sessions' },
    { id: 'profile', label: 'My Profile' },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen mesh-bg pt-24 pb-12">
        <div className="w-full mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 max-w-[100vw]">
          {/* Tabs */}
          <div className="flex gap-2 mb-10 bg-stone-100/50 p-1.5 rounded-2xl w-max mx-auto border border-stone-200/50 backdrop-blur-md">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { 
                setActiveTab(tab.id); 
                setActiveConversation(null);
                setEditMode(false);
                setIsVerified(false);
                setVerifyPassword('');
                setVerifyError('');
              }}
              className={`px-8 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] rounded-xl cursor-pointer transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white text-red-600 shadow-sm border border-stone-200'
                  : 'bg-transparent text-stone-400 hover:text-stone-600 border-transparent border-0'
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
              <div className="premium-card p-8 mb-12 shadow-red-900/[0.02]">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">Location</label>
                    <input
                      type="text"
                      placeholder="ZIP Code"
                      value={filters.zip}
                      onChange={(e) => setFilters({...filters, zip: e.target.value})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:border-red-300 focus:ring-4 focus:ring-red-500/5 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">Subject</label>
                    <select
                      value={filters.subject}
                      onChange={(e) => setFilters({...filters, subject: e.target.value})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:border-red-300 focus:ring-4 focus:ring-red-500/5 transition-all"
                    >
                      <option value="">All Subjects</option>
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">Grade</label>
                    <select
                      value={filters.grade}
                      onChange={(e) => setFilters({...filters, grade: e.target.value})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:border-red-300 focus:ring-4 focus:ring-red-500/5 transition-all"
                    >
                      <option value="">All Grades</option>
                      {GRADES.map(g => <option key={g} value={g}>{g} Grade</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">Learning Format</label>
                    <select
                      value={filters.format}
                      onChange={(e) => setFilters({...filters, format: e.target.value})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:border-red-300 focus:ring-4 focus:ring-red-500/5 transition-all"
                    >
                      <option value="all">All Formats</option>
                      <option value="online">Online</option>
                      <option value="in-person">In-Person</option>
                    </select>
                  </div>
                </div>
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={searchTutors}
                    className="bg-red-600 text-white px-10 py-3.5 rounded-2xl text-sm font-bold hover:bg-stone-900 transition-all duration-300 shadow-lg shadow-red-600/10 active:scale-95 border-0 cursor-pointer"
                  >
                    Refresh Search Results
                  </button>
                </div>
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
            <div className="w-full lg:w-96 flex-shrink-0">
              <div className="premium-card p-10 sticky top-24 shadow-red-900/[0.02] border-red-50">
                <h3 className="text-xl font-bold tracking-tight text-stone-900 mb-8 border-b border-stone-50 pb-6">Student Schedule</h3>
                {upcomingSessions.filter(s => !s.is_group).length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-stone-100">
                      <span className="text-2xl">🗓️</span>
                    </div>
                    <p className="text-sm text-stone-600 font-bold tracking-tight">No upcoming 1-on-1s</p>
                    <p className="text-xs text-stone-400 mt-2 leading-relaxed">Organize your first session by connecting with a tutor today.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {upcomingSessions.filter(s => !s.is_group).map(session => (
                      <div key={session.id} className="relative pl-6 group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-100 rounded-full group-hover:bg-red-500 transition-colors"></div>
                        <div className="mb-1 flex items-center justify-between">
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-red-600 m-0">Tutor: {session.other_name}</p>
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(153,27,27,0.3)]"></span>
                        </div>
                        <h4 className="text-base text-stone-900 font-bold m-0 mb-3">{session.date}</h4>
                        <div className="flex flex-col gap-2.5 text-xs text-stone-500 font-bold tracking-tight">
                          <span className="flex items-center gap-2.5">
                            <div className="w-5 h-5 rounded-md bg-stone-50 flex items-center justify-center text-[10px]">🕒</div>
                            {session.time}
                          </span>
                          <span className="flex items-center gap-2.5 capitalize">
                            <div className="w-5 h-5 rounded-md bg-stone-50 flex items-center justify-center text-[10px]">{session.format === 'in-person' ? '🏠' : '💻'}</div>
                            {session.format || 'online'}
                          </span>
                          {session.subjects && JSON.parse(session.subjects).length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {JSON.parse(session.subjects).map((s, idx) => (
                                <span key={idx} className="bg-red-50/50 text-red-600 px-3 py-1 rounded-lg text-[9px] font-bold border border-red-100/50 uppercase tracking-widest">{s}</span>
                              ))}
                            </div>
                          )}
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
          <div className="flex gap-0 premium-card overflow-hidden shadow-red-900/[0.02]" style={{ height: '600px' }}>
            {/* Conversation List */}
            <div className={`w-full sm:w-80 border-r border-stone-100 overflow-y-auto bg-white flex-shrink-0 ${activeConversation ? 'hidden sm:block' : ''}`}>
              <div className="p-6 border-b border-stone-50 bg-stone-50/30">
                <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400 m-0">Conversations</h3>
              </div>
              {conversations.length === 0 ? (
                <div className="text-center py-12 text-stone-400 text-sm px-6 leading-relaxed">
                  No active threads. <br /> Connect with a tutor to begin.
                </div>
              ) : (
                conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv.id)}
                    className={`w-full text-left px-6 py-5 border-b border-stone-50 cursor-pointer bg-transparent transition-all relative group ${
                      activeConversation === conv.id ? 'bg-red-50/50' : 'hover:bg-stone-50'
                    }`}
                  >
                    {activeConversation === conv.id && (
                      <div className="absolute left-0 top-0 w-1 h-full bg-red-600"></div>
                    )}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-600 font-bold text-sm flex-shrink-0 shadow-sm group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                        {conv.other_name ? conv.other_name.charAt(0) : '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-stone-900 m-0 truncate tracking-tight">{conv.other_name}</p>
                        <p className="text-xs text-stone-400 m-0 truncate mt-1 font-medium">{conv.last_message || 'Start chatting...'}</p>
                      </div>
                      {conv.unread_count > 0 && (
                        <span className="bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-600/20">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Chat Area */}
            <div className={`flex-1 ${!activeConversation ? 'hidden sm:flex' : 'flex'} flex-col bg-stone-50/30`}>
              {activeConversation ? (
                <>
                  <button
                    onClick={() => setActiveConversation(null)}
                    className="sm:hidden px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-red-600 bg-white border-0 border-b border-stone-100 cursor-pointer text-left"
                  >
                    ← Back to List
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
                <div className="flex flex-col items-center justify-center h-full text-stone-400 space-y-4">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-stone-100 shadow-sm">
                    <span className="text-2xl">💬</span>
                  </div>
                  <p className="text-sm font-bold tracking-tight">Select a thread to continue</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Group Sessions Tab */}
        {activeTab === 'group-sessions' && (
          <div className="max-w-5xl mx-auto">
            <div className="premium-card p-10 bento-hover shadow-red-900/[0.02]">
              <div className="flex items-center justify-between mb-12">
                <div className="space-y-1">
                  <h2 className="text-3xl font-bold tracking-tight text-stone-900">Group Learning</h2>
                  <p className="text-stone-400 text-sm font-medium">Collaborative sessions with fellow students.</p>
                </div>
                <div className="bg-red-50 text-red-600 px-5 py-2 rounded-2xl text-[11px] font-bold tracking-widest uppercase border border-red-100 shadow-sm shadow-red-900/5">
                  {upcomingSessions.filter(s => s.is_group).length} Active Group{upcomingSessions.filter(s => s.is_group).length !== 1 ? 's' : ''}
                </div>
              </div>
              
              {upcomingSessions.filter(s => s.is_group).length === 0 ? (
                <div className="text-center py-20 bg-stone-50/50 rounded-[32px] border border-dashed border-stone-200">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-stone-100">
                    <span className="text-3xl">👥</span>
                  </div>
                  <p className="text-lg font-bold text-stone-900 tracking-tight">No group sessions yet</p>
                  <p className="text-sm text-stone-400 mt-2 max-w-xs mx-auto leading-relaxed">Check your messages for invitations from tutors to join a collective class.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {upcomingSessions.filter(s => s.is_group).map(session => (
                    <div key={session.id} className="bg-white border border-stone-100 rounded-[32px] p-8 shadow-sm hover:shadow-xl hover:shadow-red-900/[0.03] transition-all relative overflow-hidden group border-b-4 border-b-red-500">
                      <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity pointer-events-none">
                        <span className="text-6xl font-bold">GROUP</span>
                      </div>
                      <div className="inline-block px-4 py-1.5 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl mb-6 border border-red-100/50">
                        {session.other_name}
                      </div>
                      <h3 className="text-2xl font-bold text-stone-900 mb-3 tracking-tight">{session.date}</h3>
                      <div className="flex flex-col gap-3 text-sm text-stone-500 font-bold mb-8">
                        <span className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-lg bg-stone-50 flex items-center justify-center text-[10px]">🕒</div>
                          {session.time}
                        </span>
                        <span className="flex items-center gap-3 capitalize">
                          <div className="w-6 h-6 rounded-lg bg-stone-50 flex items-center justify-center text-[10px]">{session.format === 'in-person' ? '🏠' : '💻'}</div>
                          {session.format} Format
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-8">
                        {session.subjects && JSON.parse(session.subjects).map((s, idx) => (
                          <span key={idx} className="bg-stone-50 text-stone-600 px-4 py-1.5 rounded-xl text-[11px] font-bold border border-stone-100">{s}</span>
                        ))}
                      </div>
                      <button className="w-full bg-stone-900 text-white py-4 rounded-2xl text-sm font-bold hover:bg-red-600 transition-all border-0 cursor-pointer shadow-lg shadow-stone-900/10 active:scale-95">
                        Join Collective Session
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Consolidated Profile Tab */}
        {activeTab === 'profile' && profile && (
          <div className="max-w-3xl premium-card p-12 mx-auto shadow-red-900/[0.02]">
            {!editMode ? (
              <>
                <div className="flex items-start justify-between mb-12">
                  <div className="flex items-start gap-8">
                    <div className="w-24 h-24 rounded-[32px] bg-stone-900 flex items-center justify-center text-white font-bold text-4xl flex-shrink-0 shadow-2xl shadow-stone-900/20 border-4 border-white">
                      {profile.name?.charAt(0)?.toUpperCase() || 'S'}
                    </div>
                    <div>
                      <h2 className="text-4xl font-bold tracking-tight text-stone-900 mb-2">{profile.name || 'Anonymous Learner'}</h2>
                      <div className="flex items-center gap-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-100">{profile.grade ? `${profile.grade} Grade` : 'Student'}</p>
                        {profile.zip_code && <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 bg-stone-50 px-3 py-1 rounded-lg border border-stone-100">ZIP {profile.zip_code}</p>}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setEditMode(true)}
                    className="bg-red-600 text-white px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-stone-900 transition-all border-0 cursor-pointer flex items-center gap-2 shadow-lg shadow-red-600/10 active:scale-95"
                  >
                    <span>Edit Profile</span>
                    <span className="text-sm">✎</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">Academic Background</h3>
                    <div className="space-y-4">
                      <div className="bg-stone-50/50 p-4 rounded-2xl border border-stone-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Institution</span>
                        <span className="text-sm font-bold text-stone-700">{profile.school || 'Not specified'}</span>
                      </div>
                      <div className="bg-stone-50/50 p-4 rounded-2xl border border-stone-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Student Age</span>
                        <span className="text-sm font-bold text-stone-700">{profile.age || '--'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">Engagement Prefs</h3>
                    <div className="space-y-4">
                      <div className="bg-stone-50/50 p-4 rounded-2xl border border-stone-100 flex justify-between items-center capitalize">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Format</span>
                        <span className="text-sm font-bold text-stone-700">{profile.format_pref || 'Online'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {profile.subjects?.length > 0 && (
                  <div className="mt-12">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1 mb-6">In Focus Subjects</h3>
                    <div className="flex flex-wrap gap-2.5">
                      {profile.subjects.map((s, i) => (
                        <span key={i} className="bg-white text-stone-700 px-5 py-2 rounded-2xl text-xs font-bold border border-stone-100 shadow-sm hover:border-red-200 transition-colors">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : !isVerified ? (
              <div className="text-center py-10 max-w-sm mx-auto">
                <div className="w-20 h-20 bg-red-50 rounded-[28px] flex items-center justify-center mx-auto mb-8 border border-red-100 shadow-sm">
                  <span className="text-3xl text-red-600">🔐</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-stone-900 mb-3">Identity Check</h2>
                <p className="text-sm text-stone-400 mb-10 leading-relaxed font-medium">To modify your professional profile, please verify your account credentials.</p>
                
                <form onSubmit={handleVerifyPassword} className="space-y-6">
                  {verifyError && (
                    <div className="bg-red-50 text-red-600 text-[11px] font-bold px-4 py-2 rounded-xl border border-red-100/50 uppercase tracking-tighter">{verifyError}</div>
                  )}
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Your Password"
                      value={verifyPassword}
                      onChange={(e) => setVerifyPassword(e.target.value)}
                      className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm outline-none focus:border-red-400 focus:ring-8 focus:ring-red-500/5 transition-all text-center font-mono tracking-tighter"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      type="submit"
                      disabled={verifyLoading}
                      className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold text-sm hover:bg-stone-900 transition-all border-0 cursor-pointer disabled:opacity-50 shadow-xl shadow-red-600/20 active:scale-95"
                    >
                      {verifyLoading ? 'Verifying...' : 'Unlock Profile Editor'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="w-full bg-transparent text-stone-400 py-3 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:text-stone-900 transition-all border-0 cursor-pointer"
                    >
                      Return to Profile
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-12">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight text-stone-900">Profile Editor</h2>
                    <p className="text-stone-400 text-sm font-medium">Update your academic information.</p>
                  </div>
                  <button 
                    onClick={() => { setEditMode(false); setIsVerified(false); }}
                    className="bg-stone-50 text-stone-400 hover:text-stone-900 px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase border border-stone-100 cursor-pointer transition-all"
                  >
                    Discard Changes
                  </button>
                </div>
                <form onSubmit={saveSettings} className="space-y-10">
                  {settingsMsg && (
                    <div className="bg-emerald-50/50 border border-emerald-100 text-emerald-700 text-sm font-bold px-5 py-4 rounded-2xl animate-in fade-in slide-in-from-top-2">{settingsMsg}</div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">Full Name</label>
                      <input
                        type="text"
                        value={settingsForm.name}
                        onChange={(e) => setSettingsForm({...settingsForm, name: e.target.value})}
                        className="w-full px-5 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm outline-none focus:border-red-400 focus:ring-8 focus:ring-red-500/5 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">Age</label>
                        <input
                          type="number"
                          value={settingsForm.age}
                          onChange={(e) => setSettingsForm({...settingsForm, age: e.target.value})}
                          className="w-full px-5 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm outline-none focus:border-red-400 focus:ring-8 focus:ring-red-500/5 transition-all"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Grade</label>
                        <select
                          value={settingsForm.grade}
                          onChange={(e) => setSettingsForm({...settingsForm, grade: e.target.value})}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:border-indigo-400 focus:ring-8 focus:ring-indigo-500/5 transition-all"
                        >
                          <option value="">Grade</option>
                          {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Educational Institution</label>
                      <input
                        type="text"
                        value={settingsForm.school}
                        onChange={(e) => setSettingsForm({...settingsForm, school: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:border-indigo-400 focus:ring-8 focus:ring-indigo-500/5 transition-all"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">ZIP Code</label>
                      <input
                        type="text"
                        value={settingsForm.zip_code}
                        onChange={(e) => setSettingsForm({...settingsForm, zip_code: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:border-indigo-400 focus:ring-8 focus:ring-indigo-500/5 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Learning Preferences</label>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { value: 'online', label: 'Remote / Online' },
                        { value: 'in-person', label: 'Local / In-Person' },
                        { value: 'either', label: 'Hybrid / Either' },
                      ].map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setSettingsForm({...settingsForm, format_pref: opt.value})}
                          className={`flex-1 min-w-[140px] py-4 rounded-2xl text-xs font-bold tracking-tight transition-all duration-300 border cursor-pointer ${
                            settingsForm.format_pref === opt.value
                              ? 'bg-stone-900 text-white border-stone-900 shadow-xl shadow-stone-900/10 scale-[1.02]'
                              : 'bg-white text-stone-500 border-stone-100 hover:border-indigo-200'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Subjects of Interest</label>
                    <div className="flex flex-wrap gap-2.5">
                      {SUBJECTS.map(subject => (
                        <button
                          key={subject}
                          type="button"
                          onClick={() => toggleSettingsSubject(subject)}
                          className={`px-6 py-2.5 rounded-2xl text-[11px] font-bold tracking-widest uppercase transition-all duration-300 border cursor-pointer ${
                            settingsForm.subjects.includes(subject)
                              ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/10'
                              : 'bg-white text-stone-400 border-stone-100 hover:border-red-100 hover:text-stone-600'
                          }`}
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8 flex gap-4">
                    <button
                      type="submit"
                      disabled={settingsSaving}
                      className="flex-1 bg-red-600 text-white px-10 py-5 rounded-[24px] text-sm font-bold uppercase tracking-widest hover:bg-stone-900 border-0 cursor-pointer disabled:opacity-50 transition-all shadow-2xl shadow-red-600/20 active:scale-95"
                    >
                      {settingsSaving ? 'Syncing...' : 'Confirm & Save Changes'}
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
