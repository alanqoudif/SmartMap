import { useState, useEffect } from 'react'
import { generateAvatarFromName } from '../../utils/avatarGenerator'
import { generateOmaniCivilNumber } from '../../utils/civilNumberGenerator'

interface IDCardPreviewProps {
  name: string
  isVisible: boolean
}

export default function IDCardPreview({ name, isVisible }: IDCardPreviewProps) {
  const [previewData, setPreviewData] = useState({
    avatar: '',
    civilNumber: '',
    birthDate: '',
    gender: 'male' as 'male' | 'female',
    expiryDate: ''
  })

  useEffect(() => {
    if (name.trim() && isVisible) {
      // توليد البيانات المباشرة
      const avatar = generateAvatarFromName(name)
      const civilData = generateOmaniCivilNumber(name)
      
      // حساب تاريخ الانتهاء (10 سنوات من الآن)
      const expiryDate = new Date()
      expiryDate.setFullYear(expiryDate.getFullYear() + 10)
      
      setPreviewData({
        avatar,
        civilNumber: civilData.civilNumber,
        birthDate: civilData.birthDate,
        gender: civilData.gender,
        expiryDate: expiryDate.toISOString().split('T')[0]
      })
    }
  }, [name, isVisible])

  if (!isVisible || !name.trim()) return null

  return (
    <div className="fixed top-1/2 right-4 transform -translate-y-1/2 z-40">
      <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-3 rounded-2xl shadow-2xl max-w-xs border-2 border-amber-200">
        {/* بطاقة الهوية العمانية */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-amber-200">
          {/* رأس البطاقة */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-2 relative">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xs font-bold">سلطنة عُمان</h1>
                <p className="text-xs opacity-90">SULTANATE OF OMAN</p>
              </div>
              {/* شعار عمان */}
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">ع</span>
                </div>
              </div>
            </div>
          </div>

          {/* محتوى البطاقة */}
          <div className="p-2">
            {/* الصورة الشخصية */}
            <div className="flex items-start gap-2 mb-2">
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-amber-200">
                <img 
                  src={previewData.avatar} 
                  alt="صورة شخصية" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-xs font-bold text-gray-800 mb-1">{name}</h2>
                <p className="text-xs text-gray-600">البطاقة الشخصية</p>
                <p className="text-xs text-gray-500">IDENTITY CARD</p>
              </div>
            </div>

            {/* معلومات البطاقة */}
            <div className="space-y-1">
              <div className="flex justify-between items-center py-1 border-b border-gray-200">
                <span className="text-xs font-medium text-gray-700">الرقم المدني:</span>
                <span className="text-xs font-mono text-gray-900">{previewData.civilNumber}</span>
              </div>
              
              <div className="flex justify-between items-center py-1 border-b border-gray-200">
                <span className="text-xs font-medium text-gray-700">تاريخ الميلاد:</span>
                <span className="text-xs text-gray-900">{previewData.birthDate}</span>
              </div>
              
              <div className="flex justify-between items-center py-1 border-b border-gray-200">
                <span className="text-xs font-medium text-gray-700">تاريخ الانتهاء:</span>
                <span className="text-xs text-gray-900">{previewData.expiryDate}</span>
              </div>
              
              <div className="flex justify-between items-center py-1">
                <span className="text-xs font-medium text-gray-700">الجنس:</span>
                <span className="text-xs text-gray-900">{previewData.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
              </div>
            </div>

            {/* خريطة عمان الخلفية */}
            <div className="mt-2 relative">
              <div className="absolute inset-0 opacity-5">
                <div className="w-full h-6 bg-gradient-to-r from-red-600 to-green-600 rounded"></div>
              </div>
              <div className="relative z-10 text-center">
                <p className="text-xs text-gray-500">سلطنة عُمان</p>
              </div>
            </div>
          </div>
        </div>

        {/* مؤشر المعاينة المباشرة */}
        <div className="mt-2 text-center">
          <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
            معاينة مباشرة
          </div>
        </div>
      </div>
    </div>
  )
}
