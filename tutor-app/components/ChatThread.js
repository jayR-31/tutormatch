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
  const [isProposing, setIsProposing] = useState(false);

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
          date: propDate,
          time: propTime,
          duration_minutes: parseInt(propDuration),
          format: propFormat
        })
      });
      if (res.ok) {
        setShowProposal(false);
        setPropDate('');
        setPropTime('');
        setPropDuration('60');
        setPropFormat('online');
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
    <div className="flex flex-col h-full bg-white/40 relative">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white/60 glass-panel">
        <h3 className="text-sm font-mono uppercase tracking-widest text-gray-900 font-semibold m-0">{otherName || 'Conversation'}</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm font-mono py-10">
            No messages yet. Start the conversation!
          </div>
        )}
        {messages.map((msg) => {
          const isOwn = msg.sender_id === currentUserId;
          const isProposal = msg.type === 'proposal';

          return (
            <div key={msg.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-xs sm:max-w-md px-5 py-3.5 rounded-2xl text-sm transition-all ${
                  isOwn
                    ? 'bg-gray-900 text-white rounded-br-sm shadow-sm'
                    : 'bg-white/80 border border-gray-200 text-gray-800 rounded-bl-sm bento-hover'
                } ${isProposal ? 'border-orange-200 bg-orange-50/50' : ''}`}
              >
                {!isOwn && (
                  <p className="text-xs font-mono uppercase tracking-widest text-orange-600 font-semibold mb-1 m-0">{msg.sender_name}</p>
                )}
                
                {isProposal ? (
                  <div className="mt-1">
                    <p className="font-semibold text-gray-900 m-0 mb-2">🗓 Session Proposal</p>
                    <div className="text-sm text-gray-700 bg-white/60 p-3 rounded-lg border border-gray-100 mb-3 font-mono">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400">Date:</span>
                        <span>{msg.session_date}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400">Time:</span>
                        <span>{msg.session_time}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400">Duration:</span>
                        <span>{msg.session_duration} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Format:</span>
                        <span className="capitalize">{msg.session_format || 'online'}</span>
                      </div>
                    </div>
                    
                    {msg.session_status === 'pending' ? (
                      isOwn ? (
                        <p className="text-xs text-orange-500 font-medium italic m-0">Awaiting response...</p>
                      ) : (
                        <div className="flex gap-2 mt-2">
                          <button 
                            onClick={() => handleProposalResponse(msg.reference_id, 'accepted')}
                            className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-xs font-medium hover:bg-green-600 transition-colors cursor-pointer border-0"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleProposalResponse(msg.reference_id, 'declined')}
                            className="flex-1 bg-white border border-gray-200 text-gray-600 py-2 rounded-lg text-xs font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer"
                          >
                            Decline
                          </button>
                        </div>
                      )
                    ) : (
                      <p className={`text-xs font-medium italic m-0 ${msg.session_status === 'accepted' ? 'text-green-600' : 'text-red-500'}`}>
                        {msg.session_status === 'accepted' ? '✅ Accepted' : '❌ Declined'}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="m-0 leading-relaxed font-light">{msg.content}</p>
                )}
                
                <p className={`text-[10px] font-mono mt-2 m-0 text-right ${isOwn ? 'text-gray-400' : 'text-gray-400'}`}>
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
        <div className="absolute bottom-20 left-6 sm:w-80 bg-white border border-gray-200 rounded-2xl shadow-xl p-5 z-20 bento-hover">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-bold text-gray-900 m-0">Propose a Session</h4>
            <button onClick={() => setShowProposal(false)} className="text-gray-400 hover:text-gray-700 bg-transparent border-0 cursor-pointer">✕</button>
          </div>
          <form onSubmit={handleSendProposal} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-gray-500 mb-1">Date</label>
              <input 
                type="date" 
                required
                value={propDate}
                onChange={e => setPropDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase text-gray-500 mb-1">Time</label>
                <input 
                  type="time" 
                  required
                  value={propTime}
                  onChange={e => setPropTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-400"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-gray-500 mb-1">Duration</label>
                <select 
                  value={propDuration}
                  onChange={e => setPropDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-400 bg-white"
                >
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">1 hr</option>
                  <option value="90">1.5 hr</option>
                  <option value="120">2 hr</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-gray-500 mb-1">Format</label>
              <select 
                value={propFormat}
                onChange={e => setPropFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-400 bg-white"
              >
                <option value="online">💻 Online</option>
                <option value="in-person">🏫 In-Person</option>
              </select>
            </div>
            <button 
              type="submit" 
              disabled={isProposing}
              className="w-full bg-orange-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-orange-600 border-0 cursor-pointer disabled:opacity-50"
            >
              {isProposing ? 'Sending...' : 'Send Proposal'}
            </button>
          </form>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-6 py-4 border-t border-gray-100 bg-white/60 glass-panel flex gap-3 relative">
        <button
          type="button"
          onClick={() => setShowProposal(!showProposal)}
          className={`flex items-center justify-center w-12 h-[50px] rounded-xl text-lg border-0 cursor-pointer transition-colors ${
            showProposal ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
          title="Schedule Session"
        >
          📅
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-5 py-3.5 bg-white/80 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all font-light"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="bg-gray-900 text-white px-6 h-[50px] rounded-xl text-sm font-semibold border-0 cursor-pointer hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
