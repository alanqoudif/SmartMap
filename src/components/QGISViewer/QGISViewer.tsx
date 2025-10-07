import { useState, useRef, useEffect } from 'react'
import { House } from '../../types'
import AdvancedGISSearch from '../AdvancedGISSearch/AdvancedGISSearch'
import { 
  createHousesQGISLayer, 
  createStreetsQGISLayer, 
  createBlocksQGISLayer, 
  createQGISProject,
  createOmanQGISProject,
  createOmanHousesQGISLayer,
  createOmanBuildingsQGISLayer,
  createLandParcelsQGISLayer,
  createGovernoratesQGISLayer,
  exportQGISProject,
  exportQGISProjectFile,
  exportAllLayersToGeoJSON,
  getQGISStats,
  QGISProject,
  QGISLayer
} from '../../utils/qgisSystem'

interface QGISViewerProps {
  houses: House[]
  onHouseSelect: (house: House) => void
  selectedHouse: House | null
  onToggleLayerManager?: () => void
}

export default function QGISViewer({ houses, onHouseSelect, selectedHouse, onToggleLayerManager }: QGISViewerProps) {
  const [qgisProject, setQGISProject] = useState<QGISProject | null>(null)
  const [activeLayers, setActiveLayers] = useState<string[]>([
    'governorates_layer', 
    'land_parcels_layer', 
    'oman_buildings_layer',
    'oman_houses_layer', 
    'streets_layer', 
    'blocks_layer'
  ])
  const [selectedLayer, setSelectedLayer] = useState<string>('oman_houses_layer')
  const [showOmanWide, setShowOmanWide] = useState(true) // عرض شامل للسلطنة
  const [zoom, setZoom] = useState(0.1) // تكبير أقل لعرض السلطنة كاملة
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hoveredFeature, setHoveredFeature] = useState<any>(null)
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [searchResult, setSearchResult] = useState<any>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // إنشاء مشروع QGIS شامل للسلطنة
  useEffect(() => {
    if (showOmanWide) {
      // مشروع شامل للسلطنة
      const project = createOmanQGISProject()
      setQGISProject(project)
    } else {
      // مشروع محلي لمدينة سلطان قابوس
      const housesLayer = createHousesQGISLayer(houses)
      const streetsLayer = createStreetsQGISLayer()
      const blocksLayer = createBlocksQGISLayer()
      
      const project = createQGISProject([blocksLayer, streetsLayer, housesLayer])
      setQGISProject(project)
    }
  }, [houses, showOmanWide])

  // رسم الخريطة
  useEffect(() => {
    if (!qgisProject) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const drawMap = () => {
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

      // رسم الطبقات حسب الترتيب
      qgisProject.layers
        .filter(layer => activeLayers.includes(layer.id))
        .sort((a, b) => a.order - b.order)
        .forEach(layer => {
          drawLayer(ctx, layer)
        })

      // استعادة حالة الكانفاس
      ctx.restore()
    }

    drawMap()

    // إضافة مستمع لتغيير حجم النافذة
    const handleResize = () => {
      drawMap()
    }

    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [qgisProject, activeLayers, zoom, panX, panY, selectedHouse])

  // رسم طبقة
  function drawLayer(ctx: CanvasRenderingContext2D, layer: QGISLayer) {
    if (!layer.visible) return

    ctx.globalAlpha = layer.opacity

    layer.features.forEach(feature => {
      drawFeature(ctx, feature, layer)
    })

    ctx.globalAlpha = 1.0
  }

  // رسم عنصر
  function drawFeature(ctx: CanvasRenderingContext2D, feature: any, layer: QGISLayer) {
    const style = layer.style

    // تطبيق النمط
    ctx.fillStyle = style.color
    ctx.strokeStyle = style.strokeColor || style.color
    ctx.lineWidth = style.strokeWidth || 1

    // رسم حسب نوع الهندسة
    if (layer.geometry === 'Point') {
      drawPoint(ctx, feature, style)
    } else if (layer.geometry === 'LineString') {
      drawLineString(ctx, feature, style)
    } else if (layer.geometry === 'Polygon') {
      drawPolygon(ctx, feature, style)
    }

    // رسم التسميات
    if (style.label?.enabled) {
      drawLabel(ctx, feature, style.label)
    }
  }

  // رسم نقطة
  function drawPoint(ctx: CanvasRenderingContext2D, feature: any, style: any) {
    const [lng, lat] = feature.geometry.coordinates
    
    // تحويل الإحداثيات إلى إحداثيات الشاشة
    let screenX, screenY
    
    if (showOmanWide) {
      // عرض شامل للسلطنة
      const omanBounds = { west: 52.0, east: 60.0, south: 16.0, north: 26.5 }
      screenX = ((lng - omanBounds.west) / (omanBounds.east - omanBounds.west)) * 800 + 100
      screenY = ((omanBounds.north - lat) / (omanBounds.north - omanBounds.south)) * 600 + 100
    } else {
      // عرض محلي لمدينة سلطان قابوس
      screenX = (lng - 58.5900) * 10000 + 100
      screenY = (23.6200 - lat) * 10000 + 100
    }

    // دائرة
    ctx.beginPath()
    ctx.arc(screenX, screenY, style.size / 2, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
  }

  // رسم خط
  function drawLineString(ctx: CanvasRenderingContext2D, feature: any, style: any) {
    const coordinates = feature.geometry.coordinates
    ctx.beginPath()
    
    coordinates.forEach((coord: number[], index: number) => {
      const [lng, lat] = coord
      let x, y
      
      if (showOmanWide) {
        const omanBounds = { west: 52.0, east: 60.0, south: 16.0, north: 26.5 }
        x = ((lng - omanBounds.west) / (omanBounds.east - omanBounds.west)) * 800 + 100
        y = ((omanBounds.north - lat) / (omanBounds.north - omanBounds.south)) * 600 + 100
      } else {
        x = (lng - 58.5900) * 10000 + 100
        y = (23.6200 - lat) * 10000 + 100
      }
      
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    
    ctx.stroke()
  }

  // رسم مضلع
  function drawPolygon(ctx: CanvasRenderingContext2D, feature: any, style: any) {
    const coordinates = feature.geometry.coordinates[0]
    ctx.beginPath()
    
    coordinates.forEach((coord: number[], index: number) => {
      const [lng, lat] = coord
      let x, y
      
      if (showOmanWide) {
        const omanBounds = { west: 52.0, east: 60.0, south: 16.0, north: 26.5 }
        x = ((lng - omanBounds.west) / (omanBounds.east - omanBounds.west)) * 800 + 100
        y = ((omanBounds.north - lat) / (omanBounds.north - omanBounds.south)) * 600 + 100
      } else {
        x = (lng - 58.5900) * 10000 + 100
        y = (23.6200 - lat) * 10000 + 100
      }
      
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }

  // رسم تسمية
  function drawLabel(ctx: CanvasRenderingContext2D, feature: any, label: any) {
    const value = feature.properties[label.field]
    if (!value) return

    const [lng, lat] = feature.geometry.coordinates
    let screenX, screenY
    
    if (showOmanWide) {
      const omanBounds = { west: 52.0, east: 60.0, south: 16.0, north: 26.5 }
      screenX = ((lng - omanBounds.west) / (omanBounds.east - omanBounds.west)) * 800 + 100 + label.offset.x
      screenY = ((omanBounds.north - lat) / (omanBounds.north - omanBounds.south)) * 600 + 100 + label.offset.y
    } else {
      screenX = (lng - 58.5900) * 10000 + 100 + label.offset.x
      screenY = (23.6200 - lat) * 10000 + 100 + label.offset.y
    }

    ctx.fillStyle = label.font.color
    ctx.font = `${label.font.bold ? 'bold' : 'normal'} ${label.font.size}px ${label.font.family}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(value.toString(), screenX, screenY)
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
      if (!rect || !qgisProject) return

      const mouseX = (e.clientX - rect.left - panX) / zoom
      const mouseY = (e.clientY - rect.top - panY) / zoom

      // البحث عن عنصر تحت الماوس
      const feature = findFeatureUnderMouse(mouseX, mouseY)
      setHoveredFeature(feature)
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging && hoveredFeature) {
      // البحث عن المنزل المقابل
      const house = houses.find(h => h.id === hoveredFeature.id.replace('house_', ''))
      if (house) {
        onHouseSelect(house)
      }
    }
    setIsDragging(false)
  }

  // البحث عن عنصر تحت الماوس
  function findFeatureUnderMouse(mouseX: number, mouseY: number) {
    if (!qgisProject) return null

    for (const layer of qgisProject.layers) {
      if (!activeLayers.includes(layer.id)) continue

      for (const feature of layer.features) {
        if (layer.geometry === 'Point') {
          const [lng, lat] = feature.geometry.coordinates
          let screenX, screenY
          
          if (showOmanWide) {
            const omanBounds = { west: 52.0, east: 60.0, south: 16.0, north: 26.5 }
            screenX = ((lng - omanBounds.west) / (omanBounds.east - omanBounds.west)) * 800 + 100
            screenY = ((omanBounds.north - lat) / (omanBounds.north - omanBounds.south)) * 600 + 100
          } else {
            screenX = (lng - 58.5900) * 10000 + 100
            screenY = (23.6200 - lat) * 10000 + 100
          }
          
          const distance = Math.sqrt((mouseX - screenX) ** 2 + (mouseY - screenY) ** 2)
          if (distance < 10) {
            return { ...feature, layer }
          }
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

  // تصدير مشروع QGIS بصيغة JSON
  const exportProject = () => {
    if (!qgisProject) return
    
    const qgsContent = exportQGISProject(qgisProject)
    const blob = new Blob([qgsContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = showOmanWide ? 'oman_complete_project.json' : 'sultan_qaboos_city.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // تصدير مشروع QGIS بصيغة QGS
  const exportQGSProject = () => {
    if (!qgisProject) return
    
    const qgsContent = exportQGISProjectFile(qgisProject)
    const blob = new Blob([qgsContent], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = showOmanWide ? 'oman_complete_project.qgs' : 'sultan_qaboos_city.qgs'
    a.click()
    URL.revokeObjectURL(url)
  }

  // تصدير جميع الطبقات بصيغة GeoJSON
  const exportGeoJSONLayers = () => {
    if (!qgisProject) return
    
    const geoJSONExports = exportAllLayersToGeoJSON(qgisProject)
    
    Object.entries(geoJSONExports).forEach(([layerId, geoJSONContent]) => {
      const blob = new Blob([geoJSONContent], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${layerId}.geojson`
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  // معالجة نتائج البحث المتقدم
  const handleSearchResult = (result: any) => {
    setSearchResult(result)
    
    // تحريك الخريطة إلى النتيجة
    if (result.coordinates) {
      const { lat, lng } = result.coordinates
      
      if (showOmanWide) {
        const omanBounds = { west: 52.0, east: 60.0, south: 16.0, north: 26.5 }
        const screenX = ((lng - omanBounds.west) / (omanBounds.east - omanBounds.west)) * 800 + 100
        const screenY = ((omanBounds.north - lat) / (omanBounds.north - omanBounds.south)) * 600 + 100
        
        setPanX(-screenX + 400)
        setPanY(-screenY + 300)
        setZoom(0.5)
      }
    }
  }

  const handleClearSearch = () => {
    setSearchResult(null)
  }

  if (!qgisProject) return <div>جاري تحميل مشروع QGIS...</div>

  const stats = getQGISStats(qgisProject)

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
            <div className="font-semibold text-blue-600">{hoveredFeature.layer.name}</div>
            {hoveredFeature.properties.house_no && (
              <div className="text-gray-600">المنزل رقم {hoveredFeature.properties.house_no}</div>
            )}
            {hoveredFeature.properties.name && (
              <div className="text-gray-600">{hoveredFeature.properties.name}</div>
            )}
            <div className="text-xs text-gray-500 mt-1">
              {Object.entries(hoveredFeature.properties).map(([key, value]) => (
                <div key={key}>{key}: {value}</div>
              ))}
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
        <h3 className="font-semibold text-gray-800 mb-3">QGIS Layers</h3>
        
        {/* تبديل العرض */}
        <div className="mb-4 p-2 bg-gray-50 rounded">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="radio"
              id="oman-wide"
              name="view-mode"
              checked={showOmanWide}
              onChange={() => setShowOmanWide(true)}
              className="rounded"
            />
            <label htmlFor="oman-wide" className="text-sm text-gray-700">عرض شامل للسلطنة</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="local-view"
              name="view-mode"
              checked={!showOmanWide}
              onChange={() => setShowOmanWide(false)}
              className="rounded"
            />
            <label htmlFor="local-view" className="text-sm text-gray-700">عرض محلي</label>
          </div>
        </div>
        
        {/* قائمة الطبقات */}
        <div className="space-y-2 mb-4">
          {qgisProject.layers.map(layer => (
            <div key={layer.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={activeLayers.includes(layer.id)}
                onChange={() => toggleLayer(layer.id)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">{layer.name}</span>
              <span className="text-xs text-gray-500">({layer.features.length})</span>
            </div>
          ))}
        </div>

        {/* إحصائيات */}
        <div className="text-xs text-gray-600 mb-4">
          <div>الطبقات: {stats.totalLayers}</div>
          <div>العناصر: {stats.totalFeatures}</div>
          <div>النقاط: {stats.pointFeatures}</div>
          <div>الخطوط: {stats.lineFeatures}</div>
          <div>المضلعات: {stats.polygonFeatures}</div>
        </div>

        {/* أزرار التحكم */}
        <div className="space-y-2">
          <button
            onClick={exportProject}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm"
          >
            تصدير JSON
          </button>
          <button
            onClick={exportQGSProject}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded text-sm"
          >
            تصدير QGS
          </button>
          <button
            onClick={exportGeoJSONLayers}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm"
          >
            تصدير GeoJSON
          </button>
          <button
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded text-sm"
          >
            {showAdvancedSearch ? 'إخفاء البحث' : 'البحث المتقدم'}
          </button>
          {onToggleLayerManager && (
            <button
              onClick={onToggleLayerManager}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-3 rounded text-sm"
            >
              Layer Manager
            </button>
          )}
          <button
            onClick={() => {
              setZoom(showOmanWide ? 0.1 : 1)
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

      {/* معلومات QGIS */}
      <div className="absolute bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-2 shadow-lg">
        <div className="text-xs text-gray-600">
          <div className="font-semibold">QGIS {qgisProject.version}</div>
          <div>CRS: {qgisProject.crs}</div>
          <div>المشروع: {qgisProject.name}</div>
        </div>
      </div>

      {/* البحث المتقدم */}
      {showAdvancedSearch && (
        <div className="absolute top-4 left-4 z-20">
          <AdvancedGISSearch
            onSearchResult={handleSearchResult}
            onClearSearch={handleClearSearch}
          />
        </div>
      )}

      {/* معلومات نتيجة البحث */}
      {searchResult && (
        <div className="absolute top-4 left-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm z-10">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-gray-800">نتيجة البحث</h4>
            <button
              onClick={handleClearSearch}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="text-sm">
            <div className="font-medium text-blue-600">{searchResult.name}</div>
            <div className="text-gray-600 mt-1">{searchResult.details}</div>
            <div className="flex gap-4 mt-2 text-xs text-gray-500">
              <span>📍 {searchResult.governorate}</span>
              {searchResult.wilayat && <span>🏘️ {searchResult.wilayat}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
