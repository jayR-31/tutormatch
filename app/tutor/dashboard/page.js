'use client';

import { useState, useEffect, useCallback } from 'react';
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

  // Find Students state
  const [studentResults, setStudentResults] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentSubjectFilter, setStudentSubjectFilter] = useState('');
  const [studentGradeFilter, setStudentGradeFilter] = useState('');
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [messageStudent, setMessageStudent] = useState(null);
  const [outreachMessage, setOutreachMessage] = useState('');
  const [sendingOutreach, setSendingOutreach] = useState(false);
  const [outreachSent, setOutreachSent] = useState('');

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
        if (data.user.role !== 'tutor') {
          router.push('/student/dashboard');
          return;
        }
        if (!data.user.subscribed) {
          router.push('/tutor/subscription');
          return;
        }
        setUser(data.user);
      })
      .catch(() => router.push('/login'));
  }, [router]);

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
    if (user && activeTab === 'sessions') {
      loadSessions();
    }
  }, [user, activeTab, loadSessions]);

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
    if (!activeConversation) return;
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: activeConversation, content }),
      });
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
        // Return to view mode
        setTimeout(() => {
          setEditMode(false);
          setEditMsg('');
        }, 1500);
      }
    } catch {}
    setEditSaving(false);
  };

  const searchStudents = useCallback(async () => {
    setStudentsLoading(true);
    try {
      const params = new URLSearchParams();
      if (studentSearch) params.set('name', studentSearch);
      if (studentSubjectFilter) params.set('subject', studentSubjectFilter);
      if (studentGradeFilter) params.set('grade', studentGradeFilter);
      const res = await fetch(`/api/students/search?${params.toString()}`);
      const data = await res.json();
      setStudentResults(Array.isArray(data) ? data : []);
    } catch {
      setStudentResults([]);
    }
    setStudentsLoading(false);
  }, [studentSearch, studentSubjectFilter, studentGradeFilter]);

  useEffect(() => {
    if (user && activeTab === 'find-students') {
      searchStudents();
    }
  }, [user, activeTab, searchStudents]);

  const sendOutreachMessage = async (studentId) => {
    if (!outreachMessage.trim()) return;
    setSendingOutreach(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: studentId, content: outreachMessage }),
      });
      if (res.ok) {
        setOutreachSent(studentId);
        setOutreachMessage('');
        setMessageStudent(null);
        setTimeout(() => setOutreachSent(''), 3000);
      }
    } catch {}
    setSendingOutreach(false);
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
    { id: 'messages', label: 'Messages (Tutor)' },
    { id: 'find-students', label: 'Find Students' },
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
                  No active threads. <br /> Students will reach out once they find your profile!
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
                    conversationId={activeConversation}
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

        {/* Find Students Tab */}
        {activeTab === 'find-students' && (
          <div className="max-w-4xl mx-auto">
            <div className="premium-card p-10 shadow-red-900/[0.02]">
              <div className="mb-10">
                <h2 className="text-3xl font-bold tracking-tight text-stone-900 mb-2">Find Students</h2>
                <p className="text-stone-400 text-sm font-medium">Browse students and reach out to offer your tutoring services.</p>
              </div>

              {/* Search & Filters */}
              <div className="flex flex-wrap gap-4 mb-8">
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchStudents()}
                  className="flex-1 min-w-[200px] px-5 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm outline-none focus:border-red-400 focus:ring-8 focus:ring-red-500/5 transition-all"
                />
                <select
                  value={studentSubjectFilter}
                  onChange={(e) => setStudentSubjectFilter(e.target.value)}
                  className="px-5 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm outline-none focus:border-red-400 cursor-pointer"
                >
                  <option value="">All Subjects</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select
                  value={studentGradeFilter}
                  onChange={(e) => setStudentGradeFilter(e.target.value)}
                  className="px-5 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm outline-none focus:border-red-400 cursor-pointer"
                >
                  <option value="">All Grades</option>
                  {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <button
                  onClick={searchStudents}
                  className="px-8 py-3 bg-stone-900 text-white rounded-2xl text-sm font-bold hover:bg-red-600 transition-all border-0 cursor-pointer shadow-lg shadow-stone-900/10 active:scale-95"
                >
                  Search
                </button>
              </div>

              {/* Results */}
              {studentsLoading ? (
                <div className="text-center py-20 text-stone-400 text-sm">Searching...</div>
              ) : studentResults.length === 0 ? (
                <div className="text-center py-20 bg-stone-50/50 rounded-[32px] border border-dashed border-stone-200">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-stone-100">
                    <span className="text-3xl">🔍</span>
                  </div>
                  <p className="text-lg font-bold text-stone-900 tracking-tight">No students found</p>
                  <p className="text-sm text-stone-400 mt-2 max-w-xs mx-auto leading-relaxed">Try adjusting your filters or check back later as more students sign up.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {studentResults.map(student => (
                    <div key={student.id} className="bg-white border border-stone-100 rounded-[28px] p-8 shadow-sm hover:shadow-xl hover:shadow-red-900/[0.03] transition-all relative group">
                      <div className="flex items-start gap-5 mb-5">
                        <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-600 font-bold text-lg flex-shrink-0 shadow-sm group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-stone-900 tracking-tight truncate">{student.name}</h3>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            {student.grade && (
                              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-100">{student.grade} Grade</span>
                            )}
                            {student.zip_code && (
                              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-100">ZIP {student.zip_code}</span>
                            )}
                            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100/50 capitalize">{student.format_pref}</span>
                          </div>
                        </div>
                      </div>

                      {student.subjects.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-5">
                          {student.subjects.map((s, i) => (
                            <span key={i} className="bg-stone-50 text-stone-600 px-3 py-1 rounded-xl text-[10px] font-bold border border-stone-100 uppercase tracking-widest">{s}</span>
                          ))}
                        </div>
                      )}

                      {student.school && (
                        <p className="text-xs text-stone-400 font-medium mb-5 truncate">School: {student.school}</p>
                      )}

                      {outreachSent === student.id ? (
                        <div className="bg-emerald-50 text-emerald-700 text-sm font-bold px-5 py-3 rounded-2xl border border-emerald-100 text-center">
                          Message sent! Check your Messages tab.
                        </div>
                      ) : messageStudent === student.id ? (
                        <div className="space-y-3">
                          <textarea
                            value={outreachMessage}
                            onChange={(e) => setOutreachMessage(e.target.value)}
                            placeholder={`Hi ${student.name}, I'd love to help you with...`}
                            rows={3}
                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm outline-none focus:border-red-400 focus:ring-8 focus:ring-red-500/5 transition-all resize-none"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => sendOutreachMessage(student.id)}
                              disabled={sendingOutreach || !outreachMessage.trim()}
                              className="flex-1 bg-red-600 text-white py-3 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-stone-900 transition-all border-0 cursor-pointer disabled:opacity-50 shadow-lg shadow-red-600/10 active:scale-95"
                            >
                              {sendingOutreach ? 'Sending...' : 'Send Message'}
                            </button>
                            <button
                              onClick={() => { setMessageStudent(null); setOutreachMessage(''); }}
                              className="px-5 py-3 bg-stone-50 text-stone-400 rounded-2xl text-xs font-bold uppercase tracking-widest hover:text-stone-900 transition-all border border-stone-100 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setMessageStudent(student.id)}
                          className="w-full bg-stone-900 text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-all border-0 cursor-pointer shadow-lg shadow-stone-900/10 active:scale-95"
                        >
                          Send Message
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="max-w-2xl premium-card p-12 mx-auto shadow-red-900/[0.02]">
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 mb-10">Tutor Schedule</h2>
            {upcomingSessions.filter(s => !s.is_group).length === 0 ? (
              <div className="text-center py-20 bg-stone-50/50 rounded-[32px] border border-dashed border-stone-200">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-stone-100">
                  <span className="text-3xl">🗓️</span>
                </div>
                <p className="text-lg font-bold text-stone-900 tracking-tight">No upcoming 1-on-1s</p>
                <p className="text-sm text-stone-400 mt-2 max-w-xs mx-auto leading-relaxed">Accept session proposals from your students in the Messages tab.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {upcomingSessions.filter(s => !s.is_group).map(session => (
                  <div key={session.id} className="relative pl-8 group bg-white border border-stone-100 p-8 rounded-[32px] shadow-sm hover:shadow-xl hover:shadow-red-900/[0.03] transition-all">
                    <div className="absolute top-0 left-0 w-2 h-full bg-red-100 rounded-full group-hover:bg-red-500 transition-colors"></div>
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-red-600 m-0">Student: {session.other_name}</p>
                      <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(153,27,27,0.3)]"></span>
                    </div>
                    <h4 className="text-2xl text-stone-900 font-bold m-0 mb-4 tracking-tight">{session.date}</h4>
                    <div className="flex items-center gap-6 text-sm text-stone-500 font-bold tracking-tight flex-wrap mb-6">
                      <span className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-stone-50 flex items-center justify-center text-[11px]">🕒</div>
                        {session.time}
                      </span>
                      <span className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-stone-50 flex items-center justify-center text-[11px]">⏱</div>
                        {session.duration_minutes} min
                      </span>
                      <span className="flex items-center gap-2.5 capitalize">
                        <div className="w-6 h-6 rounded-lg bg-stone-50 flex items-center justify-center text-[11px]">{session.format === 'in-person' ? '🏠' : '💻'}</div>
                        {session.format || 'online'} Format
                      </span>
                    </div>
                    {session.subjects && JSON.parse(session.subjects).length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-stone-50">
                        {JSON.parse(session.subjects).map((s, idx) => (
                          <span key={idx} className="bg-red-50/50 text-red-600 px-4 py-1.5 rounded-xl text-[10px] font-bold border border-red-100/50 uppercase tracking-widest">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Group Sessions Tab */}
        {activeTab === 'group-sessions' && (
          <div className="max-w-5xl mx-auto">
            <div className="premium-card p-10 bento-hover shadow-red-900/[0.02]">
              <div className="flex items-center justify-between mb-12">
                <div className="space-y-1">
                  <h2 className="text-3xl font-bold tracking-tight text-stone-900">Group Learning Management</h2>
                  <p className="text-stone-400 text-sm font-medium">Collaborative classes with multiple students.</p>
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
                  <p className="text-sm text-stone-400 mt-2 max-w-xs mx-auto leading-relaxed">Start a collective thread with your students to schedule your first group class.</p>
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
                        Manage Collective Session
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
                      {profile.name?.charAt(0)?.toUpperCase() || 'T'}
                    </div>
                    <div>
                      <h2 className="text-4xl font-bold tracking-tight text-stone-900 mb-2">{profile.name || 'Anonymous Mentor'}</h2>
                      <div className="flex items-center gap-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-100">{formatLabel[profile.format_type] || profile.format_type}</p>
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

                {profile.bio && (
                  <div className="mb-12">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1 mb-6">Professional Narrative</h3>
                    <p className="text-base text-stone-700 leading-relaxed font-medium bg-stone-50/50 p-8 rounded-[32px] border border-stone-100/50 border-l-4 border-l-red-500">{profile.bio}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">Specializations</h3>
                    <div className="flex flex-wrap gap-2.5">
                      {profile.subjects?.map((s, i) => (
                        <span key={i} className="bg-white text-stone-700 px-5 py-2 rounded-2xl text-xs font-bold border border-stone-100 shadow-sm hover:border-red-200 transition-colors">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">Academic Levels</h3>
                    <div className="flex flex-wrap gap-2.5">
                      {profile.grade_levels?.map((g, i) => (
                        <span key={i} className="bg-stone-50 text-stone-500 px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-tight border border-stone-100">{g}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {profile.skills && (
                  <div className="mt-12 pt-12 border-t border-stone-50">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1 mb-4">Core Competencies</h3>
                    <p className="text-sm text-stone-500 font-bold tracking-tight bg-white p-6 rounded-2xl border border-stone-50 shadow-sm">{profile.skills}</p>
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
                      className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold text-sm hover:bg-red-600 transition-all border-0 cursor-pointer disabled:opacity-50 shadow-xl shadow-stone-900/20 active:scale-95"
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
                    <p className="text-stone-400 text-sm font-medium">Update your professional information.</p>
                  </div>
                  <button 
                    onClick={() => { setEditMode(false); setIsVerified(false); }}
                    className="bg-stone-50 text-stone-400 hover:text-stone-900 px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase border border-stone-100 cursor-pointer transition-all"
                  >
                    Discard Changes
                  </button>
                </div>
                <form onSubmit={saveProfile} className="space-y-10">
                  {editMsg && (
                    <div className="bg-emerald-50/50 border border-emerald-100 text-emerald-700 text-sm font-bold px-5 py-4 rounded-2xl animate-in fade-in slide-in-from-top-2">{editMsg}</div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">Full Name</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="w-full px-5 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm outline-none focus:border-red-400 focus:ring-8 focus:ring-red-500/5 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">Age</label>
                        <input
                          type="number"
                          value={editForm.age}
                          onChange={(e) => setEditForm({...editForm, age: e.target.value})}
                          className="w-full px-5 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm outline-none focus:border-red-400 focus:ring-8 focus:ring-red-500/5 transition-all"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">ZIP Code</label>
                        <input
                          type="text"
                          value={editForm.zip_code}
                          onChange={(e) => setEditForm({...editForm, zip_code: e.target.value})}
                          className="w-full px-5 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm outline-none focus:border-red-400 focus:ring-8 focus:ring-red-500/5 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">Core Specializations</label>
                    <div className="flex flex-wrap gap-2.5">
                      {SUBJECTS.map(subject => (
                        <button
                          key={subject}
                          type="button"
                          onClick={() => toggleSubject(subject)}
                          className={`px-6 py-2.5 rounded-2xl text-[11px] font-bold tracking-widest uppercase transition-all duration-300 border cursor-pointer ${
                            editForm.subjects.includes(subject)
                              ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/10'
                              : 'bg-white text-stone-400 border-stone-100 hover:border-red-100 hover:text-stone-600'
                          }`}
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">Target Grade Levels</label>
                    <div className="flex flex-wrap gap-2.5">
                      {GRADES.map(grade => (
                        <button
                          key={grade}
                          type="button"
                          onClick={() => toggleGrade(grade)}
                          className={`px-5 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-tight transition-all duration-300 border cursor-pointer ${
                            editForm.grade_levels.includes(grade)
                              ? 'bg-stone-900 text-white border-stone-900 shadow-md'
                              : 'bg-white text-stone-400 border-stone-100 hover:border-stone-200'
                          }`}
                        >
                          {grade}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">Key Qualifications / Skills</label>
                    <input
                      type="text"
                      value={editForm.skills}
                      onChange={(e) => setEditForm({...editForm, skills: e.target.value})}
                      placeholder="e.g. PhD in Mathematics, 10+ years experience"
                      className="w-full px-5 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm outline-none focus:border-red-400 focus:ring-8 focus:ring-red-500/5 transition-all font-bold tracking-tight"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">Session Delivery Format</label>
                    <div className="flex gap-3">
                      {[
                        { value: 'online', label: 'Remote / Online' },
                        { value: 'in-person', label: 'Local / In-Person' },
                        { value: 'both', label: 'Hybrid / Either' },
                      ].map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setEditForm({...editForm, format_type: opt.value})}
                          className={`flex-1 py-4 rounded-2xl text-xs font-bold tracking-tight transition-all duration-300 border cursor-pointer ${
                            editForm.format_type === opt.value
                              ? 'bg-stone-900 text-white border-stone-900 shadow-xl shadow-stone-900/10 scale-[1.02]'
                              : 'bg-white text-stone-500 border-stone-100 hover:border-red-200'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">Professional Biography</label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                      rows={6}
                      className="w-full px-5 py-4 bg-stone-50 border border-stone-100 rounded-[24px] text-sm outline-none focus:border-red-400 focus:ring-8 focus:ring-red-500/5 transition-all resize-none font-medium leading-relaxed"
                    />
                  </div>

                  <div className="pt-8 flex gap-4">
                    <button
                      type="submit"
                      disabled={editSaving}
                      className="flex-1 bg-red-600 text-white px-10 py-5 rounded-[24px] text-sm font-bold uppercase tracking-widest hover:bg-stone-900 border-0 cursor-pointer disabled:opacity-50 transition-all shadow-2xl shadow-red-600/20 active:scale-95"
                    >
                      {editSaving ? 'Syncing...' : 'Confirm & Save Changes'}
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
