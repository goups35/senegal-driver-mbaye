'use client'

import { useState, useEffect } from 'react'

interface MapLocation {
  id: string
  name: string
  latitude: number
  longitude: number
  description?: string
  type?: 'destination' | 'landmark' | 'accommodation' | 'restaurant'
}

interface InteractiveMapProps {
  locations: MapLocation[]
  center?: [number, number]
  zoom?: number
  className?: string
  onLocationSelect?: (location: MapLocation) => void
}

export default function InteractiveMap({ 
  locations, 
  center = [14.7167, -17.4677], // Dakar coordinates
  zoom = 10,
  className = '',
  onLocationSelect 
}: InteractiveMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleLocationClick = (location: MapLocation) => {
    setSelectedLocation(location)
    onLocationSelect?.(location)
  }

  if (isLoading) {
    return (
      <div className={`relative h-96 bg-gray-200 rounded-lg animate-pulse ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-500">Chargement de la carte...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative h-96 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg overflow-hidden ${className}`}>
      {/* Map placeholder - In a real implementation, this would be replaced with a proper map library */}
      <div className="absolute inset-0 bg-blue-50">
        <div className="absolute inset-4 bg-white bg-opacity-50 rounded-lg border-2 border-dashed border-blue-300 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="text-2xl">🗺️</div>
            <p className="text-sm text-gray-600">Carte interactive du Sénégal</p>
            <p className="text-xs text-gray-500">
              {locations.length} destination{locations.length > 1 ? 's' : ''} disponible{locations.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Location markers */}
      <div className="absolute inset-0">
        {locations.map((location, index) => {
          // Simulate marker positions based on location names
          const markerPosition = {
            left: `${20 + (index * 15) % 60}%`,
            top: `${30 + (index * 10) % 40}%`
          }

          return (
            <button
              key={location.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg transition-colors z-10"
              style={markerPosition}
              onClick={() => handleLocationClick(location)}
              title={location.name}
            >
              {index + 1}
            </button>
          )
        })}
      </div>

      {/* Selected location info */}
      {selectedLocation && (
        <div className="absolute bottom-4 left-4 right-4 bg-white bg-opacity-95 rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-800">{selectedLocation.name}</h3>
              {selectedLocation.description && (
                <p className="text-sm text-gray-600 mt-1">{selectedLocation.description}</p>
              )}
              {selectedLocation.type && (
                <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {selectedLocation.type}
                </span>
              )}
            </div>
            <button
              className="text-gray-400 hover:text-gray-600 ml-2"
              onClick={() => setSelectedLocation(null)}
              aria-label="Fermer les informations"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Map controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <button className="bg-white hover:bg-gray-50 border border-gray-300 rounded w-8 h-8 flex items-center justify-center text-gray-600 shadow">
          +
        </button>
        <button className="bg-white hover:bg-gray-50 border border-gray-300 rounded w-8 h-8 flex items-center justify-center text-gray-600 shadow">
          −
        </button>
      </div>
    </div>
  )
}