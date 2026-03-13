'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

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
    <div className="w-full max-w-md mx-auto bg-white/60 glass-panel rounded-3xl p-8 sm:p-10 bento-hover">
      <div className="text-center mb-10 flex flex-col items-center">
        <img 
          src="/logo-v2.png" 
          alt="Tutor Match Logo" 
          className="h-28 sm:h-36 w-auto object-contain mb-8"
        />
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Welcome Back.</h1>
        <p className="text-xs font-mono uppercase tracking-widest text-gray-500 font-semibold">
          Sign in as {defaultRole}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50/50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-semibold mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
            placeholder="you@email.com"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 font-semibold mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-orange-600 border-0 cursor-pointer disabled:opacity-50 transition-colors mt-2"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-8">
        Don&apos;t have an account?{' '}
        <Link href={`/register?role=${defaultRole}`} className="text-orange-600 no-underline font-medium hover:text-gray-900 transition-colors">
          Sign Up
        </Link>
      </p>
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
