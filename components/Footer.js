'use client';

import { useState } from 'react';
import Link from 'next/link';
import TermsModal from './TermsModal';

export default function Footer() {
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  return (
    <footer className="w-full border-t border-stone-100 bg-white/50 backdrop-blur-sm mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 sm:gap-16">
          {/* Left Section: Branding */}
          <div className="flex flex-col gap-6 max-w-xs">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="h-8 w-auto">
                <img 
                  src="/logo_premium.png" 
                  alt="TutorMatch Logo" 
                  className="h-full w-auto object-contain"
                />
              </div>
              <span className="font-bold text-stone-900 tracking-tight text-lg">TutorMatch</span>
            </Link>
            <p className="text-sm text-stone-500 font-medium leading-relaxed">
              Elevating the standard of learning through a bespoke marketplace for academic excellence.
            </p>
          </div>

          {/* Right Section: Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 sm:gap-24">
            <div className="flex flex-col gap-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600/80">Platform</h4>
              <nav className="flex flex-col gap-3">
                <Link href="/" className="text-sm text-stone-500 hover:text-red-700 transition-colors font-medium">Home</Link>
                <Link href="/register?role=student" className="text-sm text-stone-500 hover:text-red-700 transition-colors font-medium">Find a Tutor</Link>
                <Link href="/register?role=tutor" className="text-sm text-stone-500 hover:text-red-700 transition-colors font-medium">Join as Tutor</Link>
              </nav>
            </div>
            
            <div className="flex flex-col gap-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600/80">Company</h4>
              <nav className="flex flex-col gap-3">
                <Link href="/about" className="text-sm text-stone-500 hover:text-red-700 transition-colors font-medium">About Creator</Link>
                <Link href="/about" className="text-sm text-stone-500 hover:text-red-700 transition-colors font-medium">Mission</Link>
                <Link href="/about" className="text-sm text-stone-500 hover:text-red-700 transition-colors font-medium">Vision</Link>
              </nav>
            </div>

            <div className="flex flex-col md:hidden lg:flex flex flex-col gap-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600/80">Legal</h4>
              <nav className="flex flex-col gap-3">
                <span className="text-sm text-stone-400 font-medium cursor-default">Privacy Policy</span>
                <button 
                  onClick={() => setIsTermsOpen(true)}
                  className="text-sm text-stone-500 hover:text-red-700 transition-colors font-medium bg-transparent border-0 cursor-pointer text-left p-0"
                >
                  Terms and Conditions
                </button>
              </nav>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-stone-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
            © 2026 TutorMatch. Crafted for Excellence.
          </p>
          <div className="flex gap-6">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Systems Active"></div>
          </div>
        </div>
      </div>

      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </footer>
  );
}
