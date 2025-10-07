import { useState } from 'react'
import { searchGISAddress, validateGISAddress, parseGISAddress, getGISStats } from '../../utils/gisNumbering'
import { GISAddress } from '../../utils/gisNumbering'

interface GISSearchProps {
  onAddressSelect: (address: GISAddress) => void
}

export default function GISSearch({ onAddressSelect }: GISSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<GISAddress[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<GISAddress | null>(null)
  const [stats] = useState(getGISStats())

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    
    try {
      // البحث في العناوين
      const results = searchGISAddress(searchQuery)
      setSearchResults(results)
      
      // إذا كان البحث عن كود GIS
      if (validateGISAddress(searchQuery)) {
        const parsed = parseGISAddress(searchQuery)
        if (parsed) {
          // إنشاء عنوان من الكود
          const address: GISAddress = {
            blockNumber: `SQ-${parsed.sector}`,
            plotNumber: parsed.plotNumber.toString(),
            houseNumber: parsed.houseNumber.toString(),
            streetName: 'شارع سلطان قابوس',
            sector: parsed.sector,
            coordinates: { x: 0, y: 0 },
            fullAddress: `مدينة سلطان قابوس، القطاع ${parsed.sector}، قطعة ${parsed.plotNumber}، منزل ${parsed.houseNumber}`,
            gisCode: searchQuery
          }
          setSelectedAddress(address)
          onAddressSelect(address)
        }
      }
    } catch (error) {
      console.error('خطأ في البحث:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddressSelect = (address: GISAddress) => {
    setSelectedAddress(address)
    onAddressSelect(address)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">البحث في نظام GIS</h2>
        <p className="text-gray-600">ابحث عن المنازل باستخدام كود GIS أو اسم القطاع</p>
      </div>

      {/* شريط البحث */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="أدخل كود GIS (مثل: SQ-A-001-1001) أو اسم القطاع"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            dir="ltr"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
          >
            {isSearching ? 'جاري البحث...' : 'بحث'}
          </button>
        </div>
        
        {/* أمثلة */}
        <div className="mt-2 text-xs text-gray-500">
          أمثلة: <code className="bg-gray-100 px-1 rounded">SQ-A-001-1001</code> أو <code className="bg-gray-100 px-1 rounded">القطاع الأول</code>
        </div>
      </div>

      {/* إحصائيات النظام */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">إحصائيات نظام GIS</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-600">الكتل</div>
            <div className="font-semibold">{stats.totalBlocks}</div>
          </div>
          <div>
            <div className="text-gray-600">القطع</div>
            <div className="font-semibold">{stats.totalPlots}</div>
          </div>
          <div>
            <div className="text-gray-600">المنازل</div>
            <div className="font-semibold">{stats.estimatedHouses}</div>
          </div>
          <div>
            <div className="text-gray-600">القطاعات</div>
            <div className="font-semibold">{stats.sectors.join(', ')}</div>
          </div>
        </div>
      </div>

      {/* نتائج البحث */}
      {searchResults.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">نتائج البحث ({searchResults.length})</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {searchResults.map((address, index) => (
              <div
                key={index}
                onClick={() => handleAddressSelect(address)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedAddress?.gisCode === address.gisCode
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-gray-800">
                      المنزل رقم {address.houseNumber}
                    </div>
                    <div className="text-sm text-gray-600">
                      {address.fullAddress}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      كود GIS: {address.gisCode}
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <div>القطاع {address.sector}</div>
                    <div>القطعة {address.plotNumber}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* العنوان المحدد */}
      {selectedAddress && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">العنوان المحدد</h3>
          <div className="text-sm text-green-700">
            <div className="font-medium">{selectedAddress.fullAddress}</div>
            <div className="mt-1">
              <span className="font-medium">كود GIS:</span> {selectedAddress.gisCode}
            </div>
            <div>
              <span className="font-medium">الكتلة:</span> {selectedAddress.blockNumber}
            </div>
            <div>
              <span className="font-medium">الشارع:</span> {selectedAddress.streetName}
            </div>
          </div>
        </div>
      )}

      {/* رسالة عدم وجود نتائج */}
      {searchResults.length === 0 && searchQuery && !isSearching && (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-gray-600">لم يتم العثور على نتائج</p>
          <p className="text-sm text-gray-500 mt-1">جرب البحث بكود GIS أو اسم القطاع</p>
        </div>
      )}
    </div>
  )
}
