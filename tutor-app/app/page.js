import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen mesh-bg overflow-hidden relative">
        {/* Subtle decorative elements */}
        <div className="absolute top-20 right-[-100px] w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-40 left-[-100px] w-96 h-96 bg-orange-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 py-24 sm:py-32 relative z-10">
          
          {/* Hero Content */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 border border-orange-100 text-orange-800 text-xs font-medium tracking-wide mb-8 glass-panel">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              The modern way to learn
            </div>
            <h1 className="text-5xl sm:text-7xl font-bold text-gray-900 mb-6 tracking-tight leading-[1.1]">
              Find the right tutor, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400">right away.</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto font-light leading-relaxed">
              Connect with highly qualified tutors tailored exactly to your subject, grade level, and location. No complicated matching—just results.
            </p>
          </div>

          {/* Bento Box Layout for Onboarding */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-5xl mx-auto">
            
            {/* Student Block - Spans 7 columns on Desktop */}
            <div className="lg:col-span-7 bg-white/70 glass-panel rounded-3xl p-8 sm:p-10 bento-hover relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 font-mono text-9xl font-bold tracking-tighter text-orange-900 group-hover:scale-110 transition-transform duration-700 ease-out pointer-events-none">
                S
              </div>
              <div className="relative z-10">
                <span className="text-sm font-mono tracking-widest text-orange-600 uppercase mb-4 block font-semibold">For Students</span>
                <h3 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Accelerate your learning.</h3>
                <p className="text-gray-600 mb-8 max-w-sm">
                  Search by zip code and subject. Instantly message tutors who fit your exact academic needs.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/register?role=student"
                    className="inline-flex justify-center items-center bg-gray-900 text-white px-6 py-3.5 rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors duration-200"
                  >
                    Create Student Account
                  </Link>
                  <Link
                    href="/login?role=student"
                    className="inline-flex justify-center items-center bg-white border border-gray-200 text-gray-900 px-6 py-3.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>

            {/* Tutor Block - Spans 5 columns on Desktop */}
            <div className="lg:col-span-5 bg-orange-600 rounded-3xl p-8 sm:p-10 bento-hover text-white relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 p-8 opacity-10 font-mono text-9xl font-bold tracking-tighter text-white group-hover:-translate-y-4 group-hover:-translate-x-4 transition-transform duration-700 ease-out pointer-events-none">
                T
              </div>
              <div className="relative z-10">
                <span className="text-sm font-mono tracking-widest text-orange-200 uppercase mb-4 block font-semibold">For Tutors</span>
                <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">Share your expertise.</h3>
                <p className="text-orange-100 mb-8 font-light text-sm">
                  List your skills. Let motivated students find you locally or online.
                </p>
                <div className="flex flex-col gap-3">
                  <Link
                    href="/register?role=tutor"
                    className="inline-flex justify-center items-center bg-white text-orange-600 px-6 py-3.5 rounded-xl text-sm font-semibold hover:bg-orange-50 transition-colors duration-200"
                  >
                    Join as Tutor
                  </Link>
                  <Link
                    href="/login?role=tutor"
                    className="inline-flex justify-center items-center bg-transparent border border-orange-400 text-white px-6 py-3.5 rounded-xl text-sm font-medium hover:bg-orange-500 transition-colors duration-200"
                  >
                    Tutor Login
                  </Link>
                </div>
              </div>
            </div>

            {/* How It Works - Small Horizontal Blocks */}
            <div className="lg:col-span-4 bg-white/50 glass-panel rounded-3xl p-8 bento-hover">
              <div className="text-orange-600 font-mono font-bold text-xl mb-3">01 // Profile</div>
              <h4 className="font-semibold text-gray-900 mb-2">Create & Customize</h4>
              <p className="text-sm text-gray-500">Sign up in seconds. Tell us what you need to learn or are qualified to teach.</p>
            </div>
            
            <div className="lg:col-span-4 bg-white/50 glass-panel rounded-3xl p-8 bento-hover">
              <div className="text-orange-600 font-mono font-bold text-xl mb-3">02 // Discover</div>
              <h4 className="font-semibold text-gray-900 mb-2">Smart Filtering</h4>
              <p className="text-sm text-gray-500">Filter instantly by distance, grade level, format, and subject matter.</p>
            </div>

            <div className="lg:col-span-4 bg-white/50 glass-panel rounded-3xl p-8 bento-hover">
              <div className="text-orange-600 font-mono font-bold text-xl mb-3">03 // Connect</div>
              <h4 className="font-semibold text-gray-900 mb-2">Direct Messaging</h4>
              <p className="text-sm text-gray-500">Reach out through our seamless platform to organize your very first session.</p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="py-12 px-6 text-center text-sm text-gray-400 border-t border-gray-200/50 mt-10">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="font-medium">TutorMatch</p>
            <p>© 2026 Crafted with intent.</p>
          </div>
        </footer>
      </main>
    </>
  );
}
