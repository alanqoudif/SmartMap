import React from 'react'

interface MapToggleProps {
  mapType: 'canvas' | 'google'
  onMapTypeChange: (type: 'canvas' | 'google') => void
}

export default function MapToggle({ mapType, onMapTypeChange }: MapToggleProps) {
  return (
    <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-lg z-10">
      <div className="flex space-x-2">
        <button
          onClick={() => onMapTypeChange('canvas')}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            mapType === 'canvas'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          خريطة افتراضية
        </button>
        <button
          onClick={() => onMapTypeChange('google')}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            mapType === 'google'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          خريطة Google
        </button>
      </div>
    </div>
  )
}
