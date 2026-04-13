'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Image from 'next/image';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') || 'student';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [role, setRole] = useState(defaultRole);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, zipCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      router.push(data.redirect);
    } catch {
      setError('Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white/60 glass-panel rounded-[32px] p-8 sm:p-12 bento-hover shadow-2xl shadow-red-900/5">
      <div className="text-center mb-10 flex flex-col items-center">
        <Image 
          src="/logo-v2.png" 
          alt="Tutor Match Logo" 
          width={128}
          height={128}
          className="h-28 sm:h-32 w-auto object-contain mb-8 hover:scale-105 transition-transform duration-500"
          priority
        />
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 mb-2">Create Account</h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 bg-red-50 px-4 py-1.5 rounded-full border border-red-100/50">Join as a {role}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role Toggle */}
        <div className="flex bg-stone-100/80 p-1.5 rounded-[20px] mb-8">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`flex-1 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest border-0 cursor-pointer transition-all duration-300 ${
              role === 'student'
                ? 'bg-white text-stone-900 shadow-lg shadow-stone-900/5'
                : 'bg-transparent text-stone-400 hover:text-stone-900 hover:bg-white/40'
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setRole('tutor')}
            className={`flex-1 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest border-0 cursor-pointer transition-all duration-300 ${
              role === 'tutor'
                ? 'bg-white text-stone-900 shadow-lg shadow-stone-900/5'
                : 'bg-transparent text-stone-400 hover:text-stone-900 hover:bg-white/40'
            }`}
          >
            Tutor
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 ml-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-5 py-4 bg-white/80 border border-stone-200 rounded-2xl text-sm outline-none focus:border-red-400 focus:ring-8 focus:ring-red-500/5 transition-all"
            placeholder="you@email.com"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-5 py-4 bg-white/80 border border-stone-200 rounded-2xl text-sm outline-none focus:border-red-400 focus:ring-8 focus:ring-red-500/5 transition-all"
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 ml-1">Confirm</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-5 py-4 bg-white/80 border border-stone-200 rounded-2xl text-sm outline-none focus:border-red-400 focus:ring-8 focus:ring-red-500/5 transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 ml-1">ZIP Code</label>
          <input
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            required
            className="w-full px-5 py-4 bg-white/80 border border-stone-200 rounded-2xl text-sm outline-none focus:border-red-400 focus:ring-8 focus:ring-red-500/5 transition-all"
            placeholder="12345"
          />
        </div>

        {error && <div className="text-red-600 text-[11px] font-bold bg-red-50 p-4 rounded-2xl border border-red-100 animate-in fade-in slide-in-from-top-2 uppercase tracking-tighter">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-stone-900 text-white py-5 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-red-600 border-0 cursor-pointer disabled:opacity-50 transition-all shadow-xl shadow-stone-900/10 active:scale-95"
        >
          {loading ? 'Creating Account...' : 'Continue to Dashboard'}
        </button>

        <p className="text-center text-stone-400 text-[11px] mt-8 font-bold uppercase tracking-widest">
          Already have an account?{' '}
          <Link href={`/login?role=${role}`} className="text-red-600 no-underline font-bold hover:text-stone-900 transition-colors ml-1">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen mesh-bg flex flex-col justify-center py-24 px-4">
        <Suspense fallback={<div className="text-center py-20 text-stone-400 font-bold text-[10px] uppercase tracking-[0.3em]">Loading Secure Interface...</div>}>
          <RegisterForm />
        </Suspense>
      </main>
    </>
  );
}
