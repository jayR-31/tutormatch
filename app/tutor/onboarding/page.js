'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

const SUBJECTS = ['Math', 'Science', 'English', 'History', 'Other'];
const GRADES = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

export default function TutorOnboarding() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    age: '',
    zip_code: '',
    subjects: [],
    skills: '',
    format_type: 'online',
    bio: '',
    grade_levels: [],
  });

  const toggleSubject = (subject) => {
    setForm(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const toggleGrade = (grade) => {
    setForm(prev => ({
      ...prev,
      grade_levels: prev.grade_levels.includes(grade)
        ? prev.grade_levels.filter(g => g !== grade)
        : [...prev.grade_levels, grade]
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
      const res = await fetch('/api/tutors/profile', {
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

      router.push('/tutor/subscription');
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
            <div className="w-20 h-20 bg-red-600 rounded-[28px] flex items-center justify-center text-white text-3xl font-bold mx-auto mb-8 shadow-xl shadow-red-600/20">
              T
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-stone-900 mb-3 text-balance">Professional Identity</h1>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400">Complete your educator profile</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            {error && <div className="bg-red-50 text-red-600 text-xs font-bold p-4 rounded-2xl border border-red-100 uppercase tracking-tighter">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="md:col-span-2 space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 ml-1">Legal Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  required
                  className="w-full px-6 py-4 bg-white/80 border border-stone-200 rounded-2xl text-sm outline-none focus:border-red-400 focus:ring-8 focus:ring-red-500/5 transition-all"
                  placeholder="How students will address you"
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
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 ml-1">Service ZIP Code</label>
                <input
                  type="text"
                  value={form.zip_code}
                  onChange={(e) => setForm({...form, zip_code: e.target.value})}
                  className="w-full px-6 py-4 bg-white/80 border border-stone-200 rounded-2xl text-sm outline-none focus:border-red-400 focus:ring-8 focus:ring-red-500/5 transition-all"
                  placeholder="Local area visibility"
                />
              </div>
            </div>

            <div className="space-y-5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 ml-1">Primary Subjects</label>
              <div className="flex flex-wrap gap-2.5">
                {['Mathematics', 'Science', 'English', 'History', 'Coding', 'Music', 'Arts', 'Test Prep'].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSubject(s)}
                    className={`px-6 py-2.5 rounded-2xl text-[11px] font-bold tracking-widest uppercase border cursor-pointer transition-all duration-300 ${
                      form.subjects.includes(s)
                        ? 'bg-stone-900 text-white border-stone-900 shadow-lg shadow-stone-900/10'
                        : 'bg-white/80 text-stone-500 border-stone-200 hover:border-red-200 hover:text-stone-900'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 ml-1">Grade Level Expertise</label>
              <div className="flex flex-wrap gap-2.5">
                {['Elementary', 'Middle School', 'High School', 'University'].map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGrade(g)}
                    className={`px-6 py-2.5 rounded-2xl text-[11px] font-bold tracking-widest uppercase border cursor-pointer transition-all duration-300 ${
                      form.grade_levels.includes(g)
                        ? 'bg-stone-900 text-white border-stone-900 shadow-lg shadow-stone-900/10'
                        : 'bg-white/80 text-stone-500 border-stone-200 hover:border-red-200 hover:text-stone-900'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 ml-1">Distinctive Skills & Expertise</label>
              <input
                type="text"
                value={form.skills}
                onChange={(e) => setForm({...form, skills: e.target.value})}
                className="w-full px-6 py-4 bg-white/80 border border-stone-200 rounded-2xl text-sm outline-none focus:border-red-400 focus:ring-8 focus:ring-red-500/5 transition-all"
                placeholder="e.g. SAT Specialist, Python Expert, Bilingual"
              />
            </div>

            <div className="space-y-5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 ml-1">Service Delivery Formats</label>
              <div className="flex flex-wrap gap-2.5">
                {['online', 'in-person', 'both'].map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setForm({...form, format_type: f})}
                    className={`px-6 py-3 rounded-2xl text-[11px] font-bold tracking-widest uppercase border cursor-pointer transition-all duration-300 ${
                      form.format_type === f
                        ? 'bg-stone-900 text-white border-stone-900 shadow-lg shadow-stone-900/10'
                        : 'bg-white/80 text-stone-500 border-stone-200 hover:border-red-200 hover:text-stone-900'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 ml-1">Professional Introduction</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({...form, bio: e.target.value})}
                rows={4}
                className="w-full px-6 py-4 bg-white/80 border border-stone-200 rounded-[24px] text-sm outline-none focus:border-red-400 focus:ring-8 focus:ring-red-500/5 transition-all resize-none font-medium leading-relaxed"
                placeholder="Share your teaching philosophy and experience with prospective students..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-5 rounded-[24px] font-bold text-sm uppercase tracking-[0.2em] hover:bg-stone-900 border-0 cursor-pointer disabled:opacity-50 mt-4 transition-all shadow-2xl shadow-red-600/20 active:scale-95"
            >
              {loading ? 'Initializing Profile...' : 'Finalize & Enter Dashboard'}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
