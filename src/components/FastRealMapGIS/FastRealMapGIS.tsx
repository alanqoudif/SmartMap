import { useState, useRef, useEffect } from 'react'
import { 
  createOmanQGISProject,
  createOmanBuildingsQGISLayer,
  createOmanHousesQGISLayer,
  createLandParcelsQGISLayer,
  createGovernoratesQGISLayer,
  QGISProject,
  QGISFeature
} from '../../utils/qgisSystem'

interface FastRealMapGISProps {
  onBuildingSelect?: (building: any) => void
  onParcelSelect?: (parcel: any) => void
}

export default function FastRealMapGIS({ onBuildingSelect, onParcelSelect }: FastRealMapGISProps) {
  const [qgisProject, setQGISProject] = useState<QGISProject | null>(null)
  const [activeLayers, setActiveLayers] = useState<string[]>([
    'governorates_layer', 
    'land_parcels_layer', 
    'oman_buildings_layer',
    'oman_houses_layer'
  ])
  const [selectedBuilding, setSelectedBuilding] = useState<any>(null)
  const [selectedParcel, setSelectedParcel] = useState<any>(null)
  const [zoom, setZoom] = useState(0.1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hoveredFeature, setHoveredFeature] = useState<any>(null)
  const [mapType, setMapType] = useState<'satellite' | 'street' | 'terrain'>('satellite')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mapImageRef = useRef<HTMLImageElement>(null)

  // حدود سلطنة عُمان الحقيقية
  const omanBounds = { west: 52.0, east: 60.0, south: 16.0, north: 26.5 }

  // تحميل مشروع QGIS فوراً (بدون انتظار)
  useEffect(() => {
    const project = createOmanQGISProject()
    setQGISProject(project)
  }, [])

  // تحميل صورة الخريطة الحقيقية
  useEffect(() => {
    loadMapImage()
  }, [mapType])

  const loadMapImage = () => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    // استخدام خريطة حقيقية لسلطنة عُمان
    const mapUrls = {
      satellite: `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${omanBounds.west},${omanBounds.south},${omanBounds.east},${omanBounds.north}/800x600?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`,
      street: `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${omanBounds.west},${omanBounds.south},${omanBounds.east},${omanBounds.north}/800x600?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`,
      terrain: `https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/static/${omanBounds.west},${omanBounds.south},${omanBounds.east},${omanBounds.north}/800x600?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`
    }
    
    img.onload = () => {
      mapImageRef.current = img
      drawMap()
    }
    
    img.onerror = () => {
      console.log('خطأ في تحميل الخريطة، سيتم استخدام خريطة بديلة')
      // استخدام خريطة بديلة من OpenStreetMap
      const fallbackUrl = `https://tile.openstreetmap.org/6/${Math.floor((omanBounds.west + 180) / 360 * Math.pow(2, 6))}/${Math.floor((1 - Math.log(Math.tan(omanBounds.north * Math.PI / 180) + 1 / Math.cos(omanBounds.north * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, 6))}.png`
      img.src = fallbackUrl
    }
    
    img.src = mapUrls[mapType]
  }

  // رسم الخريطة السريعة
  const drawMap = () => {
    if (!canvasRef.current || !qgisProject) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const drawFastMap = () => {
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

      // رسم خلفية بسيطة أولاً
      ctx.fillStyle = '#F0F9FF'
      ctx.fillRect(0, 0, 800, 600)
      
      // رسم شبكة خفيفة
      ctx.strokeStyle = '#E0E7FF'
      ctx.lineWidth = 1
      for (let i = 0; i < 800; i += 40) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, 600)
        ctx.stroke()
      }
      for (let i = 0; i < 600; i += 40) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(800, i)
        ctx.stroke()
      }

      // رسم حدود سلطنة عُمان
      drawOmanBounds(ctx)

      // رسم طبقات QGIS فوق الخريطة
      qgisProject.layers.forEach(layer => {
        if (activeLayers.includes(layer.id)) {
          drawLayerOnMap(ctx, layer)
        }
      })

      // استعادة حالة الكانفاس
      ctx.restore()
    }

    drawFastMap()
  }

  // رسم حدود سلطنة عُمان
  const drawOmanBounds = (ctx: CanvasRenderingContext2D) => {
    const screenX = ((omanBounds.west - omanBounds.west) / (omanBounds.east - omanBounds.west)) * 800 + 100
    const screenY = ((omanBounds.north - omanBounds.south) / (omanBounds.north - omanBounds.south)) * 600 + 100
    const screenWidth = ((omanBounds.east - omanBounds.west) / (omanBounds.east - omanBounds.west)) * 800
    const screenHeight = ((omanBounds.north - omanBounds.south) / (omanBounds.north - omanBounds.south)) * 600

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

  // رسم طبقة على الخريطة
  const drawLayerOnMap = (ctx: CanvasRenderingContext2D, layer: any) => {
    console.log(`رسم طبقة: ${layer.id} مع ${layer.features.length} عنصر`)
    
    layer.features.forEach((feature: QGISFeature, index: number) => {
      const { lat, lng } = feature.geometry.coordinates
      const screenX = ((lng - omanBounds.west) / (omanBounds.east - omanBounds.west)) * 800 + 100
      const screenY = ((omanBounds.north - lat) / (omanBounds.north - omanBounds.south)) * 600 + 100

      // تحديد لون حسب نوع الطبقة
      let color = '#3B82F6'
      let size = 3

      switch (layer.id) {
        case 'governorates_layer':
          color = '#6B7280'
          size = 2
          // رسم حدود المحافظة
          if (feature.geometry.type === 'Polygon') {
            ctx.strokeStyle = color
            ctx.lineWidth = 2
            ctx.setLineDash([5, 5])
            ctx.strokeRect(screenX - 20, screenY - 15, 40, 30)
            ctx.setLineDash([])
          }
          break
        case 'land_parcels_layer':
          color = '#FEF3C7'
          size = 3
          // رسم قطعة الأرض
          ctx.fillStyle = color
          ctx.strokeStyle = '#D97706'
          ctx.lineWidth = 1
          ctx.fillRect(screenX - 2, screenY - 2, 4, 4)
          ctx.strokeRect(screenX - 2, screenY - 2, 4, 4)
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
          size = 5
          break
        case 'oman_houses_layer':
          color = '#10B981'
          size = 5
          break
      }

      // رسم العنصر (للمباني فقط)
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
        if (selectedBuilding?.id === feature.id || selectedParcel?.id === feature.id) {
          ctx.strokeStyle = '#DC2626'
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.arc(screenX, screenY, size + 3, 0, 2 * Math.PI)
          ctx.stroke()
        }

        // تمييز العنصر المحوم عليه
        if (hoveredFeature?.id === feature.id) {
          ctx.strokeStyle = '#F59E0B'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(screenX, screenY, size + 2, 0, 2 * Math.PI)
          ctx.stroke()
        }
      }
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
      const element = findFeatureUnderMouse(mouseX, mouseY)
      setHoveredFeature(element)
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging && hoveredFeature) {
      if (hoveredFeature.layerId === 'oman_buildings_layer' || hoveredFeature.layerId === 'oman_houses_layer') {
        setSelectedBuilding(hoveredFeature)
        setSelectedParcel(null)
        onBuildingSelect?.(hoveredFeature)
      } else if (hoveredFeature.layerId === 'land_parcels_layer') {
        setSelectedParcel(hoveredFeature)
        setSelectedBuilding(null)
        onParcelSelect?.(hoveredFeature)
      }
    }
    setIsDragging(false)
  }

  // البحث عن عنصر تحت الماوس
  const findFeatureUnderMouse = (mouseX: number, mouseY: number) => {
    if (!qgisProject) return null

    for (const layer of qgisProject.layers) {
      if (!activeLayers.includes(layer.id)) continue

      for (const feature of layer.features) {
        const { lat, lng } = feature.geometry.coordinates
        const screenX = ((lng - omanBounds.west) / (omanBounds.east - omanBounds.west)) * 800 + 100
        const screenY = ((omanBounds.north - lat) / (omanBounds.north - omanBounds.south)) * 600 + 100
        
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
    setZoom(prev => Math.max(0.05, Math.min(2, prev * delta)))
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
  }, [qgisProject, activeLayers, zoom, panX, panY, selectedBuilding, selectedParcel, hoveredFeature])

  if (!qgisProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">جاري تحضير البيانات...</p>
          <p className="text-sm text-gray-500 mt-2">نفس بيانات QGIS مع خريطة حقيقية</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full bg-white">
      {/* معلومات العنصر المحدد */}
      {hoveredFeature && (
        <div 
          className="absolute bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-10 pointer-events-none max-w-xs"
          style={{
            left: 20,
            top: 20
          }}
        >
          <div className="text-sm">
            <div className="font-semibold text-blue-600">
              {hoveredFeature.layerId === 'oman_buildings_layer' || hoveredFeature.layerId === 'oman_houses_layer' ? 'مبنى' : 'قطعة أرض'}
            </div>
            {hoveredFeature.properties.building_name && (
              <div className="text-gray-600">{hoveredFeature.properties.building_name}</div>
            )}
            <div className="text-xs text-gray-500 mt-1">
              <div>النوع: {hoveredFeature.properties.building_type || hoveredFeature.properties.land_use}</div>
              {hoveredFeature.properties.area && (
                <div>المساحة: {hoveredFeature.properties.area} م²</div>
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
        <h3 className="font-semibold text-gray-800 mb-3">خريطة سريعة + QGIS</h3>
        
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

        {/* إحصائيات سريعة */}
        <div className="text-xs text-gray-600 mb-4 p-2 bg-gray-50 rounded">
          <div className="font-semibold mb-1">إحصائيات البيانات:</div>
          <div>المحافظات: {qgisProject?.layers.find(l => l.id === 'governorates_layer')?.features.length || 0}</div>
          <div>قطع الأراضي: {qgisProject?.layers.find(l => l.id === 'land_parcels_layer')?.features.length || 0}</div>
          <div>جميع المباني: {qgisProject?.layers.find(l => l.id === 'oman_buildings_layer')?.features.length || 0}</div>
          <div>المنازل السكنية: {qgisProject?.layers.find(l => l.id === 'oman_houses_layer')?.features.length || 0}</div>
        </div>

        {/* أزرار التحكم */}
        <div className="space-y-2">
          <button
            onClick={() => {
              setZoom(0.1)
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
          onClick={() => setZoom(prev => Math.min(2, prev * 1.2))}
          className="bg-white border border-gray-300 rounded-lg p-2 shadow-lg hover:bg-gray-50"
        >
          +
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(0.05, prev * 0.8))}
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

      {/* معلومات البيانات */}
      <div className="absolute bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-2 shadow-lg">
        <div className="text-xs text-gray-600">
          <div className="font-semibold">خريطة سريعة + QGIS</div>
          <div>نفس بيانات QGIS</div>
          <div>خريطة حقيقية</div>
        </div>
      </div>

      {/* معلومات العنصر المحدد */}
      {selectedBuilding && (
        <div className="absolute top-4 left-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm z-10">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-gray-800">مبنى</h4>
            <button
              onClick={() => setSelectedBuilding(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="text-sm">
            <div className="font-medium text-blue-600">{selectedBuilding.properties.building_name || 'مبنى بدون اسم'}</div>
            <div className="text-gray-600 mt-1">
              <div>النوع: {selectedBuilding.properties.building_type}</div>
              <div>المساحة: {selectedBuilding.properties.area} م²</div>
              <div>الطوابق: {selectedBuilding.properties.floors}</div>
              <div>سنة البناء: {selectedBuilding.properties.construction_year}</div>
              <div>حالة الإشغال: {selectedBuilding.properties.occupancy_status}</div>
              <div>حالة المبنى: {selectedBuilding.properties.building_condition}</div>
              <div>المرافق: {selectedBuilding.properties.utilities}</div>
              <div>اتصال المياه: {selectedBuilding.properties.water_connection}</div>
              <div>اتصال الكهرباء: {selectedBuilding.properties.electricity_connection}</div>
              <div>اتصال الصرف: {selectedBuilding.properties.sewage_connection}</div>
              <div>طريق الوصول: {selectedBuilding.properties.access_road}</div>
              {selectedBuilding.properties.owner_name && (
                <div>اسم المالك: {selectedBuilding.properties.owner_name}</div>
              )}
              {selectedBuilding.properties.phone && (
                <div>الهاتف: {selectedBuilding.properties.phone}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedParcel && (
        <div className="absolute top-4 left-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm z-10">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-gray-800">قطعة أرض</h4>
            <button
              onClick={() => setSelectedParcel(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="text-sm">
            <div className="font-medium text-green-600">قطعة أرض رقم {selectedParcel.properties.parcel_no}</div>
            <div className="text-gray-600 mt-1">
              <div>استخدام الأرض: {selectedParcel.properties.land_use}</div>
              <div>نوع الملكية: {selectedParcel.properties.ownership_type}</div>
              <div>المساحة: {selectedParcel.properties.area} م²</div>
              <div>تاريخ التسجيل: {selectedParcel.properties.registration_date}</div>
              {selectedParcel.properties.owner_name && (
                <div>اسم المالك: {selectedParcel.properties.owner_name}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
