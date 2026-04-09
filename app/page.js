import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen mesh-bg overflow-hidden relative selection:bg-red-100 selection:text-red-900">
        {/* Subtle decorative elements */}
        {/* Premium Background Accents */}
        <div className="absolute top-[10%] right-[-5%] w-[45%] h-[45%] bg-red-600/5 rounded-full blur-[120px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-[5%] left-[-8%] w-[50%] h-[50%] bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 sm:pt-48 relative z-10">
          
          {/* Hero Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
            <div className="text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-100 text-red-700 text-[10px] font-bold tracking-[0.2em] uppercase mb-10 shadow-sm shadow-red-900/5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                The Next Generation of Learning
              </div>
              <h1 className="text-6xl sm:text-8xl font-bold text-stone-900 mb-8 tracking-tight leading-[0.95] text-balance">
                Master any <br />
                <span className="text-red-600 italic">subject.</span>
              </h1>
              <p className="text-xl text-stone-500 max-w-lg font-light leading-relaxed mb-12 text-balance">
                Forge meaningful connections with world-class tutors. A bespoke marketplace designed for precision learning and academic excellence.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register?role=student"
                  className="inline-flex justify-center items-center bg-red-600 text-white px-8 py-4 rounded-2xl text-base font-bold hover:bg-stone-900 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-red-600/20 active:scale-95"
                >
                  Start Learning Now
                </Link>
                <Link
                  href="/register?role=tutor"
                  className="inline-flex justify-center items-center bg-white border border-stone-200 text-stone-900 px-8 py-4 rounded-2xl text-base font-bold hover:border-red-200 hover:bg-red-50/30 transition-all duration-300 active:scale-95"
                >
                  Join as a Tutor
                </Link>
              </div>
            </div>

            <div className="relative group lg:block hidden">
              <div className="absolute inset-0 bg-red-600/10 rounded-[40px] blur-2xl group-hover:bg-red-600/15 transition-all duration-700" />
              <div className="relative rounded-[40px] overflow-hidden border border-white/50 shadow-2xl glass-panel aspect-[4/5]">
                <img 
                  src="/hero_image.png" 
                  alt="TutorMatch Red and Cream Abstract Hero" 
                  className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                />
              </div>
            </div>
          </div>

          {/* Value Propositions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 font-bold text-xl border border-red-100 shadow-sm">
                01
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-4 tracking-tight text-balance">Curated Profiles</h3>
              <p className="text-sm text-stone-500 font-medium leading-relaxed">Discover elite tutors vetted for academic excellence and pedagogical mastery.</p>
            </div>

            <div className="space-y-6">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 font-bold text-xl border border-red-100 shadow-sm">
                02
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-4 tracking-tight text-balance">Smart Scheduling</h3>
              <p className="text-sm text-stone-500 font-medium leading-relaxed">Integrated session management that respects your time and learning pace.</p>
            </div>

            <div className="space-y-6">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 font-bold text-xl border border-red-100 shadow-sm">
                03
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-4 tracking-tight text-balance">Direct Connect</h3>
              <p className="text-sm text-stone-500 font-medium leading-relaxed">Secure, direct messaging to facilitate deep academic inquiry and coordination.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-stone-100 flex flex-col sm:flex-row justify-between items-center gap-8">
          <Link href="/about" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-stone-900 group-hover:bg-red-600 flex items-center justify-center text-white text-[10px] font-bold shadow-lg shadow-stone-900/10 transition-all duration-300 group-hover:-translate-y-1">
              TM
            </div>
            <p className="font-bold text-stone-900 tracking-tight m-0 transition-colors group-hover:text-red-700">TutorMatch</p>
          </Link>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">© 2026 TutorMatch. Elevated Learning.</p>
        </footer>
      </main>
    </>
  );
}
