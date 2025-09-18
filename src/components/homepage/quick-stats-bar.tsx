'use client'

interface QuickStatsBarProps {
  stats: {
    rating: string;
    trips: string;
  }
}

export function QuickStatsBar({ stats }: QuickStatsBarProps) {
  return (
    <div className="flex justify-center items-center px-4 mb-12">
      {/* Glass-morphism container with consistent styling */}
      <div className="flex flex-wrap justify-center items-center gap-3 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-xl shadow-sm border border-sahel-sand mobile-touch-safe">

        {/* Rating Stat */}
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-teranga-orange" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-xs font-medium text-baobab-brown">{stats.rating}</span>
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-sahel-sand"></div>

        {/* Trips/Reviews Stat */}
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-ocean-blue" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-medium text-baobab-brown">{stats.trips}</span>
        </div>
      </div>
    </div>
  )
}