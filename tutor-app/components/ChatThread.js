'use client';

import { useState, useRef, useEffect } from 'react';

export default function ChatThread({ messages, currentUserId, otherId, onSendMessage, otherName, onRefreshMessages }) {
  const [newMessage, setNewMessage] = useState('');
  const [showProposal, setShowProposal] = useState(false);
  
  // Proposal Form State
  const [propDate, setPropDate] = useState('');
  const [propTime, setPropTime] = useState('');
  const [propDuration, setPropDuration] = useState('60');
  const [propFormat, setPropFormat] = useState('online');
  const [propSubjects, setPropSubjects] = useState([]);
  const [isProposing, setIsProposing] = useState(false);

  const SUBJECTS_LIST = ['Math', 'Science', 'English', 'History', 'Other'];

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    onSendMessage(newMessage.trim());
    setNewMessage('');
  };

  const handleSendProposal = async (e) => {
    e.preventDefault();
    if (!propDate || !propTime || !propDuration) return;
    
    setIsProposing(true);
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: otherId,
          conversationId: messages[0]?.conversation_id,
          date: propDate,
          time: propTime,
          duration_minutes: parseInt(propDuration),
          format: propFormat,
          subjects: propSubjects
        })
      });
      if (res.ok) {
        setShowProposal(false);
        setPropDate('');
        setPropTime('');
        setPropDuration('60');
        setPropFormat('online');
        setPropSubjects([]);
        if (onRefreshMessages) onRefreshMessages();
      }
    } catch (err) {
      console.error(err);
    }
    setIsProposing(false);
  };

  const handleProposalResponse = async (sessionId, status) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok && onRefreshMessages) {
        onRefreshMessages();
      }
    } catch (err) {
      console.error('Failed to update session status', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-stone-50/50 relative">
      {/* Header */}
      <div className="px-8 py-5 border-b border-stone-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(153,27,27,0.5)]"></div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 m-0">{otherName || 'Secure Thread'}</h3>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 opacity-30 grayscale">
            <span className="text-4xl mb-4">✨</span>
            <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Begin the discovery</p>
          </div>
        )}
        {messages.map((msg) => {
          const isOwn = msg.sender_id === currentUserId;
          const isProposal = msg.type === 'proposal';

          return (
            <div key={msg.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
              <div
                className={`max-w-[85%] sm:max-w-md px-6 py-4 rounded-[24px] text-sm shadow-sm transition-all relative ${
                  isOwn
                    ? 'bg-red-600 text-white rounded-br-none'
                    : 'bg-white border border-stone-100 text-stone-700 rounded-bl-none'
                } ${isProposal ? 'border-red-100 bg-red-50/10 !max-w-xs' : ''}`}
              >
                {!isOwn && (
                  <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 m-0 ${isProposal ? 'text-red-600' : 'text-stone-400'}`}>
                    {msg.sender_name}
                  </p>
                )}
                
                {isProposal ? (
                  <div className="mt-1">
                    <div className="flex items-center gap-2 mb-4 border-b border-red-100 pb-3">
                      <span className="text-lg">🗓️</span>
                      <p className="font-bold text-stone-900 m-0 tracking-tight">Session Proposal</p>
                    </div>
                    <div className="text-[11px] text-stone-600 space-y-3 font-bold tracking-tight mb-4">
                      <div className="flex justify-between items-center bg-white/50 p-2.5 rounded-xl border border-red-50/50">
                        <span className="text-stone-400 uppercase tracking-tighter">Event Date</span>
                        <span className="text-red-600">{msg.session_date}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/50 p-2.5 rounded-xl border border-red-50/50">
                        <span className="text-stone-400 uppercase tracking-tighter">Scheduled Time</span>
                        <span className="text-red-600">{msg.session_time}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/50 p-2.5 rounded-xl border border-red-50/50">
                        <span className="text-stone-400 uppercase tracking-tighter">Block Length</span>
                        <span className="text-red-600">{msg.session_duration} min</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/50 p-2.5 rounded-xl border border-red-50/50">
                        <span className="text-stone-400 uppercase tracking-tighter">Venue Format</span>
                        <span className="text-red-600 capitalize">{msg.session_format || 'online'}</span>
                      </div>
                      {msg.session_subjects && JSON.parse(msg.session_subjects).length > 0 && (
                        <div className="pt-2">
                          <span className="text-stone-400 text-[9px] uppercase tracking-widest block mb-2">Subject Areas</span>
                          <div className="flex flex-wrap gap-1.5">
                            {JSON.parse(msg.session_subjects).map((s, idx) => (
                              <span key={idx} className="bg-red-600 text-white px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-tighter">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {msg.session_status === 'pending' ? (
                      isOwn ? (
                        <div className="bg-stone-50 text-stone-400 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-center border border-stone-100">
                          Awaiting Confirmation
                        </div>
                      ) : (
                        <div className="flex gap-2 mt-4">
                          <button 
                            onClick={() => handleProposalResponse(msg.reference_id, 'accepted')}
                            className="flex-1 bg-red-600 text-white py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-stone-900 transition-all cursor-pointer border-0 shadow-lg shadow-red-600/10 active:scale-95"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleProposalResponse(msg.reference_id, 'declined')}
                            className="flex-1 bg-white border border-stone-200 text-stone-400 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-stone-50 hover:text-red-500 hover:border-red-100 transition-all cursor-pointer active:scale-95"
                          >
                            Decline
                          </button>
                        </div>
                      )
                    ) : (
                      <div className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-center border ${
                        msg.session_status === 'accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'
                      }`}>
                        {msg.session_status === 'accepted' ? '✅ Session Confirmed' : '❌ Proposal Declined'}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="m-0 leading-relaxed font-medium tracking-tight bg-transparent border-0">{msg.content}</p>
                )}
                
                <p className={`text-[9px] font-bold uppercase tracking-tighter mt-3 m-0 text-right opacity-40`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Proposal Popover */}
      {showProposal && (
        <div className="absolute bottom-24 left-8 right-8 sm:left-auto sm:w-96 premium-card p-8 z-20 shadow-2xl animate-in zoom-in-95 duration-200 border-red-100">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <span className="text-xl">📅</span>
              <h4 className="text-lg font-bold text-stone-900 m-0 tracking-tight">Schedule Session</h4>
            </div>
            <button onClick={() => setShowProposal(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 transition-all border-0 cursor-pointer text-xs">✕</button>
          </div>
          <form onSubmit={handleSendProposal} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400 ml-1">Event Date</label>
              <input 
                type="date" 
                required
                value={propDate}
                onChange={e => setPropDate(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:border-red-300 focus:ring-4 focus:ring-red-500/5 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400 ml-1">Start Time</label>
                <input 
                  type="time" 
                  required
                  value={propTime}
                  onChange={e => setPropTime(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:border-red-300 focus:ring-4 focus:ring-red-500/5 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400 ml-1">Duration</label>
                <select 
                  value={propDuration}
                  onChange={e => setPropDuration(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:border-red-300 focus:ring-4 focus:ring-red-500/5 transition-all bg-white"
                >
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">1 hr</option>
                  <option value="90">1.5 hr</option>
                  <option value="120">2 hr</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400 ml-1">Format Selection</label>
              <div className="flex gap-2">
                {['online', 'in-person'].map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setPropFormat(f)}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all cursor-pointer ${
                      propFormat === f ? 'bg-stone-900 text-white border-stone-900 shadow-lg' : 'bg-white text-stone-500 border-stone-100 hover:border-red-100'
                    }`}
                  >
                    {f === 'online' ? '💻 Online' : '🏠 In-Person'}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400 ml-1">Topic Areas (Max 3)</label>
              <div className="flex flex-wrap gap-1.5">
                {SUBJECTS_LIST.map(subject => {
                  const isSelected = propSubjects.includes(subject);
                  return (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setPropSubjects(propSubjects.filter(s => s !== subject));
                        } else if (propSubjects.length < 3) {
                          setPropSubjects([...propSubjects, subject]);
                        }
                      }}
                      className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-tight transition-all ${
                        isSelected 
                          ? 'bg-red-600 text-white border-red-600 shadow-md' 
                          : 'bg-white text-stone-400 border border-stone-100 hover:border-red-100'
                      } border cursor-pointer`}
                    >
                      {subject}
                    </button>
                  );
                })}
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isProposing}
              className="w-full bg-red-600 text-white py-4 rounded-[20px] text-sm font-bold uppercase tracking-[0.15em] hover:bg-stone-900 border-0 cursor-pointer disabled:opacity-50 transition-all shadow-xl shadow-red-600/20 active:scale-95"
            >
              {isProposing ? 'Syncing...' : 'Dispatch Proposal'}
            </button>
          </form>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-8 py-6 border-t border-stone-100 bg-white/90 backdrop-blur-md flex gap-4 relative">
        <button
          type="button"
          onClick={() => setShowProposal(!showProposal)}
          className={`flex items-center justify-center w-[60px] h-[60px] rounded-2xl text-xl border-0 cursor-pointer transition-all shadow-sm ${
            showProposal ? 'bg-red-600 text-white rotate-45' : 'bg-stone-100 text-stone-400 hover:bg-red-50 hover:text-red-600'
          }`}
          title="Schedule Session"
        >
          {showProposal ? '✕' : '📅'}
        </button>
        <div className="flex-1 relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Compose message..."
            className="w-full h-[60px] pl-6 pr-6 bg-stone-50 border border-stone-100 rounded-2xl text-sm outline-none focus:border-red-300 focus:ring-8 focus:ring-red-500/5 transition-all text-stone-700 font-medium placeholder:text-stone-300"
          />
        </div>
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="bg-stone-900 text-white px-8 h-[60px] rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] border-0 cursor-pointer hover:bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl shadow-stone-900/10 active:scale-95"
        >
          Dispatch
        </button>
      </form>
    </div>
  );
}
