'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') || 'student';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      router.push(data.redirect);
    } catch {
      setError('Something went wrong');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const { email, displayName, uid } = result.user;

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, displayName, uid, role: defaultRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Google sign-in failed');
        setGoogleLoading(false);
        return;
      }

      router.push(data.redirect);
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-in failed');
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
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 mb-2">Welcome Back</h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 bg-red-50 px-4 py-1.5 rounded-full border border-red-100/50">Secure Access Interface</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50/50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

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

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 ml-1">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-4 bg-white/80 border border-stone-200 rounded-2xl text-sm outline-none focus:border-red-400 focus:ring-8 focus:ring-red-500/5 transition-all"
            required
          />
        </div>
        
        {error && <div className="text-red-600 text-[11px] font-bold bg-red-50 p-4 rounded-2xl border border-red-100 animate-in fade-in slide-in-from-top-2 uppercase tracking-tighter">{error}</div>}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-stone-900 text-white py-5 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-red-600 border-0 cursor-pointer disabled:opacity-50 transition-all shadow-xl shadow-stone-900/10 active:scale-95"
        >
          {loading ? 'Entering...' : `Sign in as ${defaultRole}`}
        </button>

        <div className="flex items-center gap-4 my-2">
          <div className="flex-1 h-px bg-stone-200"></div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">or</span>
          <div className="flex-1 h-px bg-stone-200"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 bg-white text-stone-700 py-4 rounded-2xl font-bold text-sm border border-stone-200 cursor-pointer disabled:opacity-50 transition-all hover:bg-stone-50 hover:border-stone-300 active:scale-95 shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {googleLoading ? 'Signing in...' : 'Continue with Google'}
        </button>

        <p className="text-center text-stone-400 text-[11px] mt-8 font-bold uppercase tracking-widest leading-loose">
          Don&apos;t have an account?{' '}
          <Link href={`/register?role=${defaultRole}`} className="text-red-600 no-underline font-bold hover:text-stone-900 transition-colors ml-1">
            Create account
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen mesh-bg flex flex-col justify-center py-20 px-4">
        <Suspense fallback={<div className="text-center py-20 text-gray-400 font-mono text-sm">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </main>
    </>
  );
}
