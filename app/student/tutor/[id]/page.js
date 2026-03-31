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
  const [error, setError] = useState('');
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
    setError('');
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: parseInt(id), content: messageText }),
      });
      if (res.ok) {
        setMessageSent(true);
        setMessageText('');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to send message');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
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
        <div className="text-center py-20 text-stone-400 font-bold text-[10px] uppercase tracking-[0.3em]">Decoding Profile...</div>
      </>
    );
  }

  if (!tutor) {
    return (
      <>
        <Navbar />
        <div className="text-center py-24">
          <p className="text-stone-500 font-bold text-xs uppercase tracking-widest mb-6">Expertise Profile Not Found</p>
          <button 
            onClick={() => router.back()} 
            className="text-red-600 bg-red-50 px-6 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest border border-red-100 hover:bg-stone-900 hover:text-white transition-all duration-300 cursor-pointer shadow-lg shadow-red-900/5"
          >
            ← Return to Discovery
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen mesh-bg py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => router.back()} 
            className="group flex items-center gap-2 text-[10px] font-bold text-stone-400 hover:text-red-600 bg-transparent border-0 cursor-pointer mb-12 transition-colors uppercase tracking-[0.2em]"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Return to Discovery
          </button>

          <div className="bg-white/60 glass-panel rounded-[40px] p-8 sm:p-16 shadow-2xl shadow-red-900/5 bento-hover">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-10 mb-16 border-b border-stone-100 pb-16">
              <div className="w-32 h-32 rounded-[36px] bg-red-600 flex items-center justify-center text-white font-bold text-4xl shadow-2xl shadow-red-600/20 transform hover:scale-105 transition-transform duration-500 ring-8 ring-red-50">
                {tutor.name?.charAt(0)?.toUpperCase() || 'T'}
              </div>
              <div className="text-center md:text-left pt-2">
                <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-red-100/50 mb-4">
                  Verified Educator
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-stone-900 mb-2">{tutor.name}</h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-6 text-stone-400 font-bold text-[11px] uppercase tracking-widest mt-4">
                  <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    {formatLabel[tutor.format_type] || tutor.format_type}
                  </span>
                  {tutor.zip_code && (
                    <span className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-stone-300 rounded-full" />
                      Location: {tutor.zip_code}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              <div className="lg:col-span-12 space-y-12">
                {/* Bio */}
                {tutor.bio && (
                  <div className="space-y-4">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400 ml-1">Professional Introduction</h2>
                    <p className="text-lg text-stone-600 leading-relaxed font-medium">{tutor.bio}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Subjects */}
                  {tutor.subjects?.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400 ml-1">Subject Expertise</h2>
                      <div className="flex flex-wrap gap-2.5">
                        {tutor.subjects.map((s, i) => (
                          <span key={i} className="bg-stone-900 text-white px-5 py-2 rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-stone-900/10 hover:bg-red-600 transition-colors cursor-default">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="space-y-12">
                    {/* Grade Levels */}
                    {tutor.grade_levels?.length > 0 && (
                      <div className="space-y-3">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400 ml-1">Grade Levels</h2>
                        <div className="flex flex-wrap gap-2 text-stone-600 text-sm font-bold uppercase tracking-wider">
                          {tutor.grade_levels.map((g, i) => (
                            <span key={i} className="bg-stone-100/80 px-4 py-1.5 rounded-full">{g}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {tutor.skills && (
                      <div className="space-y-3">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400 ml-1">Specialized Skills</h2>
                        <p className="text-stone-600 text-sm font-bold uppercase tracking-widest leading-loose">{tutor.skills}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Section */}
                {user && user.role === 'student' && (
                  <div className="mt-16 bg-stone-50/50 rounded-[32px] p-8 sm:p-12 border border-stone-100">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400 ml-1">Direct Secure Connection</h2>
                    </div>
                    {error && (
                      <div className="bg-red-50 text-red-600 text-[10px] font-bold px-6 py-4 rounded-2xl border border-red-100 mb-6 uppercase tracking-widest animate-in fade-in slide-in-from-top-2">{error}</div>
                    )}
                    {messageSent ? (
                      <div className="bg-stone-900 text-white text-xs font-bold px-8 py-6 rounded-2xl shadow-xl shadow-stone-900/20 animate-in zoom-in-95 duration-500">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-lg">✓</div>
                          <div>
                            <p className="uppercase tracking-[0.2em] mb-1">Inquiry Transmitted Successfully</p>
                            <p className="opacity-60 font-medium">Continue this dialogue in your messaging interface.</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-4">
                        <input
                          type="text"
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          placeholder="Begin your inquiry here..."
                          className="flex-1 px-8 py-5 bg-white border border-stone-200 rounded-[24px] text-sm font-medium outline-none focus:border-red-400 focus:ring-8 focus:ring-red-500/5 transition-all shadow-sm"
                        />
                        <button
                          onClick={sendMessage}
                          disabled={sendingMessage || !messageText.trim()}
                          className="bg-stone-900 text-white px-10 py-5 rounded-[24px] font-bold text-sm uppercase tracking-widest hover:bg-red-600 border-0 cursor-pointer disabled:opacity-50 transition-all shadow-xl shadow-stone-900/10 active:scale-95"
                        >
                          {sendingMessage ? 'Transmitting...' : 'Send Message'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {!user && (
                  <div className="mt-16 border-t border-stone-100 pt-16 text-center">
                    <p className="text-[11px] font-bold text-stone-400 uppercase tracking-[0.3em]">
                      Authenticating Required to Initiate Connection
                    </p>
                    <a 
                      href="/login?role=student" 
                      className="inline-block mt-6 text-red-600 no-underline font-bold text-xs uppercase tracking-widest hover:text-stone-900 transition-colors border-b-2 border-red-100 hover:border-stone-900 pb-1"
                    >
                      Authenticate Account
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
