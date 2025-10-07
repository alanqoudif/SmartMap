import { useState } from 'react'
import { validateCivilNumber } from '../../utils/civilNumberGenerator'
import { findHouseByCivilNumber as findHouseMapping } from '../../utils/idHouseMapping'
import { House } from '../../types'

interface IDSearchProps {
  onHouseFound?: (house: House, mapping: any) => void
  onError?: (message: string) => void
}

export function IDSearch({ onHouseFound, onError }: IDSearchProps) {
  const [civilNumber, setCivilNumber] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<{
    house: House | null
    mapping: any | null
  } | null>(null)

  const handleSearch = async () => {
    if (!civilNumber.trim()) {
      onError?.('يرجى إدخال الرقم المدني')
      return
    }

    // التحقق من صحة تنسيق الرقم المدني
    if (!validateCivilNumber(civilNumber)) {
      onError?.('تنسيق الرقم المدني غير صحيح. يجب أن يكون بالشكل: YYYYMMDD-XXXXX')
      return
    }

    setIsSearching(true)
    
    try {
      // البحث عن المنزل المرتبط بالرقم المدني
      const result = findHouseMapping(civilNumber)
      
      if (result.house && result.mapping) {
        setSearchResult(result)
        onHouseFound?.(result.house, result.mapping)
      } else {
        setSearchResult(null)
        onError?.('لم يتم العثور على منزل مرتبط بهذا الرقم المدني')
      }
    } catch (error) {
      console.error('خطأ في البحث:', error)
      onError?.('حدث خطأ أثناء البحث')
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const clearSearch = () => {
    setCivilNumber('')
    setSearchResult(null)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">البحث بالرقم المدني</h2>
        <p className="text-gray-600">أدخل الرقم المدني للعثور على المنزل المرتبط</p>
      </div>

      {/* حقل إدخال الرقم المدني */}
      <div className="mb-4">
        <label htmlFor="civilNumber" className="block text-sm font-medium text-gray-700 mb-2">
          الرقم المدني
        </label>
        <input
          id="civilNumber"
          type="text"
          value={civilNumber}
          onChange={(e) => setCivilNumber(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="YYYYMMDD-XXXXX"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-mono text-lg"
          dir="ltr"
        />
        <p className="text-xs text-gray-500 mt-1">
          مثال: 19900101-12345
        </p>
      </div>

      {/* أزرار التحكم */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleSearch}
          disabled={isSearching || !civilNumber.trim()}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors"
        >
          {isSearching ? 'جاري البحث...' : 'بحث'}
        </button>
        <button
          onClick={clearSearch}
          className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
        >
          مسح
        </button>
      </div>

      {/* نتائج البحث */}
      {searchResult && searchResult.house && searchResult.mapping && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-green-300">
              <img 
                src={searchResult.mapping.avatar} 
                alt="صورة شخصية" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">{searchResult.mapping.name}</h3>
              <p className="text-sm text-gray-600">الرقم المدني: {searchResult.mapping.civilNumber}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <h4 className="font-semibold text-gray-800 mb-2">تفاصيل المنزل:</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">رقم المنزل:</span>
                <span className="font-medium">{searchResult.house.houseNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">رقم القطعة:</span>
                <span className="font-medium">{searchResult.house.plotNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">المنطقة:</span>
                <span className="font-medium">{searchResult.house.area}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">المساحة:</span>
                <span className="font-medium">{searchResult.house.areaM2} م²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">عدد الغرف:</span>
                <span className="font-medium">{searchResult.house.rooms}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-3 text-xs text-gray-500">
            تم الربط في: {new Date(searchResult.mapping.assignedDate).toLocaleDateString('ar-SA')}
          </div>
        </div>
      )}

      {/* رسالة عدم وجود نتائج */}
      {searchResult && !searchResult.house && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="text-red-600 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-800 font-medium">لم يتم العثور على منزل مرتبط بهذا الرقم المدني</p>
          <p className="text-red-600 text-sm mt-1">تأكد من صحة الرقم المدني أو قم بإنشاء بطاقة هوية جديدة</p>
        </div>
      )}
    </div>
  )
}
