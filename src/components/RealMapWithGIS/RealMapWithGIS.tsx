import { useState, useRef, useEffect } from 'react'
import { 
  fetchAllRealBuildingsInOman, 
  fetchAllRealParcelsInOman,
  RealBuilding, 
  RealParcel,
  OMAN_BOUNDS,
  OMAN_GOVERNORATES_REAL
} from '../../utils/realOmanGIS'

interface RealMapWithGISProps {
  onBuildingSelect?: (building: RealBuilding) => void
  onParcelSelect?: (parcel: RealParcel) => void
}

export default function RealMapWithGIS({ onBuildingSelect, onParcelSelect }: RealMapWithGISProps) {
  const [realBuildings, setRealBuildings] = useState<RealBuilding[]>([])
  const [realParcels, setRealParcels] = useState<RealParcel[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [activeLayers, setActiveLayers] = useState<string[]>(['buildings', 'parcels'])
  const [selectedBuilding, setSelectedBuilding] = useState<RealBuilding | null>(null)
  const [selectedParcel, setSelectedParcel] = useState<RealParcel | null>(null)
  const [zoom, setZoom] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hoveredElement, setHoveredElement] = useState<any>(null)
  const [mapType, setMapType] = useState<'satellite' | 'street' | 'terrain'>('satellite')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mapImageRef = useRef<HTMLImageElement>(null)

  // جلب البيانات الحقيقية عند تحميل المكون
  useEffect(() => {
    loadRealData()
    loadMapImage()
  }, [mapType])

  const loadRealData = async () => {
    setIsLoading(true)
    setLoadingProgress(0)

    try {
      // جلب المباني الحقيقية
      setLoadingProgress(25)
      const buildings = await fetchAllRealBuildingsInOman()
      setRealBuildings(buildings)
      setLoadingProgress(50)

      // جلب قطع الأراضي الحقيقية
      setLoadingProgress(75)
      const parcels = await fetchAllRealParcelsInOman()
      setRealParcels(parcels)
      setLoadingProgress(100)

      console.log(`تم جلب ${buildings.length} مبنى حقيقي و ${parcels.length} قطعة أرض حقيقية`)
    } catch (error) {
      console.error('خطأ في جلب البيانات الحقيقية:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // تحميل صورة الخريطة الحقيقية
  const loadMapImage = () => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    // استخدام خريطة حقيقية لسلطنة عُمان
    const mapUrls = {
      satellite: `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${OMAN_BOUNDS.west},${OMAN_BOUNDS.south},${OMAN_BOUNDS.east},${OMAN_BOUNDS.north}/800x600?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`,
      street: `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${OMAN_BOUNDS.west},${OMAN_BOUNDS.south},${OMAN_BOUNDS.east},${OMAN_BOUNDS.north}/800x600?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`,
      terrain: `https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/static/${OMAN_BOUNDS.west},${OMAN_BOUNDS.south},${OMAN_BOUNDS.east},${OMAN_BOUNDS.north}/800x600?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`
    }
    
    img.onload = () => {
      mapImageRef.current = img
      drawMap()
    }
    
    img.onerror = () => {
      console.log('خطأ في تحميل الخريطة، سيتم استخدام خريطة بديلة')
      // استخدام خريطة بديلة من OpenStreetMap
      const fallbackUrl = `https://tile.openstreetmap.org/6/${Math.floor((OMAN_BOUNDS.west + 180) / 360 * Math.pow(2, 6))}/${Math.floor((1 - Math.log(Math.tan(OMAN_BOUNDS.north * Math.PI / 180) + 1 / Math.cos(OMAN_BOUNDS.north * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, 6))}.png`
      img.src = fallbackUrl
    }
    
    img.src = mapUrls[mapType]
  }

  // رسم الخريطة الحقيقية مع بيانات GIS
  const drawMap = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const drawRealMapWithGIS = () => {
      // تعيين حجم الكانفاس
      const container = canvas.parentElement
      if (container) {
        const rect = container.getBoundingClientRect()
        canvas.width = rect.width
        canvas.height = rect.height
      } else {
        canvas.width = window.innerWidth - 240
        canvas.height = window.innerHeight - 200
      }

      // مسح الكانفاس
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // حفظ حالة الكانفاس
      ctx.save()

      // تطبيق التحويلات
      ctx.translate(panX, panY)
      ctx.scale(zoom, zoom)

      // رسم الخريطة الحقيقية كخلفية
      if (mapImageRef.current) {
        ctx.drawImage(mapImageRef.current, 0, 0, 800, 600)
      } else {
        // رسم خلفية بديلة
        ctx.fillStyle = '#E5E7EB'
        ctx.fillRect(0, 0, 800, 600)
        
        // رسم شبكة
        ctx.strokeStyle = '#D1D5DB'
        ctx.lineWidth = 1
        for (let i = 0; i < 800; i += 50) {
          ctx.beginPath()
          ctx.moveTo(i, 0)
          ctx.lineTo(i, 600)
          ctx.stroke()
        }
        for (let i = 0; i < 600; i += 50) {
          ctx.beginPath()
          ctx.moveTo(0, i)
          ctx.lineTo(800, i)
          ctx.stroke()
        }
      }

      // رسم حدود سلطنة عُمان
      drawOmanBounds(ctx)

      // رسم قطع الأراضي الحقيقية فوق الخريطة
      if (activeLayers.includes('parcels')) {
        drawRealParcelsOnMap(ctx)
      }

      // رسم المباني الحقيقية فوق الخريطة
      if (activeLayers.includes('buildings')) {
        drawRealBuildingsOnMap(ctx)
      }

      // رسم المحافظات
      if (activeLayers.includes('governorates')) {
        drawGovernoratesOnMap(ctx)
      }

      // استعادة حالة الكانفاس
      ctx.restore()
    }

    drawRealMapWithGIS()
  }

  // رسم حدود سلطنة عُمان
  const drawOmanBounds = (ctx: CanvasRenderingContext2D) => {
    const bounds = OMAN_BOUNDS
    const screenX = ((bounds.west - bounds.west) / (bounds.east - bounds.west)) * 800 + 100
    const screenY = ((bounds.north - bounds.south) / (bounds.north - bounds.south)) * 600 + 100
    const screenWidth = ((bounds.east - bounds.west) / (bounds.east - bounds.west)) * 800
    const screenHeight = ((bounds.north - bounds.south) / (bounds.north - bounds.south)) * 600

    ctx.strokeStyle = '#DC2626'
    ctx.lineWidth = 3
    ctx.setLineDash([10, 5])
    ctx.strokeRect(screenX, screenY, screenWidth, screenHeight)
    ctx.setLineDash([])
    
    // كتابة "سلطنة عُمان"
    ctx.fillStyle = '#DC2626'
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('سلطنة عُمان', screenX + screenWidth / 2, screenY + screenHeight / 2)
  }

  // رسم المباني الحقيقية فوق الخريطة
  const drawRealBuildingsOnMap = (ctx: CanvasRenderingContext2D) => {
    realBuildings.forEach(building => {
      const { lat, lng } = building.coordinates
      const screenX = ((lng - OMAN_BOUNDS.west) / (OMAN_BOUNDS.east - OMAN_BOUNDS.west)) * 800 + 100
      const screenY = ((OMAN_BOUNDS.north - lat) / (OMAN_BOUNDS.north - OMAN_BOUNDS.south)) * 600 + 100

      // تحديد لون المبنى حسب النوع
      let color = '#3B82F6'
      switch (building.type) {
        case 'residential':
          color = '#10B981'
          break
        case 'commercial':
          color = '#F59E0B'
          break
        case 'industrial':
          color = '#EF4444'
          break
        case 'government':
          color = '#8B5CF6'
          break
        case 'educational':
          color = '#06B6D4'
          break
        case 'health':
          color = '#EC4899'
          break
        case 'religious':
          color = '#84CC16'
          break
        default:
          color = '#6B7280'
      }

      // رسم المبنى مع ظل
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
      ctx.shadowBlur = 3
      ctx.shadowOffsetX = 1
      ctx.shadowOffsetY = 1
      
      ctx.fillStyle = color
      ctx.strokeStyle = '#1F2937'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(screenX, screenY, 4, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
      
      // إزالة الظل
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      // تمييز المبنى المحدد
      if (selectedBuilding?.id === building.id) {
        ctx.strokeStyle = '#DC2626'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(screenX, screenY, 8, 0, 2 * Math.PI)
        ctx.stroke()
      }

      // تمييز المبنى المحوم عليه
      if (hoveredElement?.id === building.id) {
        ctx.strokeStyle = '#F59E0B'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(screenX, screenY, 6, 0, 2 * Math.PI)
        ctx.stroke()
      }
    })
  }

  // رسم قطع الأراضي الحقيقية فوق الخريطة
  const drawRealParcelsOnMap = (ctx: CanvasRenderingContext2D) => {
    realParcels.forEach(parcel => {
      const { lat, lng } = parcel.coordinates
      const screenX = ((lng - OMAN_BOUNDS.west) / (OMAN_BOUNDS.east - OMAN_BOUNDS.west)) * 800 + 100
      const screenY = ((OMAN_BOUNDS.north - lat) / (OMAN_BOUNDS.north - OMAN_BOUNDS.south)) * 600 + 100

      // تحديد لون قطعة الأرض حسب النوع
      let color = '#FEF3C7'
      switch (parcel.type) {
        case 'residential':
          color = '#DCFCE7'
          break
        case 'commercial':
          color = '#FEF3C7'
          break
        case 'industrial':
          color = '#FEE2E2'
          break
        case 'agricultural':
          color = '#D1FAE5'
          break
        case 'government':
          color = '#EDE9FE'
          break
        case 'recreational':
          color = '#ECFDF5'
          break
        case 'educational':
          color = '#E0F2FE'
          break
        case 'health':
          color = '#FCE7F3'
          break
        default:
          color = '#F9FAFB'
      }

      // رسم قطعة الأرض
      ctx.fillStyle = color
      ctx.strokeStyle = '#9CA3AF'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(screenX, screenY, 3, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()

      // تمييز قطعة الأرض المحددة
      if (selectedParcel?.id === parcel.id) {
        ctx.strokeStyle = '#DC2626'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(screenX, screenY, 6, 0, 2 * Math.PI)
        ctx.stroke()
      }
    })
  }

  // رسم المحافظات فوق الخريطة
  const drawGovernoratesOnMap = (ctx: CanvasRenderingContext2D) => {
    Object.entries(OMAN_GOVERNORATES_REAL).forEach(([govKey, governorate]) => {
      const bounds = governorate.bounds
      const screenX = ((bounds.west - OMAN_BOUNDS.west) / (OMAN_BOUNDS.east - OMAN_BOUNDS.west)) * 800 + 100
      const screenY = ((OMAN_BOUNDS.north - bounds.north) / (OMAN_BOUNDS.north - OMAN_BOUNDS.south)) * 600 + 100
      const screenWidth = ((bounds.east - bounds.west) / (OMAN_BOUNDS.east - OMAN_BOUNDS.west)) * 800
      const screenHeight = ((bounds.north - bounds.south) / (OMAN_BOUNDS.north - OMAN_BOUNDS.south)) * 600

      ctx.strokeStyle = '#6B7280'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.strokeRect(screenX, screenY, screenWidth, screenHeight)
      ctx.setLineDash([])

      // كتابة اسم المحافظة
      ctx.fillStyle = '#374151'
      ctx.font = 'bold 12px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(governorate.name, screenX + screenWidth / 2, screenY + screenHeight / 2)
    })
  }

  // معالجة النقر
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanX(e.clientX - dragStart.x)
      setPanY(e.clientY - dragStart.y)
    } else {
      // فحص ما إذا كان الماوس فوق عنصر
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const mouseX = (e.clientX - rect.left - panX) / zoom
      const mouseY = (e.clientY - rect.top - panY) / zoom

      // البحث عن عنصر تحت الماوس
      const element = findElementUnderMouse(mouseX, mouseY)
      setHoveredElement(element)
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging && hoveredElement) {
      if (hoveredElement.type === 'building') {
        setSelectedBuilding(hoveredElement)
        setSelectedParcel(null)
        onBuildingSelect?.(hoveredElement)
      } else if (hoveredElement.type === 'parcel') {
        setSelectedParcel(hoveredElement)
        setSelectedBuilding(null)
        onParcelSelect?.(hoveredElement)
      }
    }
    setIsDragging(false)
  }

  // البحث عن عنصر تحت الماوس
  const findElementUnderMouse = (mouseX: number, mouseY: number) => {
    // البحث في المباني
    for (const building of realBuildings) {
      const { lat, lng } = building.coordinates
      const screenX = ((lng - OMAN_BOUNDS.west) / (OMAN_BOUNDS.east - OMAN_BOUNDS.west)) * 800 + 100
      const screenY = ((OMAN_BOUNDS.north - lat) / (OMAN_BOUNDS.north - OMAN_BOUNDS.south)) * 600 + 100
      
      const distance = Math.sqrt((mouseX - screenX) ** 2 + (mouseY - screenY) ** 2)
      if (distance < 10) {
        return { ...building, type: 'building' }
      }
    }

    // البحث في قطع الأراضي
    for (const parcel of realParcels) {
      const { lat, lng } = parcel.coordinates
      const screenX = ((lng - OMAN_BOUNDS.west) / (OMAN_BOUNDS.east - OMAN_BOUNDS.west)) * 800 + 100
      const screenY = ((OMAN_BOUNDS.north - lat) / (OMAN_BOUNDS.north - OMAN_BOUNDS.south)) * 600 + 100
      
      const distance = Math.sqrt((mouseX - screenX) ** 2 + (mouseY - screenY) ** 2)
      if (distance < 10) {
        return { ...parcel, type: 'parcel' }
      }
    }

    return null
  }

  // معالجة عجلة الماوس
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(prev => Math.max(0.1, Math.min(3, prev * delta)))
  }

  // تبديل طبقة
  const toggleLayer = (layerId: string) => {
    setActiveLayers(prev => 
      prev.includes(layerId) 
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    )
  }

  // رسم الخريطة عند تغيير البيانات
  useEffect(() => {
    drawMap()
  }, [realBuildings, realParcels, activeLayers, zoom, panX, panY, selectedBuilding, selectedParcel])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">جاري تحميل الخريطة الحقيقية...</p>
          <p className="text-sm text-gray-500 mt-2">مع بيانات GIS الحقيقية</p>
          <div className="w-64 bg-gray-200 rounded-full h-2 mt-4 mx-auto">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{loadingProgress}%</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full bg-white">
      {/* معلومات العنصر المحدد */}
      {hoveredElement && (
        <div 
          className="absolute bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-10 pointer-events-none max-w-xs"
          style={{
            left: 20,
            top: 20
          }}
        >
          <div className="text-sm">
            <div className="font-semibold text-blue-600">
              {hoveredElement.type === 'building' ? 'مبنى حقيقي' : 'قطعة أرض حقيقية'}
            </div>
            {hoveredElement.name && (
              <div className="text-gray-600">{hoveredElement.name}</div>
            )}
            <div className="text-xs text-gray-500 mt-1">
              <div>النوع: {hoveredElement.type}</div>
              <div>المصدر: {hoveredElement.source}</div>
              {hoveredElement.area && (
                <div>المساحة: {Math.round(hoveredElement.area)} م²</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* الكانفاس */}
      <canvas
        ref={canvasRef}
        className="cursor-grab active:cursor-grabbing w-full h-full"
        style={{ display: 'block' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* لوحة التحكم */}
      <div className="absolute top-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-xs">
        <h3 className="font-semibold text-gray-800 mb-3">خريطة حقيقية + GIS</h3>
        
        {/* نوع الخريطة */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">نوع الخريطة</label>
          <select
            value={mapType}
            onChange={(e) => setMapType(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="satellite">صور الأقمار الصناعية</option>
            <option value="street">خريطة الشوارع</option>
            <option value="terrain">خريطة التضاريس</option>
          </select>
        </div>
        
        {/* قائمة الطبقات */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={activeLayers.includes('governorates')}
              onChange={() => toggleLayer('governorates')}
              className="rounded"
            />
            <span className="text-sm text-gray-700">المحافظات</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={activeLayers.includes('parcels')}
              onChange={() => toggleLayer('parcels')}
              className="rounded"
            />
            <span className="text-sm text-gray-700">قطع الأراضي الحقيقية</span>
            <span className="text-xs text-gray-500">({realParcels.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={activeLayers.includes('buildings')}
              onChange={() => toggleLayer('buildings')}
              className="rounded"
            />
            <span className="text-sm text-gray-700">المباني الحقيقية</span>
            <span className="text-xs text-gray-500">({realBuildings.length})</span>
          </div>
        </div>

        {/* إحصائيات */}
        <div className="text-xs text-gray-600 mb-4">
          <div>المباني الحقيقية: {realBuildings.length}</div>
          <div>قطع الأراضي الحقيقية: {realParcels.length}</div>
          <div>المصدر: OpenStreetMap</div>
          <div>آخر تحديث: {new Date().toLocaleDateString('ar-OM')}</div>
        </div>

        {/* أزرار التحكم */}
        <div className="space-y-2">
          <button
            onClick={loadRealData}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm"
          >
            تحديث البيانات
          </button>
          <button
            onClick={() => {
              setZoom(1)
              setPanX(0)
              setPanY(0)
            }}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded text-sm"
          >
            إعادة تعيين العرض
          </button>
        </div>
      </div>

      {/* أزرار التكبير */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <button
          onClick={() => setZoom(prev => Math.min(3, prev * 1.2))}
          className="bg-white border border-gray-300 rounded-lg p-2 shadow-lg hover:bg-gray-50"
        >
          +
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(0.1, prev * 0.8))}
          className="bg-white border border-gray-300 rounded-lg p-2 shadow-lg hover:bg-gray-50"
        >
          -
        </button>
      </div>

      {/* معلومات التكبير */}
      <div className="absolute bottom-4 left-4 bg-white border border-gray-300 rounded-lg p-2 shadow-lg">
        <div className="text-sm text-gray-600">
          التكبير: {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* معلومات البيانات الحقيقية */}
      <div className="absolute bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-2 shadow-lg">
        <div className="text-xs text-gray-600">
          <div className="font-semibold">خريطة حقيقية + GIS</div>
          <div>المصدر: OpenStreetMap</div>
          <div>سلطنة عُمان</div>
        </div>
      </div>

      {/* معلومات العنصر المحدد */}
      {selectedBuilding && (
        <div className="absolute top-4 left-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm z-10">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-gray-800">مبنى حقيقي</h4>
            <button
              onClick={() => setSelectedBuilding(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="text-sm">
            <div className="font-medium text-blue-600">{selectedBuilding.name || 'مبنى بدون اسم'}</div>
            <div className="text-gray-600 mt-1">
              <div>النوع: {selectedBuilding.type}</div>
              {selectedBuilding.address && <div>العنوان: {selectedBuilding.address}</div>}
              {selectedBuilding.area && <div>المساحة: {Math.round(selectedBuilding.area)} م²</div>}
              {selectedBuilding.floors && <div>الطوابق: {selectedBuilding.floors}</div>}
              {selectedBuilding.construction_year && <div>سنة البناء: {selectedBuilding.construction_year}</div>}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              <div>المصدر: {selectedBuilding.source}</div>
              <div>آخر تحديث: {new Date(selectedBuilding.last_updated).toLocaleDateString('ar-OM')}</div>
            </div>
          </div>
        </div>
      )}

      {selectedParcel && (
        <div className="absolute top-4 left-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm z-10">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-gray-800">قطعة أرض حقيقية</h4>
            <button
              onClick={() => setSelectedParcel(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="text-sm">
            <div className="font-medium text-green-600">{selectedParcel.name || 'قطعة أرض بدون اسم'}</div>
            <div className="text-gray-600 mt-1">
              <div>النوع: {selectedParcel.type}</div>
              <div>المساحة: {Math.round(selectedParcel.area)} م²</div>
              {selectedParcel.landuse && <div>استخدام الأرض: {selectedParcel.landuse}</div>}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              <div>المصدر: {selectedParcel.source}</div>
              <div>آخر تحديث: {new Date(selectedParcel.last_updated).toLocaleDateString('ar-OM')}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
