'use client';

import Link from 'next/link';

export default function TutorCard({ tutor }) {
  const formatLabel = {
    online: 'Online',
    'in-person': 'In-Person',
    both: 'Online & In-Person',
  };

  return (
    <div className="premium-card p-6 sm:p-8 group relative overflow-hidden">
      {/* Decorative letter */}
      <div className="absolute -top-6 -right-6 text-9xl font-bold text-stone-900/5 group-hover:scale-110 transition-all duration-700 pointer-events-none group-hover:text-red-600/5">
        {tutor.name ? tutor.name.charAt(0).toUpperCase() : 'T'}
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-stone-900 mb-1 active:text-red-600 transition-colors cursor-pointer">{tutor.name || 'Unnamed'}</h3>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(153,27,27,0.5)]"></span>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-red-600 m-0">
                {formatLabel[tutor.format_type] || tutor.format_type}
              </p>
            </div>
          </div>
          
          {tutor.zip_code && (
            <div className="text-[10px] font-bold tracking-wider text-stone-400 bg-stone-50 border border-stone-100 rounded-full px-3 py-1 uppercase">
              ZIP {tutor.zip_code}
            </div>
          )}
        </div>

        {tutor.bio && (
          <p className="text-sm text-stone-500 mb-8 line-clamp-2 leading-relaxed font-light max-w-[90%]">
            {tutor.bio}
          </p>
        )}

        <div className="space-y-6 mb-auto">
          {tutor.subjects && tutor.subjects.length > 0 && (
            <div>
              <span className="text-[10px] text-stone-400 uppercase tracking-[0.1em] font-bold block mb-3">Core Expertise</span>
              <div className="flex flex-wrap gap-1.5">
                {tutor.subjects.map((subject, i) => (
                  <span key={i} className="text-[11px] text-stone-600 bg-stone-50 px-3 py-1 rounded-lg font-bold border border-stone-100 group-hover:border-red-100 transition-colors">
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          )}

          {tutor.grade_levels && tutor.grade_levels.length > 0 && (
            <div>
              <span className="text-[10px] text-stone-400 uppercase tracking-[0.1em] font-bold block mb-1.5">Academic Levels</span>
              <p className="text-xs text-stone-500 font-medium tracking-tight">Support for {tutor.grade_levels.join(', ')}</p>
            </div>
          )}
        </div>

        <Link
          href={`/student/tutor/${tutor.user_id}`}
          className="mt-8 inline-flex w-full justify-center items-center bg-red-600 text-white px-6 py-3.5 rounded-2xl text-sm font-bold hover:bg-stone-900 transition-all duration-300 shadow-lg shadow-red-600/10 active:scale-[0.98]"
        >
          Explore Professional Profile
        </Link>
      </div>
    </div>
  );
}
