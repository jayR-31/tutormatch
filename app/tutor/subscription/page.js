'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function TutorSubscription() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if already subscribed
    const checkSubscription = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (!res.ok || !data.user) {
          router.push('/login');
          return;
        }
        if (data.user.role !== 'tutor') {
          router.push('/student/dashboard');
          return;
        }
        if (data.user.subscribed) {
          router.push('/tutor/dashboard');
          return;
        }
      } catch {
        // Continue to show subscription page
      }
      setChecking(false);
    };
    checkSubscription();
  }, [router]);

  const handleSubscribe = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to start checkout');
        setLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch {
      setError('Something went wrong');
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen mesh-bg flex items-center justify-center">
          <p className="text-stone-400 font-bold text-[10px] uppercase tracking-[0.3em]">Loading...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen mesh-bg py-24 px-4 flex justify-center">
        <div className="w-full max-w-lg">
          {/* Subscription Card */}
          <div className="bg-white/60 glass-panel rounded-[40px] p-10 sm:p-14 shadow-2xl shadow-red-900/5 bento-hover">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-red-600 rounded-[20px] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-xl shadow-red-600/20">
                T
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-stone-900 mb-3">Tutor Subscription</h1>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400">Activate your teaching profile</p>
            </div>

            {/* Price */}
            <div className="text-center mb-10">
              <div className="inline-flex items-baseline gap-1">
                <span className="text-5xl font-bold text-stone-900">$15</span>
                <span className="text-stone-400 font-bold text-sm">/month</span>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-10">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-stone-700">Unlimited student connections</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-stone-700">Messaging & session scheduling</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-stone-700">Profile visible to all students</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-stone-700">Receive payments from students</span>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-[11px] font-bold bg-red-50 p-4 rounded-2xl border border-red-100 mb-6 uppercase tracking-tighter">
                {error}
              </div>
            )}

            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full bg-red-600 text-white py-5 rounded-[24px] font-bold text-sm uppercase tracking-[0.2em] hover:bg-stone-900 border-0 cursor-pointer disabled:opacity-50 transition-all shadow-2xl shadow-red-600/20 active:scale-95"
            >
              {loading ? 'Redirecting to Checkout...' : 'Subscribe — $15/month'}
            </button>

            {/* Details text */}
            <div className="mt-8 p-5 bg-stone-50/80 rounded-2xl border border-stone-100">
              <p className="text-xs text-stone-500 leading-relaxed text-center">
                You pay a <span className="font-bold text-stone-700">$15/month subscription</span> to be listed as a tutor on our platform.
                Students can then pay you directly through our platform or in another way you both agree on.
              </p>
            </div>

            <p className="text-center text-stone-300 text-[10px] mt-6 font-bold uppercase tracking-[0.15em]">
              Cancel anytime. Secure payment via Stripe.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
