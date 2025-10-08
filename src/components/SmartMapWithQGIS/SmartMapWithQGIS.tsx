import { useState, useRef, useEffect } from 'react'
import { House } from '../../types'
import { generateOmanGISAddress, OmanGISAddress, OMAN_WILAYATS } from '../../utils/omanGIS'
import { 
  createOmanQGISProject,
  createOmanBuildingsQGISLayer,
  createOmanHousesQGISLayer,
  createLandParcelsQGISLayer,
  createGovernoratesQGISLayer,
  QGISProject,
  QGISFeature
} from '../../utils/qgisSystem'

interface SmartMapWithQGISProps {
  houses: House[]
  onHouseSelect: (house: House) => void
  selectedHouse: House | null
}

interface HouseInfo {
  id: string
  houseNo: number
  plotNo: number
  ownerName: string
  ownerAvatar: string
  civilNumber: string
  area: string
  x: number
  y: number
  width: number
  height: number
  omanGISAddress: OmanGISAddress
}

export default function SmartMapWithQGIS({ houses, onHouseSelect, selectedHouse }: SmartMapWithQGISProps) {
  const [zoom, setZoom] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hoveredHouse, setHoveredHouse] = useState<HouseInfo | null>(null)
  const [hoveredQGISFeature, setHoveredQGISFeature] = useState<any>(null)
  const [qgisProject, setQGISProject] = useState<QGISProject | null>(null)
  const [activeLayers, setActiveLayers] = useState<string[]>([
    'houses_layer', 
    'streets_layer', 
    'blocks_layer',
    'governorates_layer',
    'land_parcels_layer',
    'oman_buildings_layer',
    'oman_houses_layer'
  ])
  const [viewMode, setViewMode] = useState<'smart' | 'qgis' | 'combined'>('combined')
  const [selectedQGISFeature, setSelectedQGISFeature] = useState<any>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // إنشاء مشروع QGIS شامل
  useEffect(() => {
    const project = createOmanQGISProject()
    setQGISProject(project)
  }, [])

  // تحويل بيانات المنازل إلى معلومات مفصلة باستخدام نظام GIS العماني الرسمي
  const houseInfos: HouseInfo[] = houses.slice(0, 100).map((house, index) => {
    // ترتيب المنازل في شبكة مثل الصورة المرجعية
    const row = Math.floor(index / 8) // 8 منازل في كل صف
    const col = index % 8
    
    // إحداثيات الشبكة مع مسافات مناسبة
    const startX = 100
    const startY = 100
    const houseWidth = 60
    const houseHeight = 40
    const spacingX = 80
    const spacingY = 60
    
    const x = startX + col * spacingX
    const y = startY + row * spacingY
    
    // توليد عنوان GIS عماني حقيقي
    const omanGISAddress = generateOmanGISAddress()
    
    return {
      id: house.id,
      houseNo: house.houseNo,
      plotNo: house.plotNo,
      ownerName: house.ownerName,
      ownerAvatar: house.ownerAvatar,
      civilNumber: house.civilNumber,
      area: house.area,
      x,
      y,
      width: houseWidth,
      height: houseHeight,
      omanGISAddress
    }
  })

  // رسم الخريطة الذكية مع QGIS
  const drawMap = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const drawSmartMapWithQGIS = () => {
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

      // رسم خلفية الخريطة الذكية
      drawSmartMapBackground(ctx)

      // رسم طبقات QGIS حسب الوضع المحدد
      if (viewMode === 'qgis' || viewMode === 'combined') {
        drawQGISLayers(ctx)
      }

      // رسم المنازل الذكية حسب الوضع المحدد
      if (viewMode === 'smart' || viewMode === 'combined') {
        drawSmartHouses(ctx)
      }

      // رسم الشوارع والكتل
      if (activeLayers.includes('streets_layer')) {
        drawStreets(ctx)
      }
      if (activeLayers.includes('blocks_layer')) {
        drawBlocks(ctx)
      }

      // استعادة حالة الكانفاس
      ctx.restore()
    }

    drawSmartMapWithQGIS()
  }

  // رسم خلفية الخريطة الذكية
  const drawSmartMapBackground = (ctx: CanvasRenderingContext2D) => {
    // خلفية متدرجة
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#F0F9FF')
    gradient.addColorStop(1, '#E0F2FE')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // رسم شبكة خفيفة
    ctx.strokeStyle = '#E0E7FF'
    ctx.lineWidth = 1
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, canvas.height)
      ctx.stroke()
    }
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(canvas.width, i)
      ctx.stroke()
    }

    // رسم حدود سلطنة عُمان
    ctx.strokeStyle = '#1E40AF'
    ctx.lineWidth = 3
    ctx.setLineDash([10, 5])
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100)
    ctx.setLineDash([])

    // كتابة عنوان الخريطة
    ctx.fillStyle = '#1E40AF'
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('الخريطة الذكية + QGIS', canvas.width / 2, 30)
  }

  // رسم طبقات QGIS
  const drawQGISLayers = (ctx: CanvasRenderingContext2D) => {
    if (!qgisProject) return

    // حدود سلطنة عُمان للتحويل
    const omanBounds = { west: 52.0, east: 60.0, south: 16.0, north: 26.5 }

    qgisProject.layers.forEach(layer => {
      if (activeLayers.includes(layer.id)) {
        layer.features.forEach((feature: QGISFeature) => {
          const { lat, lng } = feature.geometry.coordinates
          const screenX = ((lng - omanBounds.west) / (omanBounds.east - omanBounds.west)) * (canvas.width - 200) + 100
          const screenY = ((omanBounds.north - lat) / (omanBounds.north - omanBounds.south)) * (canvas.height - 200) + 100

          // تحديد لون حسب نوع الطبقة
          let color = '#3B82F6'
          let size = 3

          switch (layer.id) {
            case 'governorates_layer':
              color = '#6B7280'
              size = 2
              // رسم حدود المحافظة
              ctx.strokeStyle = color
              ctx.lineWidth = 2
              ctx.setLineDash([5, 5])
              ctx.strokeRect(screenX - 30, screenY - 20, 60, 40)
              ctx.setLineDash([])
              break
            case 'land_parcels_layer':
              color = '#FEF3C7'
              size = 3
              // رسم قطعة الأرض
              ctx.fillStyle = color
              ctx.strokeStyle = '#D97706'
              ctx.lineWidth = 1
              ctx.fillRect(screenX - 3, screenY - 3, 6, 6)
              ctx.strokeRect(screenX - 3, screenY - 3, 6, 6)
              break
            case 'oman_buildings_layer':
              // تحديد لون المبنى حسب النوع
              switch (feature.properties.building_type) {
                case 'فيلا':
                  color = '#10B981'
                  break
                case 'شقة':
                  color = '#3B82F6'
                  break
                case 'بيت شعبي':
                  color = '#F59E0B'
                  break
                case 'عمارة':
                  color = '#8B5CF6'
                  break
                case 'مبنى تجاري':
                  color = '#EF4444'
                  break
                case 'مبنى حكومي':
                  color = '#06B6D4'
                  break
                case 'مبنى صناعي':
                  color = '#84CC16'
                  break
                case 'مبنى تعليمي':
                  color = '#EC4899'
                  break
                case 'مبنى صحي':
                  color = '#F97316'
                  break
                default:
                  color = '#6B7280'
              }
              size = 4
              break
            case 'oman_houses_layer':
              color = '#10B981'
              size = 4
              break
          }

          // رسم العنصر
          if (layer.id === 'oman_buildings_layer' || layer.id === 'oman_houses_layer') {
            // رسم ظل
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
            ctx.shadowBlur = 2
            ctx.shadowOffsetX = 1
            ctx.shadowOffsetY = 1
            
            ctx.fillStyle = color
            ctx.strokeStyle = '#1F2937'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.arc(screenX, screenY, size, 0, 2 * Math.PI)
            ctx.fill()
            ctx.stroke()
            
            // إزالة الظل
            ctx.shadowColor = 'transparent'
            ctx.shadowBlur = 0
            ctx.shadowOffsetX = 0
            ctx.shadowOffsetY = 0

            // تمييز العنصر المحدد
            if (selectedQGISFeature?.id === feature.id) {
              ctx.strokeStyle = '#DC2626'
              ctx.lineWidth = 3
              ctx.beginPath()
              ctx.arc(screenX, screenY, size + 3, 0, 2 * Math.PI)
              ctx.stroke()
            }

            // تمييز العنصر المحوم عليه
            if (hoveredQGISFeature?.id === feature.id) {
              ctx.strokeStyle = '#F59E0B'
              ctx.lineWidth = 2
              ctx.beginPath()
              ctx.arc(screenX, screenY, size + 2, 0, 2 * Math.PI)
              ctx.stroke()
            }
          }
        })
      }
    })
  }

  // رسم المنازل الذكية
  const drawSmartHouses = (ctx: CanvasRenderingContext2D) => {
    houseInfos.forEach(house => {
      // رسم المنزل
      const isSelected = selectedHouse?.id === house.id
      const isHovered = hoveredHouse?.id === house.id

      // لون المنزل حسب الحالة
      let houseColor = '#3B82F6'
      if (isSelected) houseColor = '#DC2626'
      else if (isHovered) houseColor = '#F59E0B'

      // رسم المنزل مع ظل
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2

      ctx.fillStyle = houseColor
      ctx.fillRect(house.x, house.y, house.width, house.height)

      // إزالة الظل
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      // رسم حدود المنزل
      ctx.strokeStyle = '#1F2937'
      ctx.lineWidth = 2
      ctx.strokeRect(house.x, house.y, house.width, house.height)

      // رسم رقم المنزل
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 12px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(house.houseNo.toString(), house.x + house.width / 2, house.y + house.height / 2)

      // رسم معلومات إضافية عند التحديد
      if (isSelected) {
        // رسم خلفية للمعلومات
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
        ctx.fillRect(house.x, house.y - 60, 200, 50)

        // رسم حدود
        ctx.strokeStyle = '#DC2626'
        ctx.lineWidth = 2
        ctx.strokeRect(house.x, house.y - 60, 200, 50)

        // كتابة المعلومات
        ctx.fillStyle = '#1F2937'
        ctx.font = 'bold 10px Arial'
        ctx.textAlign = 'left'
        ctx.fillText(`المالك: ${house.ownerName}`, house.x + 5, house.y - 40)
        ctx.fillText(`الرقم المدني: ${house.civilNumber}`, house.x + 5, house.y - 25)
        ctx.fillText(`المساحة: ${house.area}`, house.x + 5, house.y - 10)
      }
    })
  }

  // رسم الشوارع
  const drawStreets = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#9CA3AF'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'

    // شوارع أفقية
    for (let i = 0; i < 15; i++) {
      const y = 80 + i * 60
      ctx.beginPath()
      ctx.moveTo(50, y)
      ctx.lineTo(canvas.width - 50, y)
      ctx.stroke()
    }

    // شوارع عمودية
    for (let i = 0; i < 12; i++) {
      const x = 80 + i * 80
      ctx.beginPath()
      ctx.moveTo(x, 50)
      ctx.lineTo(x, canvas.height - 50)
      ctx.stroke()
    }
  }

  // رسم الكتل
  const drawBlocks = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#6B7280'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])

    // كتل أفقية
    for (let i = 0; i < 5; i++) {
      const y = 80 + i * 180
      ctx.beginPath()
      ctx.moveTo(50, y)
      ctx.lineTo(canvas.width - 50, y)
      ctx.stroke()
    }

    // كتل عمودية
    for (let i = 0; i < 4; i++) {
      const x = 80 + i * 240
      ctx.beginPath()
      ctx.moveTo(x, 50)
      ctx.lineTo(x, canvas.height - 50)
      ctx.stroke()
    }

    ctx.setLineDash([])
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
      // فحص ما إذا كان الماوس فوق منزل ذكي
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const mouseX = (e.clientX - rect.left - panX) / zoom
      const mouseY = (e.clientY - rect.top - panY) / zoom

      // البحث عن منزل تحت الماوس
      const house = houseInfos.find(h => 
        mouseX >= h.x && mouseX <= h.x + h.width &&
        mouseY >= h.y && mouseY <= h.y + h.height
      )
      setHoveredHouse(house || null)

      // البحث عن عنصر QGIS تحت الماوس
      const qgisFeature = findQGISFeatureUnderMouse(mouseX, mouseY)
      setHoveredQGISFeature(qgisFeature)
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) {
      if (hoveredHouse) {
        const house = houses.find(h => h.id === hoveredHouse.id)
        if (house) {
          onHouseSelect(house)
        }
      } else if (hoveredQGISFeature) {
        setSelectedQGISFeature(hoveredQGISFeature)
      }
    }
    setIsDragging(false)
  }

  // البحث عن عنصر QGIS تحت الماوس
  const findQGISFeatureUnderMouse = (mouseX: number, mouseY: number) => {
    if (!qgisProject) return null

    const omanBounds = { west: 52.0, east: 60.0, south: 16.0, north: 26.5 }

    for (const layer of qgisProject.layers) {
      if (!activeLayers.includes(layer.id)) continue

      for (const feature of layer.features) {
        const { lat, lng } = feature.geometry.coordinates
        const screenX = ((lng - omanBounds.west) / (omanBounds.east - omanBounds.west)) * (canvas.width - 200) + 100
        const screenY = ((omanBounds.north - lat) / (omanBounds.north - omanBounds.south)) * (canvas.height - 200) + 100
        
        const distance = Math.sqrt((mouseX - screenX) ** 2 + (mouseY - screenY) ** 2)
        if (distance < 10) {
          return { ...feature, layerId: layer.id }
        }
      }
    }

    return null
  }

  // معالجة عجلة الماوس
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(prev => Math.max(0.5, Math.min(3, prev * delta)))
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
  }, [houses, qgisProject, activeLayers, zoom, panX, panY, selectedHouse, selectedQGISFeature, hoveredHouse, hoveredQGISFeature, viewMode])

  return (
    <div className="relative w-full h-full bg-white">
      {/* معلومات المنزل المحدد */}
      {hoveredHouse && (
        <div 
          className="absolute bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-10 pointer-events-none max-w-xs"
          style={{
            left: 20,
            top: 20
          }}
        >
          <div className="text-sm">
            <div className="font-semibold text-blue-600">منزل ذكي</div>
            <div className="text-gray-600">رقم المنزل: {hoveredHouse.houseNo}</div>
            <div className="text-gray-600">المالك: {hoveredHouse.ownerName}</div>
            <div className="text-xs text-gray-500 mt-1">
              <div>المحافظة: {hoveredHouse.omanGISAddress.governorate}</div>
              <div>الولاية: {hoveredHouse.omanGISAddress.wilayat}</div>
              <div>المنطقة: {hoveredHouse.omanGISAddress.area}</div>
            </div>
          </div>
        </div>
      )}

      {/* معلومات عنصر QGIS المحدد */}
      {hoveredQGISFeature && (
        <div 
          className="absolute bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-10 pointer-events-none max-w-xs"
          style={{
            left: 20,
            top: 20
          }}
        >
          <div className="text-sm">
            <div className="font-semibold text-green-600">عنصر QGIS</div>
            {hoveredQGISFeature.properties.building_name && (
              <div className="text-gray-600">{hoveredQGISFeature.properties.building_name}</div>
            )}
            <div className="text-xs text-gray-500 mt-1">
              <div>النوع: {hoveredQGISFeature.properties.building_type || hoveredQGISFeature.properties.land_use}</div>
              {hoveredQGISFeature.properties.area && (
                <div>المساحة: {hoveredQGISFeature.properties.area} م²</div>
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
        <h3 className="font-semibold text-gray-800 mb-3">الخريطة الذكية + QGIS</h3>
        
        {/* وضع العرض */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">وضع العرض</label>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="combined">مدمج (الخريطة الذكية + QGIS)</option>
            <option value="smart">الخريطة الذكية فقط</option>
            <option value="qgis">QGIS فقط</option>
          </select>
        </div>
        
        {/* قائمة الطبقات */}
        <div className="space-y-2 mb-4">
          <div className="text-sm font-medium text-gray-700 mb-2">طبقات الخريطة الذكية:</div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={activeLayers.includes('houses_layer')}
              onChange={() => toggleLayer('houses_layer')}
              className="rounded"
            />
            <span className="text-sm text-gray-700">المنازل الذكية</span>
            <span className="text-xs text-gray-500">({houseInfos.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={activeLayers.includes('streets_layer')}
              onChange={() => toggleLayer('streets_layer')}
              className="rounded"
            />
            <span className="text-sm text-gray-700">الشوارع</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={activeLayers.includes('blocks_layer')}
              onChange={() => toggleLayer('blocks_layer')}
              className="rounded"
            />
            <span className="text-sm text-gray-700">الكتل</span>
          </div>

          <div className="text-sm font-medium text-gray-700 mb-2 mt-4">طبقات QGIS:</div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={activeLayers.includes('governorates_layer')}
              onChange={() => toggleLayer('governorates_layer')}
              className="rounded"
            />
            <span className="text-sm text-gray-700">المحافظات</span>
            <span className="text-xs text-gray-500">
              ({qgisProject?.layers.find(l => l.id === 'governorates_layer')?.features.length || 0})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={activeLayers.includes('land_parcels_layer')}
              onChange={() => toggleLayer('land_parcels_layer')}
              className="rounded"
            />
            <span className="text-sm text-gray-700">قطع الأراضي</span>
            <span className="text-xs text-gray-500">
              ({qgisProject?.layers.find(l => l.id === 'land_parcels_layer')?.features.length || 0})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={activeLayers.includes('oman_buildings_layer')}
              onChange={() => toggleLayer('oman_buildings_layer')}
              className="rounded"
            />
            <span className="text-sm text-gray-700">جميع المباني</span>
            <span className="text-xs text-gray-500">
              ({qgisProject?.layers.find(l => l.id === 'oman_buildings_layer')?.features.length || 0})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={activeLayers.includes('oman_houses_layer')}
              onChange={() => toggleLayer('oman_houses_layer')}
              className="rounded"
            />
            <span className="text-sm text-gray-700">المنازل السكنية</span>
            <span className="text-xs text-gray-500">
              ({qgisProject?.layers.find(l => l.id === 'oman_houses_layer')?.features.length || 0})
            </span>
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className="space-y-2">
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
          onClick={() => setZoom(prev => Math.max(0.5, prev * 0.8))}
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

      {/* معلومات النظام المدمج */}
      <div className="absolute bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-2 shadow-lg">
        <div className="text-xs text-gray-600">
          <div className="font-semibold">الخريطة الذكية + QGIS</div>
          <div>نظام مدمج متقدم</div>
          <div>سلطنة عُمان</div>
        </div>
      </div>

      {/* معلومات العنصر المحدد */}
      {selectedQGISFeature && (
        <div className="absolute top-4 left-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm z-10">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-gray-800">عنصر QGIS</h4>
            <button
              onClick={() => setSelectedQGISFeature(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="text-sm">
            <div className="font-medium text-green-600">{selectedQGISFeature.properties.building_name || 'عنصر بدون اسم'}</div>
            <div className="text-gray-600 mt-1">
              <div>النوع: {selectedQGISFeature.properties.building_type}</div>
              <div>المساحة: {selectedQGISFeature.properties.area} م²</div>
              <div>الطوابق: {selectedQGISFeature.properties.floors}</div>
              <div>سنة البناء: {selectedQGISFeature.properties.construction_year}</div>
              <div>حالة الإشغال: {selectedQGISFeature.properties.occupancy_status}</div>
              <div>حالة المبنى: {selectedQGISFeature.properties.building_condition}</div>
              <div>المرافق: {selectedQGISFeature.properties.utilities}</div>
              <div>اتصال المياه: {selectedQGISFeature.properties.water_connection}</div>
              <div>اتصال الكهرباء: {selectedQGISFeature.properties.electricity_connection}</div>
              <div>اتصال الصرف: {selectedQGISFeature.properties.sewage_connection}</div>
              <div>طريق الوصول: {selectedQGISFeature.properties.access_road}</div>
              {selectedQGISFeature.properties.owner_name && (
                <div>اسم المالك: {selectedQGISFeature.properties.owner_name}</div>
              )}
              {selectedQGISFeature.properties.phone && (
                <div>الهاتف: {selectedQGISFeature.properties.phone}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
