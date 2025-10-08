import { useState } from 'react'
import { getOmanGISStats } from '../../utils/omanGIS'

interface City {
  id: string
  name: string
  nameEn: string
  description: string
  icon: string
  color: string
  isAvailable: boolean
}

interface CitySelectorProps {
  onCitySelect: (cityId: string) => void
  selectedCity: string
  onGISSearch?: () => void
}

const cities: City[] = [
  {
    id: 'muscat-sultan-qaboos',
    name: 'مدينة سلطان قابوس',
    nameEn: 'Madinat As Sultan Qaboos',
    description: 'المنطقة السكنية الرئيسية في مسقط',
    icon: '🏛️',
    color: 'from-blue-500 to-blue-600',
    isAvailable: true
  },
  {
    id: 'qurum',
    name: 'القرم',
    nameEn: 'Al Qurum',
    description: 'منطقة سكنية راقية في مسقط',
    icon: '🏖️',
    color: 'from-green-500 to-green-600',
    isAvailable: false
  },
  {
    id: 'ruwi',
    name: 'الروي',
    nameEn: 'Ruwi',
    description: 'المنطقة التجارية في مسقط',
    icon: '🏢',
    color: 'from-purple-500 to-purple-600',
    isAvailable: false
  },
  {
    id: 'muttrah',
    name: 'مطرح',
    nameEn: 'Muttrah',
    description: 'المنطقة التاريخية والسوق القديم',
    icon: '🏺',
    color: 'from-orange-500 to-orange-600',
    isAvailable: false
  },
  {
    id: 'al-khuwair',
    name: 'الخوير',
    nameEn: 'Al Khuwair',
    description: 'منطقة سكنية وتجارية',
    icon: '🏘️',
    color: 'from-teal-500 to-teal-600',
    isAvailable: false
  },
  {
    id: 'wadi-adi',
    name: 'وادي عدي',
    nameEn: 'Wadi Adi',
    description: 'منطقة سكنية حديثة',
    icon: '🏔️',
    color: 'from-indigo-500 to-indigo-600',
    isAvailable: false
  }
]

export default function CitySelector({ onCitySelect, selectedCity, onGISSearch }: CitySelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const omanGISStats = getOmanGISStats()

  return (
    <div className="w-60 h-full bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">عُنْوَنِي</h1>
        <p className="text-sm text-gray-600">خريطة العناوين التفاعلية</p>
      </div>

      {/* City Selection */}
      <div className="flex-1 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">اختر المدينة</h3>
        
        {/* المدينة المختارة */}
        <div className="mb-4">
          {cities.find(city => city.id === selectedCity) && (
            <div className={`bg-gradient-to-r ${cities.find(city => city.id === selectedCity)?.color} text-white rounded-lg p-3`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{cities.find(city => city.id === selectedCity)?.icon}</span>
                <div>
                  <div className="font-semibold">{cities.find(city => city.id === selectedCity)?.name}</div>
                  <div className="text-sm opacity-90">{cities.find(city => city.id === selectedCity)?.nameEn}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* قائمة المدن */}
        <div className="space-y-2">
          {cities.map((city) => (
            <button
              key={city.id}
              onClick={() => {
                if (city.isAvailable) {
                  onCitySelect(city.id)
                  setIsExpanded(false)
                }
              }}
              disabled={!city.isAvailable}
              className={`w-full p-3 rounded-lg border transition-all duration-200 ${
                city.isAvailable
                  ? selectedCity === city.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{city.icon}</span>
                <div className="flex-1 text-right">
                  <div className="font-medium text-gray-800">{city.name}</div>
                  <div className="text-xs text-gray-600">{city.description}</div>
                  {!city.isAvailable && (
                    <div className="text-xs text-orange-600 mt-1">قريباً</div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* زر التوسع */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-4 p-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          {isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
        </button>

        {isExpanded && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">معلومات المدينة</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div>• مدينة سلطان قابوس متاحة الآن</div>
              <div>• المدن الأخرى قيد التطوير</div>
              <div>• يمكنك تصفح المنازل والأرقام</div>
              <div>• ربط البطاقات الشخصية بالمنازل</div>
            </div>
            
            {/* إحصائيات GIS العماني */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <h5 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <span className="text-red-600">🇴🇲</span>
                نظام GIS العماني الرسمي
              </h5>
              <div className="text-xs text-gray-600 space-y-1">
                <div>الولايات: {omanGISStats.totalWilayats}</div>
                <div>القطاعات: {omanGISStats.totalSectors}</div>
                <div>الكتل: {omanGISStats.totalBlocks}</div>
                <div>المنازل: {omanGISStats.estimatedHouses}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Options */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <button
          onClick={() => onCitySelect('virtual-view')}
          className={`w-full py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 ${
            selectedCity === 'virtual-view'
              ? 'bg-purple-500 hover:bg-purple-600 text-white'
              : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
          }`}
        >
          <span>🗺️</span>
          <span>عرض افتراضي</span>
        </button>
        <button
          onClick={() => onCitySelect('real-map')}
          className={`w-full py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 ${
            selectedCity === 'real-map'
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
          }`}
        >
          <span>🌍</span>
          <span>خريطة حقيقية</span>
        </button>
        {onGISSearch && (
          <button
            onClick={onGISSearch}
            className="w-full py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
          >
            <span>🇴🇲</span>
            <span>بحث GIS العماني</span>
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="p-4 border-t border-gray-200">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">تعليمات الاستخدام:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• اختر مدينة من القائمة</li>
          <li>• اضغط على المنازل لرؤية المعلومات</li>
          <li>• استخدم العرض الافتراضي للوضوح</li>
          <li>• اربط البطاقات بالمنازل</li>
        </ul>
      </div>
    </div>
  )
}
