'use client';

import Link from 'next/link';

export default function TutorCard({ tutor }) {
  const formatLabel = {
    online: 'Online',
    'in-person': 'In-Person',
    both: 'Online & In-Person',
  };

  return (
    <div className="bg-white/60 glass-panel rounded-3xl p-6 sm:p-8 bento-hover relative overflow-hidden group">
      {/* Decorative letter */}
      <div className="absolute -top-4 -right-4 text-9xl font-mono font-bold text-gray-900/5 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
        {tutor.name ? tutor.name.charAt(0).toUpperCase() : 'T'}
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">{tutor.name || 'Unnamed'}</h3>
            <p className="text-xs font-mono uppercase tracking-widest text-orange-600 font-semibold">
              {formatLabel[tutor.format_type] || tutor.format_type}
            </p>
          </div>
          
          {tutor.zip_code && (
            <div className="text-xs font-mono text-gray-400 border border-gray-200 rounded-full px-3 py-1">
              {tutor.zip_code}
            </div>
          )}
        </div>

        {tutor.bio && (
          <p className="text-sm text-gray-600 mb-6 line-clamp-2 leading-relaxed font-light max-w-[90%]">
            {tutor.bio}
          </p>
        )}

        <div className="space-y-4 mb-8">
          {tutor.subjects && tutor.subjects.length > 0 && (
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold block mb-2">Expertise</span>
              <div className="flex flex-wrap gap-2">
                {tutor.subjects.map((subject, i) => (
                  <span key={i} className="text-xs text-gray-700 bg-gray-100/80 px-3 py-1.5 rounded-lg font-medium">
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          )}

          {tutor.grade_levels && tutor.grade_levels.length > 0 && (
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold block mb-1">Levels</span>
              <p className="text-sm text-gray-600 font-light">{tutor.grade_levels.join(', ')}</p>
            </div>
          )}
        </div>

        <Link
          href={`/student/tutor/${tutor.user_id}`}
          className="inline-flex w-full justify-center items-center bg-gray-900 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors duration-200"
        >
          View Full Profile
        </Link>
      </div>
    </div>
  );
}
