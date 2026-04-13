'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.user) setUser(data.user);
      })
      .catch((err) => { console.error('Auth check failed:', err); });
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  return (
    <nav className="fixed w-full top-6 z-50 flex justify-center px-6 pointer-events-none">
      <div className="glass-panel rounded-full px-4 sm:px-8 py-2 overflow-hidden pointer-events-auto border-white/20 shadow-xl shadow-red-900/5 max-w-5xl w-full flex justify-between items-center h-14">
        <Link href="/" className="flex items-center no-underline hover:opacity-80 transition-all active:scale-95">
          <div className="flex items-center gap-3">
            <div className="h-10 w-auto flex items-center justify-center overflow-hidden">
              <Image
                src="/logo_premium.png"
                alt="TutorMatch Logo"
                width={32}
                height={32}
                className="h-full w-auto object-contain"
              />
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          {user ? (
            <>
              <Link
                href={`/${user.role}/dashboard`}
                className="text-[11px] uppercase tracking-[0.15em] text-slate-500 hover:text-red-600 no-underline font-bold transition-all"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-[11px] uppercase tracking-[0.15em] text-slate-400 hover:text-red-500 bg-transparent border-0 cursor-pointer font-bold transition-all"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[11px] uppercase tracking-[0.15em] text-stone-500 hover:text-red-600 no-underline font-bold transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-[11px] uppercase tracking-[0.15em] bg-red-600 text-white px-5 py-2 rounded-full hover:bg-stone-900 no-underline font-bold transition-all shadow-md shadow-red-500/10 active:scale-95"
              >
                Join
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
