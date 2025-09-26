'use client'

import { GalleryCategory } from '@/types/gallery'

interface GalleryFiltersProps {
  categories: GalleryCategory[]
  activeCategory: string
  onCategoryChange: (categoryId: string) => void
}

export function GalleryFilters({ categories, activeCategory, onCategoryChange }: GalleryFiltersProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-8">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`
            px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105
            ${activeCategory === category.id
              ? 'bg-senegal-green text-white shadow-lg scale-105'
              : 'bg-white text-senegal-green border-2 border-senegal-green hover:bg-senegal-green hover:text-white'
            }
          `}
        >
          <span className="flex items-center gap-2">
            {category.name}
            <span className={`
              text-xs px-2 py-1 rounded-full
              ${activeCategory === category.id
                ? 'bg-white/20 text-white'
                : 'bg-senegal-green/10 text-senegal-green'
              }
            `}>
              {category.count}
            </span>
          </span>
        </button>
      ))}
    </div>
  )
}