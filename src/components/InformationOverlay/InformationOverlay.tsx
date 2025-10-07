import React, { useState, useEffect, useRef } from 'react'
import { House } from '../../types'

interface InformationOverlayProps {
  houses: House[]
  selectedHouse: House | null
  onHouseSelect: (house: House) => void
  isVisible: boolean
  onToggleVisibility: () => void
}

interface HouseInfo {
  id: string
  houseNo: number
  plotNo: number
  area: string
  areaM2: number
  rooms: number
  ownerName: string
  civilNumber: string
  gisAddress: string
  x: number
  y: number
}

export default function InformationOverlay({ 
  houses, 
  selectedHouse, 
  onHouseSelect, 
  isVisible, 
  onToggleVisibility 
}: InformationOverlayProps) {
  const [houseInfos, setHouseInfos] = useState<HouseInfo[]>([])
  const [hoveredHouse, setHoveredHouse] = useState<HouseInfo | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // توليد معلومات مفصلة للمنازل
  useEffect(() => {
    const generateHouseInfos = (): HouseInfo[] => {
      return houses.slice(0, 50).map((house, index) => {
        // ترتيب المنازل في شبكة مثل شكل سلطنة عمان
        const row = Math.floor(index / 10) // 10 منازل في كل صف
        const col = index % 10
        
        // إحداثيات الشبكة مع مسافات مناسبة
        const startX = 50
        const startY = 50
        const houseWidth = 80
        const houseHeight = 60
        const spacingX = 100
        const spacingY = 80
        
        const x = startX + col * spacingX
        const y = startY + row * spacingY
        
        // توليد معلومات مالك البيت
        const ownerName = generateOwnerName(house.houseNo)
        const civilNumber = generateCivilNumber(house.houseNo)
        const gisAddress = generateGISAddress(house.houseNo, house.plotNo)
        
        return {
          id: house.id,
          houseNo: house.houseNo,
          plotNo: house.plotNo,
          area: house.area,
          areaM2: house.areaM2,
          rooms: house.rooms,
          ownerName,
          civilNumber,
          gisAddress,
          x,
          y
        }
      })
    }

    setHouseInfos(generateHouseInfos())
  }, [houses])

  // توليد اسم صاحب البيت
  const generateOwnerName = (houseNo: number): string => {
    const names = [
      'أحمد بن محمد العماني', 'فاطمة بنت علي السعيدي', 'محمد بن سالم الحارثي',
      'عائشة بنت عبدالله النعماني', 'خالد بن راشد الشامسي', 'مريم بنت سعد الكندي',
      'علي بن حسن البوسعيدي', 'زينب بنت عمر العبري', 'سالم بن أحمد الغافري',
      'رقية بنت يوسف المنجري', 'راشد بن عبدالرحمن الهنائي', 'أسماء بنت إبراهيم المزروعي',
      'عبدالله بن خميس الشقصي', 'نورا بنت سعيد المطيري', 'حمد بن راشد العبري',
      'مريم بنت أحمد الكندي', 'سالم بن محمد البوسعيدي', 'فاطمة بنت علي الهنائي'
    ]
    return names[houseNo % names.length]
  }

  // توليد رقم مدني
  const generateCivilNumber = (houseNo: number): string => {
    const prefix = '1'
    const middle = String(houseNo).padStart(4, '0')
    const suffix = String(Math.floor(Math.random() * 100)).padStart(2, '0')
    return `${prefix}${middle}${suffix}`
  }

  // توليد عنوان GIS
  const generateGISAddress = (houseNo: number, plotNo: number): string => {
    const sectors = ['السلطان قابوس', 'الغبرة', 'الخوير', 'الوطية', 'مطرح', 'الروضة']
    const sector = sectors[houseNo % sectors.length]
    return `${sector} - قطعة ${plotNo} - منزل ${houseNo}`
  }

  // رسم الطبقة
  useEffect(() => {
    if (!isVisible || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // تعيين حجم الكانفاس
    const container = canvas.parentElement
    if (container) {
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }

    const drawOverlay = () => {
      // مسح الكانفاس
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // رسم خلفية شفافة
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // رسم حدود سلطنة عمان
      drawOmanOutline(ctx, canvas.width, canvas.height)

      // رسم المنازل
      houseInfos.forEach(houseInfo => {
        drawHouseInfo(ctx, houseInfo)
      })

      // رسم المنزل المحدد
      if (selectedHouse) {
        const selectedInfo = houseInfos.find(h => h.id === selectedHouse.id)
        if (selectedInfo) {
          drawSelectedHouse(ctx, selectedInfo)
        }
      }

      // رسم المنزل المحوم عليه
      if (hoveredHouse) {
        drawHoveredHouse(ctx, hoveredHouse)
      }
    }

    drawOverlay()

    // إضافة مستمع لتغيير حجم النافذة
    const handleResize = () => {
      drawOverlay()
    }

    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [isVisible, houseInfos, selectedHouse, hoveredHouse])

  // رسم حدود سلطنة عمان
  const drawOmanOutline = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // رسم خلفية شفافة لسلطنة عمان
    ctx.fillStyle = 'rgba(46, 91, 186, 0.1)'
    ctx.beginPath()
    ctx.moveTo(width * 0.1, height * 0.3)
    ctx.lineTo(width * 0.9, height * 0.2)
    ctx.lineTo(width * 0.95, height * 0.4)
    ctx.lineTo(width * 0.9, height * 0.7)
    ctx.lineTo(width * 0.7, height * 0.8)
    ctx.lineTo(width * 0.3, height * 0.85)
    ctx.lineTo(width * 0.1, height * 0.6)
    ctx.closePath()
    ctx.fill()
    
    // رسم حدود سلطنة عمان
    ctx.strokeStyle = '#2E5BBA'
    ctx.lineWidth = 4
    ctx.setLineDash([10, 5])
    ctx.stroke()
    
    // رسم حدود داخلية
    ctx.strokeStyle = '#4A90E2'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 3])
    ctx.stroke()
    
    ctx.setLineDash([])
    
    // إضافة نص "سلطنة عمان"
    ctx.fillStyle = '#2E5BBA'
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('سلطنة عمان', width * 0.5, height * 0.5)
    
    // إضافة نص فرعي
    ctx.fillStyle = '#666'
    ctx.font = '16px Arial'
    ctx.fillText('نظام المعلومات الجغرافية', width * 0.5, height * 0.5 + 30)
  }

  // رسم معلومات المنزل
  const drawHouseInfo = (ctx: CanvasRenderingContext2D, houseInfo: HouseInfo) => {
    const { x, y, houseNo, plotNo, area } = houseInfo
    
    // رسم ظل للمنزل
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.fillRect(x + 3, y + 3, 80, 60)
    
    // رسم خلفية المنزل مع تدرج
    const gradient = ctx.createLinearGradient(x, y, x + 80, y + 60)
    gradient.addColorStop(0, '#E3F2FD')
    gradient.addColorStop(1, '#BBDEFB')
    ctx.fillStyle = gradient
    ctx.fillRect(x, y, 80, 60)
    
    // رسم حدود المنزل
    ctx.strokeStyle = '#1976D2'
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, 80, 60)
    
    // رسم خط فاصل
    ctx.strokeStyle = '#1976D2'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x, y + 25)
    ctx.lineTo(x + 80, y + 25)
    ctx.stroke()
    
    // رسم رقم المنزل
    ctx.fillStyle = '#1976D2'
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(houseNo.toString(), x + 40, y + 18)
    
    // رسم رقم القطعة
    ctx.fillStyle = '#666'
    ctx.font = '11px Arial'
    ctx.fillText(`قطعة ${plotNo}`, x + 40, y + 35)
    
    // رسم المنطقة
    ctx.fillStyle = '#666'
    ctx.font = '9px Arial'
    ctx.fillText(area, x + 40, y + 48)
    
    // رسم أيقونة صغيرة
    ctx.fillStyle = '#4CAF50'
    ctx.beginPath()
    ctx.arc(x + 70, y + 15, 4, 0, 2 * Math.PI)
    ctx.fill()
  }

  // رسم المنزل المحدد
  const drawSelectedHouse = (ctx: CanvasRenderingContext2D, houseInfo: HouseInfo) => {
    const { x, y } = houseInfo
    
    // رسم هالة متوهجة حول المنزل المحدد
    ctx.strokeStyle = '#FF5722'
    ctx.lineWidth = 6
    ctx.setLineDash([15, 10])
    ctx.strokeRect(x - 8, y - 8, 96, 76)
    ctx.setLineDash([])
    
    // رسم هالة داخلية
    ctx.strokeStyle = '#FF9800'
    ctx.lineWidth = 3
    ctx.setLineDash([8, 5])
    ctx.strokeRect(x - 5, y - 5, 90, 70)
    ctx.setLineDash([])
    
    // رسم ظل للمنزل المحدد
    ctx.fillStyle = 'rgba(255, 87, 34, 0.3)'
    ctx.fillRect(x + 4, y + 4, 80, 60)
    
    // رسم خلفية المنزل المحدد مع تدرج
    const gradient = ctx.createLinearGradient(x, y, x + 80, y + 60)
    gradient.addColorStop(0, '#FFF3E0')
    gradient.addColorStop(1, '#FFE0B2')
    ctx.fillStyle = gradient
    ctx.fillRect(x, y, 80, 60)
    
    // رسم حدود المنزل المحدد
    ctx.strokeStyle = '#FF5722'
    ctx.lineWidth = 3
    ctx.strokeRect(x, y, 80, 60)
    
    // رسم خط فاصل
    ctx.strokeStyle = '#FF5722'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x, y + 25)
    ctx.lineTo(x + 80, y + 25)
    ctx.stroke()
    
    // رسم رقم المنزل
    ctx.fillStyle = '#FF5722'
    ctx.font = 'bold 18px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(houseInfo.houseNo.toString(), x + 40, y + 18)
    
    // رسم رقم القطعة
    ctx.fillStyle = '#666'
    ctx.font = '12px Arial'
    ctx.fillText(`قطعة ${houseInfo.plotNo}`, x + 40, y + 35)
    
    // رسم المنطقة
    ctx.fillStyle = '#666'
    ctx.font = '10px Arial'
    ctx.fillText(houseInfo.area, x + 40, y + 48)
    
    // رسم أيقونة مميزة
    ctx.fillStyle = '#FF5722'
    ctx.beginPath()
    ctx.arc(x + 70, y + 15, 5, 0, 2 * Math.PI)
    ctx.fill()
    
    // رسم نجمة
    ctx.fillStyle = '#FFF'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('★', x + 70, y + 19)
  }

  // رسم المنزل المحوم عليه
  const drawHoveredHouse = (ctx: CanvasRenderingContext2D, houseInfo: HouseInfo) => {
    const { x, y } = houseInfo
    
    // رسم هالة خضراء حول المنزل المحوم عليه
    ctx.strokeStyle = '#4CAF50'
    ctx.lineWidth = 3
    ctx.setLineDash([8, 4])
    ctx.strokeRect(x - 4, y - 4, 88, 68)
    ctx.setLineDash([])
    
    // رسم هالة داخلية
    ctx.strokeStyle = '#8BC34A'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 2])
    ctx.strokeRect(x - 2, y - 2, 84, 64)
    ctx.setLineDash([])
    
    // رسم خلفية شفافة
    ctx.fillStyle = 'rgba(76, 175, 80, 0.1)'
    ctx.fillRect(x, y, 80, 60)
  }

  // معالجة النقر على المنزل
  const handleHouseClick = (houseInfo: HouseInfo) => {
    const house = houses.find(h => h.id === houseInfo.id)
    if (house) {
      onHouseSelect(house)
    }
  }

  // معالجة التمرير فوق المنزل
  const handleHouseHover = (houseInfo: HouseInfo | null) => {
    setHoveredHouse(houseInfo)
  }

  if (!isVisible) return null

  return (
    <div className="absolute inset-0 pointer-events-none z-[1000]">
      <canvas
        ref={canvasRef}
        className="w-full h-full pointer-events-auto"
        onMouseMove={(e) => {
          const rect = canvasRef.current?.getBoundingClientRect()
          if (!rect) return
          
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top
          
          // البحث عن المنزل المحوم عليه
          const hovered = houseInfos.find(house => 
            x >= house.x && x <= house.x + 80 &&
            y >= house.y && y <= house.y + 60
          )
          
          handleHouseHover(hovered || null)
        }}
        onClick={(e) => {
          const rect = canvasRef.current?.getBoundingClientRect()
          if (!rect) return
          
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top
          
          // البحث عن المنزل المنقور عليه
          const clicked = houseInfos.find(house => 
            x >= house.x && x <= house.x + 80 &&
            y >= house.y && y <= house.y + 60
          )
          
          if (clicked) {
            handleHouseClick(clicked)
          }
        }}
      />
      
      {/* لوحة المعلومات */}
      <div className="absolute top-4 right-4 bg-white p-4 rounded-xl shadow-2xl pointer-events-auto max-w-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <h3 className="text-lg font-bold text-gray-800">نظام المعلومات الجغرافية</h3>
          </div>
          <button
            onClick={onToggleVisibility}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
            <span className="font-semibold text-gray-700">إجمالي المنازل:</span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">{houseInfos.length}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
            <span className="font-semibold text-gray-700">المناطق:</span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">{new Set(houseInfos.map(h => h.area)).size}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
            <span className="font-semibold text-gray-700">الحالة:</span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              نشط
            </span>
          </div>
        </div>
        
        {selectedHouse && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <div className="flex items-center mb-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
              <h4 className="font-bold text-blue-900">المنزل المحدد</h4>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-white p-2 rounded-lg">
                <span className="text-gray-600 text-xs">رقم المنزل</span>
                <p className="font-bold text-blue-800">{selectedHouse.houseNo}</p>
              </div>
              <div className="bg-white p-2 rounded-lg">
                <span className="text-gray-600 text-xs">رقم القطعة</span>
                <p className="font-bold text-blue-800">{selectedHouse.plotNo}</p>
              </div>
              <div className="bg-white p-2 rounded-lg">
                <span className="text-gray-600 text-xs">المساحة</span>
                <p className="font-bold text-blue-800">{selectedHouse.areaM2} م²</p>
              </div>
              <div className="bg-white p-2 rounded-lg">
                <span className="text-gray-600 text-xs">الغرف</span>
                <p className="font-bold text-blue-800">{selectedHouse.rooms}</p>
              </div>
            </div>
          </div>
        )}
        
        {hoveredHouse && (
          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
            <div className="flex items-center mb-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <h4 className="font-bold text-green-900">المنزل المحوم عليه</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="bg-white p-2 rounded-lg">
                <span className="text-gray-600 text-xs">رقم المنزل</span>
                <p className="font-bold text-green-800">{hoveredHouse.houseNo}</p>
              </div>
              <div className="bg-white p-2 rounded-lg">
                <span className="text-gray-600 text-xs">المالك</span>
                <p className="font-bold text-green-800">{hoveredHouse.ownerName}</p>
              </div>
              <div className="bg-white p-2 rounded-lg">
                <span className="text-gray-600 text-xs">الرقم المدني</span>
                <p className="font-bold text-green-800">{hoveredHouse.civilNumber}</p>
              </div>
              <div className="bg-white p-2 rounded-lg">
                <span className="text-gray-600 text-xs">العنوان GIS</span>
                <p className="font-bold text-green-800 text-xs">{hoveredHouse.gisAddress}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* زر التحكم */}
      <div className="absolute bottom-4 left-4 pointer-events-auto">
        <button
          onClick={onToggleVisibility}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
          </svg>
          <span className="font-semibold">إخفاء المعلومات</span>
        </button>
      </div>
    </div>
  )
}
