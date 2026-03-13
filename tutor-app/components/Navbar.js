'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  return (
    <nav className="fixed w-full top-0 z-50 glass-panel border-b border-gray-200/50 bg-white/70">
      <div className="w-full mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 max-w-[100vw]">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center no-underline hover:opacity-80 transition-opacity">
            <img 
              src="/logo-v2.png" 
              alt="Tutor Match Logo" 
              className="h-12 sm:h-16 w-auto object-contain"
            />
          </Link>

          <div className="flex items-center gap-6">
            {user ? (
              <>
                <Link
                  href={`/${user.role}/dashboard`}
                  className="text-xs uppercase tracking-widest text-gray-500 hover:text-gray-900 no-underline font-semibold transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs uppercase tracking-widest text-orange-600 hover:text-orange-800 bg-transparent border-0 cursor-pointer font-semibold transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs uppercase tracking-widest text-gray-500 hover:text-gray-900 no-underline font-semibold transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-xs uppercase tracking-widest bg-gray-900 text-white px-5 py-2.5 rounded-full hover:bg-orange-600 no-underline font-semibold transition-colors"
                >
                  Join
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
