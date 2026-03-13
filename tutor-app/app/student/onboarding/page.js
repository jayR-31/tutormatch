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
        <div className="w-full max-w-xl bg-white/60 glass-panel rounded-3xl p-8 sm:p-10 bento-hover">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Complete Profile.</h1>
            <p className="text-xs font-mono uppercase tracking-widest text-gray-500 font-semibold mb-2">Tell us about yourself so we can find the best tutors</p>
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
                  min="5"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-semibold mb-2">Grade</label>
                <select
                  value={form.grade}
                  onChange={(e) => setForm({...form, grade: e.target.value})}
                  className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all appearance-none"
                >
                  <option value="">Select grade</option>
                  {GRADES.map(g => (
                    <option key={g} value={g}>{g} Grade</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-semibold mb-2">School Name</label>
              <input
                type="text"
                value={form.school}
                onChange={(e) => setForm({...form, school: e.target.value})}
                className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                placeholder="Your school"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-semibold mb-2">ZIP Code</label>
              <input
                type="text"
                value={form.zip_code}
                onChange={(e) => setForm({...form, zip_code: e.target.value})}
                className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                placeholder="Required for in-person tutoring"
                maxLength="10"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-semibold mb-3">Tutoring Format</label>
              <div className="flex gap-3">
                {[
                  { value: 'online', label: 'Online' },
                  { value: 'in-person', label: 'In-Person' },
                  { value: 'either', label: 'Either' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({...form, format_pref: opt.value})}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium border cursor-pointer transition-all duration-200 ${
                      form.format_pref === opt.value
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
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-semibold mb-3">Subjects You Need Help With</label>
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
