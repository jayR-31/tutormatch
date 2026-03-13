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

      router.push('/tutor/dashboard');
    } catch {
      setError('Something went wrong');
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen mesh-bg py-24 px-4 flex justify-center">
        <div className="w-full max-w-xl bg-white/60 glass-panel rounded-3xl p-8 sm:p-10 bento-hover">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Set Up Your Profile.</h1>
            <p className="text-xs font-mono uppercase tracking-widest text-gray-500 font-semibold mb-2">Create a profile that helps students find you</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50/50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
            )}

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-semibold mb-2">Full Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                placeholder="Your full name"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-semibold mb-2">Age</label>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({...form, age: e.target.value})}
                  className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                  placeholder="Age"
                  min="18"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-semibold mb-2">ZIP Code</label>
                <input
                  type="text"
                  value={form.zip_code}
                  onChange={(e) => setForm({...form, zip_code: e.target.value})}
                  className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                  placeholder="ZIP code"
                  maxLength="10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-semibold mb-3">Subjects You Teach</label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map(subject => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => toggleSubject(subject)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium border cursor-pointer transition-all duration-200 ${
                      form.subjects.includes(subject)
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
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-semibold mb-3">Grade Levels You Tutor</label>
              <div className="flex flex-wrap gap-2">
                {GRADES.map(grade => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => toggleGrade(grade)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border cursor-pointer transition-all duration-200 ${
                      form.grade_levels.includes(grade)
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
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-semibold mb-2">Skills & Expertise</label>
              <input
                type="text"
                value={form.skills}
                onChange={(e) => setForm({...form, skills: e.target.value})}
                className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                placeholder="e.g., Calculus, Essay Writing, SAT Prep"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-semibold mb-3">Tutoring Format</label>
              <div className="flex gap-3">
                {[
                  { value: 'online', label: 'Online' },
                  { value: 'in-person', label: 'In-Person' },
                  { value: 'both', label: 'Both' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({...form, format_type: opt.value})}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium border cursor-pointer transition-all duration-200 ${
                      form.format_type === opt.value
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
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-semibold mb-2">Short Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({...form, bio: e.target.value})}
                rows={4}
                className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
                placeholder="Tell students about yourself, your teaching style, and experience..."
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-sm hover:bg-orange-700 border-0 cursor-pointer disabled:opacity-50 mt-4 transition-colors"
              >
                {loading ? 'Saving...' : 'Complete Profile'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
