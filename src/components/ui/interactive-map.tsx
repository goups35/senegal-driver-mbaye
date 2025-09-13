'use client'

import { useState, useEffect } from 'react'

interface Location {
  id: string
  name: string
  coordinates: [number, number] // [lat, lng]
  description?: string
}

interface InteractiveMapProps {
  locations?: Location[]
  className?: string
}

export default function InteractiveMap({ 
  locations = [], 
  className = '' 
}: InteractiveMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Default Senegal locations
  const defaultLocations: Location[] = [
    {
      id: 'dakar',
      name: 'Dakar',
      coordinates: [14.693425, -17.447938],
      description: 'Capitale du Sénégal'
    },
    {
      id: 'saint-louis',
      name: 'Saint-Louis',
      coordinates: [16.0199, -16.4989],
      description: 'Ville historique classée UNESCO'
    },
    {
      id: 'saly',
      name: 'Saly',
      coordinates: [14.447, -16.863],
      description: 'Station balnéaire populaire'
    }
  ]

  const displayLocations = locations.length > 0 ? locations : defaultLocations

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => setMapLoaded(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (!mapLoaded) {
    return (
      <div className={`bg-gray-100 rounded-lg p-8 text-center ${className}`}>
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative bg-blue-50 rounded-lg overflow-hidden ${className}`}>
      {/* Simplified map representation */}
      <div className="relative h-96 bg-gradient-to-b from-blue-200 to-blue-100">
        <div className="absolute inset-0 p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Destinations au Sénégal
          </h3>
          
          {/* Map points */}
          <div className="relative h-full">
            {displayLocations.map((location, index) => (
              <button
                key={location.id}
                onClick={() => setSelectedLocation(location)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg transition-all hover:scale-110"
                style={{
                  left: `${20 + index * 25}%`,
                  top: `${30 + index * 20}%`,
                }}
                aria-label={`Voir ${location.name}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Location details */}
        {selectedLocation && (
          <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg p-4 shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-gray-900">
                  {selectedLocation.name}
                </h4>
                {selectedLocation.description && (
                  <p className="text-gray-600 text-sm mt-1">
                    {selectedLocation.description}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Coordonnées: {selectedLocation.coordinates[0].toFixed(4)}, {selectedLocation.coordinates[1].toFixed(4)}
                </p>
              </div>
              <button
                onClick={() => setSelectedLocation(null)}
                className="text-gray-400 hover:text-gray-600 ml-4"
                aria-label="Fermer"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Location list */}
      <div className="p-4 bg-white border-t">
        <h4 className="font-medium text-gray-800 mb-2">Destinations disponibles:</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {displayLocations.map((location, index) => (
            <button
              key={location.id}
              onClick={() => setSelectedLocation(location)}
              className={`text-left p-2 rounded text-sm transition-colors ${
                selectedLocation?.id === location.id
                  ? 'bg-blue-100 text-blue-800'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <span className="inline-block w-5 h-5 bg-red-500 text-white rounded-full text-xs text-center leading-5 mr-2">
                {index + 1}
              </span>
              {location.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}