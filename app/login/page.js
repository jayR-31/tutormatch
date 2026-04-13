'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Image from 'next/image';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') || 'student';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
