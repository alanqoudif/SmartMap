import { generateAvatarFromName } from '../../utils/avatarGenerator'
import { generateOmaniCivilNumber } from '../../utils/civilNumberGenerator'

export interface IDCardData {
  name: string
  civilNumber: string
  birthDate: string
  gender: 'male' | 'female'
  avatar: string
  expiryDate: string
}

interface IDCardProps {
  data: IDCardData
  onGenerateNew?: () => void
  onSearchByID?: () => void
}

export function IDCard({ data, onGenerateNew, onSearchByID }: IDCardProps) {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-2xl shadow-2xl max-w-sm mx-auto">
      {/* بطاقة الهوية العمانية */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-amber-200">
        {/* رأس البطاقة */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-3 relative">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-bold">سلطنة عُمان</h1>
              <p className="text-xs opacity-90">SULTANATE OF OMAN</p>
            </div>
            {/* شعار عمان */}
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">ع</span>
              </div>
            </div>
          </div>
        </div>

        {/* محتوى البطاقة */}
        <div className="p-3">
          {/* الصورة الشخصية */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-amber-200">
              <img 
                src={data.avatar} 
                alt="صورة شخصية" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-800 mb-1">{data.name}</h2>
              <p className="text-xs text-gray-600">البطاقة الشخصية</p>
              <p className="text-xs text-gray-500">IDENTITY CARD</p>
            </div>
          </div>

          {/* معلومات البطاقة */}
          <div className="space-y-2">
            <div className="flex justify-between items-center py-1 border-b border-gray-200">
              <span className="text-xs font-medium text-gray-700">الرقم المدني:</span>
              <span className="text-xs font-mono text-gray-900">{data.civilNumber}</span>
            </div>
            
            <div className="flex justify-between items-center py-1 border-b border-gray-200">
              <span className="text-xs font-medium text-gray-700">تاريخ الميلاد:</span>
              <span className="text-xs text-gray-900">{data.birthDate}</span>
            </div>
            
            <div className="flex justify-between items-center py-1 border-b border-gray-200">
              <span className="text-xs font-medium text-gray-700">تاريخ الانتهاء:</span>
              <span className="text-xs text-gray-900">{data.expiryDate}</span>
            </div>
            
            <div className="flex justify-between items-center py-1">
              <span className="text-xs font-medium text-gray-700">الجنس:</span>
              <span className="text-xs text-gray-900">{data.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
            </div>
          </div>

          {/* خريطة عمان الخلفية */}
          <div className="mt-3 relative">
            <div className="absolute inset-0 opacity-5">
              <div className="w-full h-12 bg-gradient-to-r from-red-600 to-green-600 rounded"></div>
            </div>
            <div className="relative z-10 text-center">
              <p className="text-xs text-gray-500">سلطنة عُمان</p>
            </div>
          </div>
        </div>
      </div>

      {/* أزرار التحكم */}
      <div className="mt-4 flex gap-2">
        {onGenerateNew && (
          <button
            onClick={onGenerateNew}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg font-medium transition-colors text-sm"
          >
            إنشاء بطاقة جديدة
          </button>
        )}
        {onSearchByID && (
          <button
            onClick={onSearchByID}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg font-medium transition-colors text-sm"
          >
            البحث عن المنزل
          </button>
        )}
      </div>
    </div>
  )
}

// دالة مساعدة لإنشاء بيانات بطاقة هوية جديدة
export function createNewIDCard(name: string): IDCardData {
  const civilData = generateOmaniCivilNumber(name)
  const avatar = generateAvatarFromName(name)
  
  // حساب تاريخ الانتهاء (10 سنوات من الآن)
  const expiryDate = new Date()
  expiryDate.setFullYear(expiryDate.getFullYear() + 10)
  
  return {
    name,
    civilNumber: civilData.civilNumber,
    birthDate: civilData.birthDate,
    gender: civilData.gender,
    avatar,
    expiryDate: expiryDate.toISOString().split('T')[0]
  }
}
