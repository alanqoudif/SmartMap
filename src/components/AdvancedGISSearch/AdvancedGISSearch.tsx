import { useState, useEffect } from 'react'
import { OMAN_GOVERNORATES } from '../../utils/qgisSystem'

interface AdvancedGISSearchProps {
  onSearchResult: (result: any) => void
  onClearSearch: () => void
}

interface SearchResult {
  id: string
  type: 'building' | 'parcel' | 'governorate' | 'wilayat'
  name: string
  details: string
  coordinates: { lat: number; lng: number }
  governorate: string
  wilayat: string
}

export default function AdvancedGISSearch({ onSearchResult, onClearSearch }: AdvancedGISSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'all' | 'buildings' | 'parcels' | 'governorates' | 'wilayats'>('all')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)

  // محاكاة البحث في قاعدة البيانات الشاملة
  const performSearch = async (query: string, type: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    
    // محاكاة تأخير البحث
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const results: SearchResult[] = []
    
    // البحث في المحافظات
    if (type === 'all' || type === 'governorates') {
      Object.entries(OMAN_GOVERNORATES).forEach(([govKey, governorate]) => {
        if (governorate.name.includes(query) || governorate.nameEn.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            id: `gov_${govKey}`,
            type: 'governorate',
            name: governorate.name,
            details: `محافظة ${governorate.name} - ${governorate.wilayats.length} ولاية`,
            coordinates: governorate.center,
            governorate: governorate.name,
            wilayat: ''
          })
        }
      })
    }
    
    // البحث في الولايات
    if (type === 'all' || type === 'wilayats') {
      Object.entries(OMAN_GOVERNORATES).forEach(([govKey, governorate]) => {
        governorate.wilayats.forEach(wilayat => {
          if (wilayat.includes(query)) {
            results.push({
              id: `wil_${govKey}_${wilayat}`,
              type: 'wilayat',
              name: wilayat,
              details: `ولاية ${wilayat} - محافظة ${governorate.name}`,
              coordinates: governorate.center,
              governorate: governorate.name,
              wilayat: wilayat
            })
          }
        })
      })
    }
    
    // البحث في المباني (محاكاة)
    if (type === 'all' || type === 'buildings') {
      for (let i = 0; i < 20; i++) {
        const buildingNo = Math.floor(Math.random() * 1000) + 1
        const plotNo = Math.floor(Math.random() * 500) + 1
        
        if (buildingNo.toString().includes(query) || plotNo.toString().includes(query)) {
          const governorate = Object.values(OMAN_GOVERNORATES)[Math.floor(Math.random() * Object.keys(OMAN_GOVERNORATES).length)]
          const wilayat = governorate.wilayats[Math.floor(Math.random() * governorate.wilayats.length)]
          
          results.push({
            id: `building_${buildingNo}`,
            type: 'building',
            name: `المبنى رقم ${buildingNo}`,
            details: `قطعة ${plotNo} - ${wilayat} - ${governorate.name}`,
            coordinates: {
              lat: governorate.center.lat + (Math.random() - 0.5) * 0.1,
              lng: governorate.center.lng + (Math.random() - 0.5) * 0.1
            },
            governorate: governorate.name,
            wilayat: wilayat
          })
        }
      }
    }
    
    // البحث في قطع الأراضي (محاكاة)
    if (type === 'all' || type === 'parcels') {
      for (let i = 0; i < 15; i++) {
        const parcelNo = Math.floor(Math.random() * 2000) + 1000
        
        if (parcelNo.toString().includes(query)) {
          const governorate = Object.values(OMAN_GOVERNORATES)[Math.floor(Math.random() * Object.keys(OMAN_GOVERNORATES).length)]
          const wilayat = governorate.wilayats[Math.floor(Math.random() * governorate.wilayats.length)]
          
          results.push({
            id: `parcel_${parcelNo}`,
            type: 'parcel',
            name: `القطعة رقم ${parcelNo}`,
            details: `${wilayat} - ${governorate.name} - مساحة ${Math.floor(Math.random() * 2000) + 500} م²`,
            coordinates: {
              lat: governorate.center.lat + (Math.random() - 0.5) * 0.1,
              lng: governorate.center.lng + (Math.random() - 0.5) * 0.1
            },
            governorate: governorate.name,
            wilayat: wilayat
          })
        }
      }
    }
    
    setSearchResults(results.slice(0, 50)) // تحديد النتائج إلى 50
    setIsSearching(false)
  }

  // البحث عند تغيير الاستعلام
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery, searchType)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, searchType])

  const handleResultClick = (result: SearchResult) => {
    setSelectedResult(result)
    onSearchResult(result)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setSelectedResult(null)
    onClearSearch()
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'building':
        return '🏠'
      case 'parcel':
        return '📋'
      case 'governorate':
        return '🗺️'
      case 'wilayat':
        return '📍'
      default:
        return '🔍'
    }
  }

  const getResultColor = (type: string) => {
    switch (type) {
      case 'building':
        return 'text-blue-600'
      case 'parcel':
        return 'text-green-600'
      case 'governorate':
        return 'text-purple-600'
      case 'wilayat':
        return 'text-orange-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-md">
      <h3 className="font-semibold text-gray-800 mb-4">البحث المتقدم في GIS</h3>
      
      {/* شريط البحث */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث عن مبنى، قطعة، محافظة، أو ولاية..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* نوع البحث */}
      <div className="mb-4">
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">جميع النتائج</option>
          <option value="buildings">المباني</option>
          <option value="parcels">قطع الأراضي</option>
          <option value="governorates">المحافظات</option>
          <option value="wilayats">الولايات</option>
        </select>
      </div>

      {/* حالة البحث */}
      {isSearching && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600 mt-2">جاري البحث...</p>
        </div>
      )}

      {/* النتائج */}
      {searchResults.length > 0 && (
        <div className="max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-gray-600">
              {searchResults.length} نتيجة
            </p>
            <button
              onClick={handleClearSearch}
              className="text-xs text-red-600 hover:text-red-800"
            >
              مسح البحث
            </button>
          </div>
          
          <div className="space-y-2">
            {searchResults.map((result) => (
              <div
                key={result.id}
                onClick={() => handleResultClick(result)}
                className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedResult?.id === result.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">{getResultIcon(result.type)}</span>
                  <div className="flex-1">
                    <h4 className={`font-medium ${getResultColor(result.type)}`}>
                      {result.name}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {result.details}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>📍 {result.governorate}</span>
                      {result.wilayat && <span>🏘️ {result.wilayat}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* رسالة عدم وجود نتائج */}
      {searchQuery && !isSearching && searchResults.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">لم يتم العثور على نتائج</p>
          <p className="text-sm text-gray-400 mt-1">جرب كلمات بحث مختلفة</p>
        </div>
      )}

      {/* تعليمات البحث */}
      {!searchQuery && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-2">أمثلة على البحث:</p>
          <div className="text-sm text-gray-400 space-y-1">
            <p>• رقم المبنى: "123"</p>
            <p>• رقم القطعة: "456"</p>
            <p>• اسم المحافظة: "مسقط"</p>
            <p>• اسم الولاية: "مطرح"</p>
          </div>
        </div>
      )}
    </div>
  )
}
