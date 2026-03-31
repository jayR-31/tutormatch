'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

const SUBJECTS = ['Math', 'Science', 'English', 'History', 'Other'];
const GRADES = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

export default function StudentOnboarding() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    age: '',
    grade: '',
    school: '',
    zip_code: '',
    format_pref: 'online',
    subjects: [],
  });

  const toggleSubject = (subject) => {
    setForm(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/students/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          age: form.age ? parseInt(form.age) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to save profile');
        setLoading(false);
        return;
      }

      router.push('/student/dashboard');
    } catch {
      setError('Something went wrong');
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen mesh-bg py-24 px-4 flex justify-center">
        <div className="w-full max-w-2xl bg-white/60 glass-panel rounded-[40px] p-10 sm:p-16 shadow-2xl shadow-red-900/5 bento-hover">
          <div className="text-center mb-16">
            <div className="w-20 h-20 bg-stone-900 rounded-[28px] flex items-center justify-center text-white text-3xl font-bold mx-auto mb-8 shadow-xl shadow-stone-900/20">
              S
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-stone-900 mb-3 text-balance">Student Profile</h1>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400">Personalize your learning journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            {error && <div className="bg-red-50 text-red-600 text-xs font-bold p-4 rounded-2xl border border-red-100 uppercase tracking-tighter">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="md:col-span-2 space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 ml-1">Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  required
                  className="w-full px-6 py-4 bg-white/80 border border-stone-200 rounded-2xl text-sm outline-none focus:border-red-400 focus:ring-8 focus:ring-red-500/5 transition-all"
                  placeholder="What should we call you?"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 ml-1">Current Age</label>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({...form, age: e.target.value})}
                  className="w-full px-6 py-4 bg-white/80 border border-stone-200 rounded-2xl text-sm outline-none focus:border-red-400 focus:ring-8 focus:ring-red-500/5 transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 ml-1">Academic Grade</label>
                <select
                  value={form.grade}
                  onChange={(e) => setForm({...form, grade: e.target.value})}
                  className="w-full px-6 py-4 bg-white/80 border border-stone-200 rounded-2xl text-sm outline-none focus:border-red-400 focus:ring-8 focus:ring-red-500/5 transition-all appearance-none"
                >
                  <option value="">Select Grade</option>
                  {GRADES.map(g => (
                    <option key={g} value={g}>{g} Grade</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 ml-1">Current Institution / School</label>
              <input
                type="text"
                value={form.school}
                onChange={(e) => setForm({...form, school: e.target.value})}
                className="w-full px-6 py-4 bg-white/80 border border-stone-200 rounded-2xl text-sm outline-none focus:border-red-400 focus:ring-8 focus:ring-red-500/5 transition-all"
                placeholder="e.g. Westview High"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 ml-1">Home ZIP Code</label>
              <input
                type="text"
                value={form.zip_code}
                onChange={(e) => setForm({...form, zip_code: e.target.value})}
                required
                className="w-full px-6 py-4 bg-white/80 border border-stone-200 rounded-2xl text-sm outline-none focus:border-red-400 focus:ring-8 focus:ring-red-500/5 transition-all"
                placeholder="12345"
              />
            </div>

            <div className="space-y-5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 ml-1">Preferred Learning Format</label>
              <div className="flex bg-stone-100/80 p-1.5 rounded-[20px]">
                {['online', 'in-person', 'either'].map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setForm({...form, format_pref: f})}
                    className={`flex-1 py-3 rounded-2xl text-[11px] font-bold tracking-widest uppercase border-0 cursor-pointer transition-all duration-300 ${
                      form.format_pref === f
                        ? 'bg-white text-stone-900 shadow-lg shadow-stone-900/5'
                        : 'bg-transparent text-stone-400 hover:text-stone-900 hover:bg-white/40'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 ml-1">Academic Interests</label>
              <div className="flex flex-wrap gap-2.5">
                {['Mathematics', 'Science', 'English', 'History', 'Coding', 'Music', 'Arts', 'Test Prep'].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSubject(s)}
                    className={`px-6 py-2.5 rounded-2xl text-[11px] font-bold tracking-widest uppercase border cursor-pointer transition-all duration-300 ${
                      form.subjects.includes(s)
                        ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/10'
                        : 'bg-white/80 text-stone-500 border-stone-200 hover:border-red-200 hover:text-stone-900'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-900 text-white py-5 rounded-[24px] font-bold text-sm uppercase tracking-[0.2em] hover:bg-red-600 border-0 cursor-pointer disabled:opacity-50 mt-4 transition-all shadow-2xl shadow-stone-900/20 active:scale-95"
            >
              {loading ? 'Processing Profile...' : 'Complete Profile & Get Started'}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
