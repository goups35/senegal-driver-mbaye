export interface GalleryImage {
  id: string
  src: string
  alt: string
  title: string
  category: 'visite' | 'destination'
  description?: string
  featured?: boolean
}

export interface GalleryCategory {
  id: string
  name: string
  description: string
  count: number
}