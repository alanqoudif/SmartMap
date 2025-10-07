import { useState, useMemo } from 'react'
import { House } from '../../types'
import muscatHouses from '../../data/muscat-houses-complete.json'

interface SearchBoxProps {
  onHouseSelect: (house: House) => void
}

export default function SearchBox({ onHouseSelect }: SearchBoxProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const houses = muscatHouses as House[]

  const filteredHouses = useMemo(() => {
    if (!searchTerm.trim()) return []
    
    return houses.filter(house => 
      house.houseNo.toString().includes(searchTerm) ||
      house.plotNo.toString().includes(searchTerm) ||
      house.area.includes(searchTerm) ||
      house.id.includes(searchTerm)
    ).slice(0, 8) // Limit to 8 suggestions
  }, [searchTerm])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    setShowSuggestions(value.length > 0)
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredHouses.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredHouses.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredHouses.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < filteredHouses.length) {
          handleHouseSelect(filteredHouses[selectedIndex])
        } else if (filteredHouses.length === 1) {
          handleHouseSelect(filteredHouses[0])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleHouseSelect = (house: House) => {
    onHouseSelect(house)
    setSearchTerm('')
    setShowSuggestions(false)
    setSelectedIndex(-1)
  }

  const handleInputFocus = () => {
    if (searchTerm.length > 0) {
      setShowSuggestions(true)
    }
  }

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 200)
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder="ابحث عن عنوان (مثال: 1 أو القرم أو مطرح)"
          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-right"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {showSuggestions && filteredHouses.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {filteredHouses.map((house, index) => (
            <button
              key={house.id}
              onClick={() => handleHouseSelect(house)}
              className={`w-full px-4 py-3 text-right hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  قطعة {house.plotNo}
                </div>
                <div className="font-medium">
                  المنزل {house.houseNo}
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {house.area} • {house.areaM2} م² • {house.rooms} غرف
              </div>
            </button>
          ))}
        </div>
      )}

      {showSuggestions && filteredHouses.length === 0 && searchTerm.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 text-center text-gray-500">
          لا توجد نتائج
        </div>
      )}
    </div>
  )
}
