import { House } from '../../types'

interface HousePopupProps {
  house: House | null
  isOpen: boolean
  onClose: () => void
  onViewHouse: () => void
}

export default function HousePopup({ house, isOpen, onClose, onViewHouse }: HousePopupProps) {
  if (!isOpen || !house) return null

  // توليد معلومات صاحب البيت
  const generateOwnerInfo = (houseNo: number) => {
    const owners = [
      { name: 'أحمد بن محمد العماني', avatar: '👨‍💼', civilNumber: '19850315-12345' },
      { name: 'فاطمة بنت علي السعيدي', avatar: '👩‍💼', civilNumber: '19920422-23456' },
      { name: 'محمد بن سالم الحارثي', avatar: '👨‍🔧', civilNumber: '19871208-34567' },
      { name: 'عائشة بنت عبدالله النعماني', avatar: '👩‍🏫', civilNumber: '19950814-45678' },
      { name: 'خالد بن راشد الشامسي', avatar: '👨‍⚕️', civilNumber: '19820930-56789' },
      { name: 'مريم بنت سعد الكندي', avatar: '👩‍🎨', civilNumber: '19961125-67890' },
      { name: 'علي بن حسن البوسعيدي', avatar: '👨‍💻', civilNumber: '19840317-78901' },
      { name: 'زينب بنت عمر العبري', avatar: '👩‍🍳', civilNumber: '19930709-89012' },
      { name: 'سالم بن أحمد الغافري', avatar: '👨‍🚀', civilNumber: '19880612-90123' },
      { name: 'رقية بنت يوسف المنجري', avatar: '👩‍⚖️', civilNumber: '19940928-01234' }
    ]
    return owners[houseNo % owners.length]
  }

  const ownerInfo = generateOwnerInfo(house.houseNo)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* رأس البوب أب */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">معلومات المنزل</h2>
              <p className="text-blue-100">House Information</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* محتوى البوب أب */}
        <div className="p-6">
          {/* معلومات المنزل */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">تفاصيل المنزل</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">رقم المنزل</div>
                <div className="text-lg font-bold text-gray-800">{house.houseNo}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">رقم القطعة</div>
                <div className="text-lg font-bold text-gray-800">{house.plotNo}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">المنطقة</div>
                <div className="text-lg font-bold text-gray-800">{house.area}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">المساحة</div>
                <div className="text-lg font-bold text-gray-800">{house.areaM2} م²</div>
              </div>
            </div>
          </div>

          {/* معلومات صاحب المنزل */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">معلومات صاحب المنزل</h3>
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{ownerInfo.avatar}</div>
                <div className="flex-1">
                  <div className="text-xl font-bold text-gray-800">{ownerInfo.name}</div>
                  <div className="text-sm text-gray-600">الرقم المدني: {ownerInfo.civilNumber}</div>
                </div>
              </div>
            </div>
          </div>

          {/* معلومات إضافية */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">معلومات إضافية</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">عدد الغرف:</span>
                <span className="font-semibold">{house.rooms} غرف</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">تاريخ الإنشاء:</span>
                <span className="font-semibold">2015</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">نوع البناء:</span>
                <span className="font-semibold">فيلا</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">الحالة:</span>
                <span className="font-semibold text-green-600">مأهول</span>
              </div>
            </div>
          </div>

          {/* أزرار العمل */}
          <div className="flex gap-3">
            <button
              onClick={onViewHouse}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              تصفح المنزل
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
