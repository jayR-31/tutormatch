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
            <div className="relative glass-panel rounded-[40px] p-12 text-left border border-white/50 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-stone-900 mb-6 tracking-tight">Jay Rungta</h2>
                  <p className="text-lg text-stone-500 font-light leading-relaxed mb-6">
                    Jay is a visionary designer and developer dedicated to refining the digital landscape of education. With a focus on aesthetic excellence and intuitive architecture, TutorMatch was born out of a desire to create a more meaningful connection between knowledge and those who seek it.
                  </p>
                  <p className="text-lg text-stone-500 font-light leading-relaxed">
                    By blending modern technology with timeless design principles, Jay aims to elevate the tutoring experience into something truly premium and accessible for everyone.
                  </p>
                </div>
                <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-stone-900 opacity-20" />
                  <img 
                    src="/creator_jay.jpg" 
                    alt="Jay Rungta - Creator of TutorMatch" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="premium-card p-8">
              <h3 className="text-xl font-bold text-stone-900 mb-4 tracking-tight">The Mission</h3>
              <p className="text-stone-500 font-medium leading-relaxed">
                To bridge the gap between world-class expertise and ambitious learners through a platform that respects the art of teaching.
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
