import { useState } from 'react'
import { IDCard, IDCardData, createNewIDCard } from '../IDCard/IDCard'
import { IDSearch } from '../IDSearch/IDSearch'
import { assignHouseToID } from '../../utils/idHouseMapping'
import { House } from '../../types'
import IDCardPreview from '../IDCardPreview/IDCardPreview'

interface IDSystemProps {
  onHouseSelect?: (house: House) => void
}

export function IDSystem({ onHouseSelect }: IDSystemProps) {
  const [currentView, setCurrentView] = useState<'generator' | 'search'>('generator')
  const [currentIDCard, setCurrentIDCard] = useState<IDCardData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const handleGenerateID = async () => {
    if (!name.trim()) {
      setError('يرجى إدخال الاسم')
      return
    }

    setIsGenerating(true)
    setError('')
    setSuccess('')

    try {
      // إنشاء بطاقة هوية جديدة
      const newIDCard = createNewIDCard(name.trim())
      setCurrentIDCard(newIDCard)
      setSuccess('تم إنشاء البطاقة الشخصية بنجاح!')
    } catch (error) {
      console.error('خطأ في إنشاء البطاقة:', error)
      setError('حدث خطأ أثناء إنشاء البطاقة')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAssignHouse = async () => {
    if (!currentIDCard) {
      setError('لا توجد بطاقة هوية لربطها بمنزل')
      return
    }

    try {
      // ربط البطاقة بمنزل
      const mapping = assignHouseToID(
        currentIDCard.civilNumber,
        currentIDCard.name,
        currentIDCard.avatar
      )

      if (mapping) {
        setSuccess('تم ربط البطاقة بمنزل بنجاح! يمكنك الآن البحث بالرقم المدني.')
        setCurrentView('search')
      } else {
        setError('فشل في ربط البطاقة بمنزل')
      }
    } catch (error) {
      console.error('خطأ في ربط البطاقة:', error)
      setError('حدث خطأ أثناء ربط البطاقة بمنزل')
    }
  }

  const handleHouseFound = (house: House, mapping: any) => {
    setSuccess(`تم العثور على المنزل! ${house.area} - رقم ${house.houseNo}`)
    onHouseSelect?.(house)
  }

  const handleSearchError = (message: string) => {
    setError(message)
  }

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 py-4 overflow-y-auto">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* العنوان الرئيسي */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            نظام البطاقة الشخصية العمانية
          </h1>
          <p className="text-gray-600">
            إنشاء بطاقة هوية وربطها بالمنازل
          </p>
        </div>

        {/* أزرار التنقل */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-lg">
            <button
              onClick={() => {
                setCurrentView('generator')
                clearMessages()
              }}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                currentView === 'generator'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              إنشاء بطاقة هوية
            </button>
            <button
              onClick={() => {
                setCurrentView('search')
                clearMessages()
              }}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                currentView === 'search'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              البحث بالرقم المدني
            </button>
          </div>
        </div>

        {/* رسائل الحالة */}
        {error && (
          <div className="max-w-md mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="max-w-md mx-auto mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* المحتوى الرئيسي */}
        {currentView === 'generator' && (
          <div className="max-w-2xl mx-auto pb-8">
            {!currentIDCard ? (
              /* نموذج إنشاء البطاقة */
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                  إنشاء بطاقة هوية جديدة
                </h2>
                
                <div className="mb-6">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الكامل
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      setShowPreview(e.target.value.trim().length > 0)
                    }}
                    onFocus={() => setShowPreview(name.trim().length > 0)}
                    onBlur={() => setShowPreview(false)}
                    placeholder="أدخل الاسم الكامل"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                    dir="rtl"
                  />
                </div>

                <button
                  onClick={handleGenerateID}
                  disabled={isGenerating || !name.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  {isGenerating ? 'جاري إنشاء البطاقة...' : 'إنشاء البطاقة الشخصية'}
                </button>
              </div>
            ) : (
              /* عرض البطاقة المنشأة */
              <div className="space-y-4">
                <IDCard
                  data={currentIDCard}
                  onGenerateNew={() => {
                    setCurrentIDCard(null)
                    setName('')
                    clearMessages()
                  }}
                  onSearchByID={handleAssignHouse}
                />
                {/* مساحة إضافية لضمان رؤية الأزرار */}
                <div className="h-8"></div>
              </div>
            )}
          </div>
        )}

        {currentView === 'search' && (
          <div className="max-w-md mx-auto">
            <IDSearch
              onHouseFound={handleHouseFound}
              onError={handleSearchError}
            />
          </div>
        )}
      </div>

      {/* معاينة البطاقة المباشرة */}
      <IDCardPreview name={name} isVisible={showPreview} />
    </div>
  )
}
