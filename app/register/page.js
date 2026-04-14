'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

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
  const [googleLoading, setGoogleLoading] = useState(false);

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

  const handleGoogleSignUp = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const { email, displayName, uid } = result.user;

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, displayName, uid, role, zipCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Google sign-up failed');
        setGoogleLoading(false);
        return;
      }

      router.push(data.redirect);
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-up failed');
      }
      setGoogleLoading(false);
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

        <div className="flex items-center gap-4 my-2">
          <div className="flex-1 h-px bg-stone-200"></div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">or</span>
          <div className="flex-1 h-px bg-stone-200"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 bg-white text-stone-700 py-4 rounded-2xl font-bold text-sm border border-stone-200 cursor-pointer disabled:opacity-50 transition-all hover:bg-stone-50 hover:border-stone-300 active:scale-95 shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {googleLoading ? 'Signing up...' : 'Sign up with Google'}
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
