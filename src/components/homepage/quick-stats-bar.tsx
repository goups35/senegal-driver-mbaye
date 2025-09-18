'use client'

interface QuickStatsBarProps {
  stats: {
    rating: string;
    trips: string;
    satisfaction: string;
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

        {/* Trips Stat */}
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-ocean-blue" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-medium text-baobab-brown">{stats.trips} voyages</span>
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-sahel-sand"></div>

        {/* Satisfaction Stat */}
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-senegal-green" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-medium text-baobab-brown">{stats.satisfaction} satisfaction</span>
        </div>
      </div>
    </div>
  )
}