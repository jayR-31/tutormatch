import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function AboutCreatorPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen mesh-bg overflow-hidden relative selection:bg-red-100 selection:text-red-900">
        {/* Decorative elements */}
        <div className="absolute top-[10%] left-[-5%] w-[45%] h-[45%] bg-red-600/5 rounded-full blur-[120px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-[5%] right-[-8%] w-[50%] h-[50%] bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 pt-32 pb-24 relative z-10 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-stone-500 hover:text-red-600 transition-colors mb-12 text-sm font-bold uppercase tracking-[0.2em]"
          >
            ← Back to Home
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-100 text-red-700 text-[10px] font-bold tracking-[0.2em] uppercase mb-10 shadow-sm shadow-red-900/5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            Meet the Creator
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold text-stone-900 mb-8 tracking-tight leading-[0.95]">
            Vision through <br />
            <span className="text-red-600 italic">Precision.</span>
          </h1>

          <div className="relative mt-20 mb-20 group">
            <div className="absolute inset-0 bg-red-600/10 rounded-[40px] blur-2xl group-hover:bg-red-600/15 transition-all duration-700" />
            <div className="relative glass-panel rounded-[40px] p-12 border border-white/50 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end max-w-4xl mx-auto">
                {/* Creator 1 (Left) */}
                <div className="flex flex-col items-center gap-6 group">
                  <div className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-xl border-4 border-white group-hover:scale-[1.02] transition-transform duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-stone-900 opacity-10" />
                    <img 
                      src="/creator_jay.jpg" 
                      alt="Jay Rungta - Creator of TutorMatch" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <h2 className="text-xl font-bold text-stone-900 tracking-tight">Jay Rungta</h2>
                    <p className="text-[11px] font-bold text-red-600/80 uppercase tracking-widest whitespace-nowrap">
                      (VCJH 6th grader, CEO and Founder)
                    </p>
                  </div>
                </div>

                {/* Creator 2 (Right) */}
                <div className="flex flex-col items-center gap-6 group">
                  <div className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-xl border-4 border-white group-hover:scale-[1.02] transition-transform duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-stone-900 opacity-10" />
                    <img 
                      src="/creator_jay_2.png" 
                      alt="Viraj Rungta - Creator of TutorMatch" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <h2 className="text-xl font-bold text-stone-900 tracking-tight">Viraj Rungta</h2>
                    <p className="text-[11px] font-bold text-red-600/80 uppercase tracking-widest whitespace-nowrap">
                      (BCP 9th grader, Tech Assistant)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="premium-card p-8">
              <h3 className="text-xl font-bold text-stone-900 mb-4 tracking-tight">The Mission</h3>
              <p className="text-stone-500 font-medium leading-relaxed">
                My brother and I are dedicated to connecting tutors with students, streamlining the process to make everyone's job easier.
              </p>
            </div>
            <div className="premium-card p-8">
              <h3 className="text-xl font-bold text-stone-900 mb-4 tracking-tight">The Vision</h3>
              <p className="text-stone-500 font-medium leading-relaxed">
                Elevating the standard of online learning into a bespoke, personalized experience that feels as premium as it is effective.
              </p>
            </div>
          </div>
        </div>

        {/* Subtle Footer for About Page */}
        <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-stone-100 flex justify-center items-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">© 2026 TutorMatch. Crafted for Excellence.</p>
        </footer>
      </main>
    </>
  );
}
