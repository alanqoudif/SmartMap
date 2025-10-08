import { useState, useRef, useEffect } from 'react'
import { House } from '../../types'
import AdvancedGISSearch from '../AdvancedGISSearch/AdvancedGISSearch'
import { 
  createHousesQGISLayer, 
  createStreetsQGISLayer, 
  createBlocksQGISLayer, 
  createQGISProject,
  createOmanQGISProject,
  exportQGISProject,
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
    'oman_houses_layer'
  ])
  // const [selectedLayer, setSelectedLayer] = useState<string>('oman_buildings_layer')
  const [showOmanWide, setShowOmanWide] = useState(false) // عرض محلي لمسقط
  const [zoom, setZoom] = useState(1.5) // تكبير محسن لمسقط
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hoveredFeature, setHoveredFeature] = useState<any>(null)
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [searchResult, setSearchResult] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'satellite' | 'terrain' | 'street'>('terrain')
  const [showStats, setShowStats] = useState(true)
  const [selectedFeature, setSelectedFeature] = useState<any>(null)
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

  // رسم الخريطة المحسنة
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

      // رسم خلفية جميلة
      drawBackground(ctx, canvas.width, canvas.height)

      // حفظ حالة الكانفاس
      ctx.save()

      // تطبيق التحويلات
      ctx.translate(panX, panY)
      ctx.scale(zoom, zoom)

      // رسم الطبقات حسب الترتيب مع تحسينات
      qgisProject.layers
        .filter(layer => activeLayers.includes(layer.id))
        .sort((a, b) => a.order - b.order)
        .forEach(layer => {
          drawLayerEnhanced(ctx, layer)
        })

      // رسم العنصر المحدد
      if (selectedFeature) {
        drawSelectedFeature(ctx, selectedFeature)
      }

      // استعادة حالة الكانفاس
      ctx.restore()

      // رسم معلومات إضافية
      drawMapInfo(ctx, canvas.width, canvas.height)
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
  }, [qgisProject, activeLayers, zoom, panX, panY, selectedHouse, selectedFeature, viewMode])

  // رسم خلفية واقعية مثل OpenStreetMap
  function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // خلفية أساسية مثل OpenStreetMap
    ctx.fillStyle = '#F8F9FA' // لون خلفية OSM
    ctx.fillRect(0, 0, width, height)

    // رسم شبكة الشوارع الرئيسية
    ctx.strokeStyle = '#E9ECEF'
    ctx.lineWidth = 2
    for (let i = 0; i < width; i += 100) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, height)
      ctx.stroke()
    }
    for (let i = 0; i < height; i += 100) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(width, i)
      ctx.stroke()
    }

    // رسم شبكة الشوارع الثانوية
    ctx.strokeStyle = '#F1F3F4'
    ctx.lineWidth = 1
    for (let i = 0; i < width; i += 50) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, height)
      ctx.stroke()
    }
    for (let i = 0; i < height; i += 50) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(width, i)
      ctx.stroke()
    }

    // رسم مناطق خضراء (حدائق)
    ctx.fillStyle = '#E8F5E8'
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const size = 50 + Math.random() * 100
      ctx.beginPath()
      ctx.arc(x, y, size, 0, 2 * Math.PI)
      ctx.fill()
    }

    // رسم مناطق مائية (بحيرات صغيرة)
    ctx.fillStyle = '#E3F2FD'
    for (let i = 0; i < 3; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const size = 30 + Math.random() * 60
      ctx.beginPath()
      ctx.arc(x, y, size, 0, 2 * Math.PI)
      ctx.fill()
    }
  }

  // رسم معلومات الخريطة
  function drawMapInfo(ctx: CanvasRenderingContext2D, width: number, _height: number) {
    // خلفية العنوان
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.fillRect(10, 10, width - 20, 60)
    
    // حدود العنوان
    ctx.strokeStyle = '#E5E7EB'
    ctx.lineWidth = 1
    ctx.strokeRect(10, 10, width - 20, 60)
    
    // عنوان الخريطة
    ctx.fillStyle = '#1F2937'
    ctx.font = 'bold 18px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('OpenStreetMap - سلطنة عُمان', width / 2, 20)
    
    // وصف الخريطة
    ctx.font = '12px Arial'
    ctx.fillStyle = '#6B7280'
    ctx.fillText('خريطة تفاعلية لجميع المباني والمنازل في السلطنة', width / 2, 45)
  }

  // رسم طبقة محسنة
  function drawLayerEnhanced(ctx: CanvasRenderingContext2D, layer: QGISLayer) {
    if (!layer.visible) return

    ctx.globalAlpha = layer.opacity

    layer.features.forEach(feature => {
      drawFeatureEnhanced(ctx, feature, layer)
    })

    ctx.globalAlpha = 1.0
  }

  // رسم عنصر محسن
  function drawFeatureEnhanced(ctx: CanvasRenderingContext2D, feature: any, layer: QGISLayer) {
    const style = layer.style

    // تطبيق النمط المحسن
    ctx.fillStyle = style.color
    ctx.strokeStyle = style.strokeColor || style.color
    ctx.lineWidth = style.strokeWidth || 1

    // رسم حسب نوع الهندسة مع تحسينات
    if (layer.geometry === 'Point') {
      drawPointEnhanced(ctx, feature, style, layer)
    } else if (layer.geometry === 'LineString') {
      drawLineStringEnhanced(ctx, feature, style)
    } else if (layer.geometry === 'Polygon') {
      drawPolygonEnhanced(ctx, feature, style)
    }

    // رسم التسميات المحسنة
    if (style.label?.enabled) {
      drawLabelEnhanced(ctx, feature, style.label)
    }
  }

  // رسم نقطة محسنة - مباني واقعية
  function drawPointEnhanced(ctx: CanvasRenderingContext2D, feature: any, style: any, layer: QGISLayer) {
    const coordinates = feature.geometry.coordinates as number[]
    const [lng, lat] = coordinates
    
    // تحويل الإحداثيات إلى إحداثيات الشاشة
    let screenX, screenY
    
    if (showOmanWide) {
      const omanBounds = { west: 52.0, east: 60.0, south: 16.0, north: 26.5 }
      screenX = ((lng - omanBounds.west) / (omanBounds.east - omanBounds.west)) * 800 + 100
      screenY = ((omanBounds.north - lat) / (omanBounds.north - omanBounds.south)) * 600 + 100
    } else {
      screenX = (lng - 58.5900) * 10000 + 100
      screenY = (23.6200 - lat) * 10000 + 100
    }

    // تحديد لون وحجم المبنى حسب النوع
    let color = '#6B7280'
    let size = 4
    let buildingShape = 'circle'
    
    if (layer.id === 'oman_buildings_layer') {
      switch (feature.properties.building_type) {
        case 'فيلا':
          color = '#10B981'
          size = 6
          buildingShape = 'house'
          break
        case 'شقة':
          color = '#3B82F6'
          size = 5
          buildingShape = 'apartment'
          break
        case 'بيت شعبي':
          color = '#F59E0B'
          size = 5
          buildingShape = 'house'
          break
        case 'عمارة':
          color = '#8B5CF6'
          size = 7
          buildingShape = 'building'
          break
        case 'مبنى تجاري':
          color = '#EF4444'
          size = 6
          buildingShape = 'commercial'
          break
        case 'مبنى حكومي':
          color = '#06B6D4'
          size = 8
          buildingShape = 'government'
          break
        case 'مبنى صناعي':
          color = '#84CC16'
          size = 7
          buildingShape = 'industrial'
          break
        case 'مبنى تعليمي':
          color = '#EC4899'
          size = 8
          buildingShape = 'school'
          break
        case 'مبنى صحي':
          color = '#F97316'
          size = 7
          buildingShape = 'hospital'
          break
        default:
          color = '#6B7280'
          size = 4
      }
    }

    // رسم ظل للمبنى
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
    ctx.shadowBlur = 2
    ctx.shadowOffsetX = 1
    ctx.shadowOffsetY = 1

    ctx.fillStyle = color
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 1

    // رسم المبنى حسب الشكل
    if (buildingShape === 'house') {
      // رسم منزل
      ctx.beginPath()
      ctx.moveTo(screenX, screenY - size)
      ctx.lineTo(screenX - size, screenY + size/2)
      ctx.lineTo(screenX + size, screenY + size/2)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    } else if (buildingShape === 'apartment') {
      // رسم شقة (مستطيل)
      ctx.fillRect(screenX - size/2, screenY - size/2, size, size)
      ctx.strokeRect(screenX - size/2, screenY - size/2, size, size)
    } else if (buildingShape === 'building') {
      // رسم عمارة (مستطيل كبير)
      ctx.fillRect(screenX - size/2, screenY - size/2, size, size)
      ctx.strokeRect(screenX - size/2, screenY - size/2, size, size)
      // رسم خطوط الطوابق
      for (let i = 1; i < 3; i++) {
        ctx.beginPath()
        ctx.moveTo(screenX - size/2, screenY - size/2 + (size/3) * i)
        ctx.lineTo(screenX + size/2, screenY - size/2 + (size/3) * i)
        ctx.stroke()
      }
    } else if (buildingShape === 'commercial') {
      // رسم مبنى تجاري (مستطيل مع خط)
      ctx.fillRect(screenX - size/2, screenY - size/2, size, size)
      ctx.strokeRect(screenX - size/2, screenY - size/2, size, size)
      ctx.beginPath()
      ctx.moveTo(screenX - size/2, screenY)
      ctx.lineTo(screenX + size/2, screenY)
      ctx.stroke()
    } else if (buildingShape === 'government') {
      // رسم مبنى حكومي (مستطيل مع قبة)
      ctx.fillRect(screenX - size/2, screenY - size/2, size, size)
      ctx.strokeRect(screenX - size/2, screenY - size/2, size, size)
      // رسم قبة
      ctx.beginPath()
      ctx.arc(screenX, screenY - size/2, size/3, 0, Math.PI)
      ctx.stroke()
    } else if (buildingShape === 'school') {
      // رسم مدرسة (مستطيل مع علم)
      ctx.fillRect(screenX - size/2, screenY - size/2, size, size)
      ctx.strokeRect(screenX - size/2, screenY - size/2, size, size)
      // رسم علم
      ctx.beginPath()
      ctx.moveTo(screenX + size/2, screenY - size/2)
      ctx.lineTo(screenX + size/2 + 2, screenY - size/2 - 2)
      ctx.stroke()
    } else if (buildingShape === 'hospital') {
      // رسم مستشفى (مستطيل مع صليب)
      ctx.fillRect(screenX - size/2, screenY - size/2, size, size)
      ctx.strokeRect(screenX - size/2, screenY - size/2, size, size)
      // رسم صليب
      ctx.beginPath()
      ctx.moveTo(screenX, screenY - size/3)
      ctx.lineTo(screenX, screenY + size/3)
      ctx.moveTo(screenX - size/3, screenY)
      ctx.lineTo(screenX + size/3, screenY)
      ctx.stroke()
    } else {
      // رسم دائرة عادية
      ctx.beginPath()
      ctx.arc(screenX, screenY, size/2, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
    }

    // إزالة الظل
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    // تمييز العنصر المحوم عليه
    if (hoveredFeature?.id === feature.id) {
      ctx.strokeStyle = '#F59E0B'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(screenX, screenY, size + 2, 0, 2 * Math.PI)
      ctx.stroke()
    }
  }

  // رسم خط محسن - شوارع وطرق
  function drawLineStringEnhanced(ctx: CanvasRenderingContext2D, feature: any, _style: any) {
    const coordinates = feature.geometry.coordinates as number[][]
    
    // تحديد نوع الطريق
    const roadType = feature.properties.road_type || feature.properties.highway || 'street'
    let roadColor = '#6B7280'
    let roadWidth = 2
    
    switch (roadType) {
      case 'motorway':
      case 'طريق سريع':
        roadColor = '#DC2626'
        roadWidth = 6
        break
      case 'trunk':
      case 'طريق رئيسي':
        roadColor = '#EA580C'
        roadWidth = 5
        break
      case 'primary':
      case 'طريق ثانوي':
        roadColor = '#D97706'
        roadWidth = 4
        break
      case 'secondary':
      case 'شارع رئيسي':
        roadColor = '#059669'
        roadWidth = 3
        break
      case 'tertiary':
      case 'شارع فرعي':
        roadColor = '#0891B2'
        roadWidth = 2
        break
      case 'residential':
      case 'شارع سكني':
        roadColor = '#6B7280'
        roadWidth = 2
        break
      case 'footway':
      case 'ممشى':
        roadColor = '#7C3AED'
        roadWidth = 1
        break
      default:
        roadColor = '#6B7280'
        roadWidth = 2
    }
    
    ctx.strokeStyle = roadColor
    ctx.lineWidth = roadWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
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
    
    // رسم خط أبيض في المنتصف للطرق الرئيسية
    if (roadWidth >= 4) {
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = Math.max(1, roadWidth / 3)
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
  }

  // رسم مضلع محسن - أراضي ومناطق
  function drawPolygonEnhanced(ctx: CanvasRenderingContext2D, feature: any, _style: any) {
    const coordinates = (feature.geometry.coordinates as number[][][])[0]
    
    // تحديد نوع المنطقة
    const areaType = feature.properties.landuse || feature.properties.amenity || feature.properties.leisure || 'land'
    let fillColor = '#F3F4F6'
    let strokeColor = '#D1D5DB'
    let strokeWidth = 1
    
    switch (areaType) {
      case 'residential':
      case 'سكني':
        fillColor = '#FEF3C7'
        strokeColor = '#F59E0B'
        break
      case 'commercial':
      case 'تجاري':
        fillColor = '#FEE2E2'
        strokeColor = '#EF4444'
        break
      case 'industrial':
      case 'صناعي':
        fillColor = '#E5E7EB'
        strokeColor = '#6B7280'
        break
      case 'park':
      case 'حديقة':
        fillColor = '#D1FAE5'
        strokeColor = '#10B981'
        break
      case 'water':
      case 'مياه':
        fillColor = '#DBEAFE'
        strokeColor = '#3B82F6'
        break
      case 'forest':
      case 'غابة':
        fillColor = '#DCFCE7'
        strokeColor = '#16A34A'
        break
      case 'school':
      case 'مدرسة':
        fillColor = '#FCE7F3'
        strokeColor = '#EC4899'
        break
      case 'hospital':
      case 'مستشفى':
        fillColor = '#FED7AA'
        strokeColor = '#F97316'
        break
      case 'government':
      case 'حكومي':
        fillColor = '#E0E7FF'
        strokeColor = '#6366F1'
        break
      default:
        fillColor = '#F3F4F6'
        strokeColor = '#D1D5DB'
    }
    
    ctx.fillStyle = fillColor
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = strokeWidth
    
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
    
    // رسم نمط خاص للمناطق المهمة
    if (areaType === 'park' || areaType === 'حديقة') {
      // رسم أشجار صغيرة
      ctx.fillStyle = '#16A34A'
      for (let i = 0; i < 3; i++) {
        const centerX = coordinates[Math.floor(Math.random() * coordinates.length)][0]
        const centerY = coordinates[Math.floor(Math.random() * coordinates.length)][1]
        let x, y
        
        if (showOmanWide) {
          const omanBounds = { west: 52.0, east: 60.0, south: 16.0, north: 26.5 }
          x = ((centerX - omanBounds.west) / (omanBounds.east - omanBounds.west)) * 800 + 100
          y = ((omanBounds.north - centerY) / (omanBounds.north - omanBounds.south)) * 600 + 100
        } else {
          x = (centerX - 58.5900) * 10000 + 100
          y = (23.6200 - centerY) * 10000 + 100
        }
        
        ctx.beginPath()
        ctx.arc(x, y, 2, 0, 2 * Math.PI)
        ctx.fill()
      }
    }
  }

  // رسم تسمية محسنة
  function drawLabelEnhanced(ctx: CanvasRenderingContext2D, feature: any, label: any) {
    const value = feature.properties[label.field]
    if (!value) return

    const coordinates = feature.geometry.coordinates as number[]
    const [lng, lat] = coordinates
    let screenX, screenY
    
    if (showOmanWide) {
      const omanBounds = { west: 52.0, east: 60.0, south: 16.0, north: 26.5 }
      screenX = ((lng - omanBounds.west) / (omanBounds.east - omanBounds.west)) * 800 + 100 + label.offset.x
      screenY = ((omanBounds.north - lat) / (omanBounds.north - omanBounds.south)) * 600 + 100 + label.offset.y
    } else {
      screenX = (lng - 58.5900) * 10000 + 100 + label.offset.x
      screenY = (23.6200 - lat) * 10000 + 100 + label.offset.y
    }

    // رسم خلفية للتسمية
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.fillRect(screenX - 15, screenY - 8, 30, 16)

    ctx.fillStyle = label.font.color
    ctx.font = `${label.font.bold ? 'bold' : 'normal'} ${label.font.size}px ${label.font.family}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(value.toString(), screenX, screenY)
  }

  // رسم العنصر المحدد
  function drawSelectedFeature(ctx: CanvasRenderingContext2D, feature: any) {
    if (!feature) return

    const coordinates = feature.geometry.coordinates as number[]
    const [lng, lat] = coordinates
    let screenX, screenY
    
    if (showOmanWide) {
      const omanBounds = { west: 52.0, east: 60.0, south: 16.0, north: 26.5 }
      screenX = ((lng - omanBounds.west) / (omanBounds.east - omanBounds.west)) * 800 + 100
      screenY = ((omanBounds.north - lat) / (omanBounds.north - omanBounds.south)) * 600 + 100
    } else {
      screenX = (lng - 58.5900) * 10000 + 100
      screenY = (23.6200 - lat) * 10000 + 100
    }

    // رسم دائرة متحركة حول العنصر المحدد
    ctx.strokeStyle = '#DC2626'
    ctx.lineWidth = 3
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.arc(screenX, screenY, 15, 0, 2 * Math.PI)
    ctx.stroke()
    ctx.setLineDash([])
  }

  // رسم طبقة (النسخة القديمة للتوافق)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  function drawPoint(ctx: CanvasRenderingContext2D, feature: any, _style: any) {
    const coordinates = feature.geometry.coordinates as number[]
    const [lng, lat] = coordinates
    
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
    ctx.arc(screenX, screenY, 6, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
  }

  // رسم خط
  function drawLineString(ctx: CanvasRenderingContext2D, feature: any, _style: any) {
    const coordinates = feature.geometry.coordinates as number[][]
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
  function drawPolygon(ctx: CanvasRenderingContext2D, feature: any, _style: any) {
    const coordinates = (feature.geometry.coordinates as number[][][])[0]
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

    const coordinates = feature.geometry.coordinates as number[]
    const [lng, lat] = coordinates
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

  const handleMouseUp = (_e: React.MouseEvent) => {
    if (!isDragging && hoveredFeature) {
      setSelectedFeature(hoveredFeature)
      
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
          const coordinates = feature.geometry.coordinates as number[]
    const [lng, lat] = coordinates
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
    setZoom(prev => Math.max(0.1, Math.min(10, prev * delta))) // تكبير أكثر مرونة
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
  // const exportQGSProject = () => {
  //   if (!qgisProject) return
  //   
  //   const qgsContent = exportQGISProjectFile(qgisProject)
  //   const blob = new Blob([qgsContent], { type: 'application/xml' })
  //   const url = URL.createObjectURL(blob)
  //   const a = document.createElement('a')
  //   a.href = url
  //   a.download = showOmanWide ? 'oman_complete_project.qgs' : 'sultan_qaboos_city.qgs'
  //   a.click()
  //   URL.revokeObjectURL(url)
  // }

  // تصدير جميع الطبقات بصيغة GeoJSON
  // const exportGeoJSONLayers = () => {
  //   if (!qgisProject) return
  //   
  //   const geoJSONExports = exportAllLayersToGeoJSON(qgisProject)
  //   
  //   Object.entries(geoJSONExports).forEach(([layerId, geoJSONContent]) => {
  //     const blob = new Blob([geoJSONContent], { type: 'application/json' })
  //     const url = URL.createObjectURL(blob)
  //     const a = document.createElement('a')
  //     a.href = url
  //     a.download = `${layerId}.geojson`
  //     a.click()
  //     URL.revokeObjectURL(url)
  //   })
  // }

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

      {/* لوحة التحكم المحسنة */}
      <div className="absolute top-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-xs">
          <h3 className="font-semibold text-gray-800 mb-3">🗺️ OpenStreetMap - عُمان</h3>
        
        {/* نوع العرض */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">نوع الخريطة</label>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="terrain">🗺️ خريطة شوارع</option>
            <option value="satellite">🛰️ أقمار صناعية</option>
            <option value="street">🏙️ خريطة حضرية</option>
          </select>
        </div>
        
        {/* تبديل العرض */}
        <div className="mb-4 p-2 bg-gray-50 rounded">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="radio"
              id="oman-wide"
              name="view-mode"
              checked={showOmanWide}
              onChange={() => {
                setShowOmanWide(true)
                setZoom(0.15)
                setPanX(0)
                setPanY(0)
              }}
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
              onChange={() => {
                setShowOmanWide(false)
                setZoom(1.5)
                setPanX(0)
                setPanY(0)
              }}
              className="rounded"
            />
            <label htmlFor="local-view" className="text-sm text-gray-700">عرض مسقط (مُوصى به)</label>
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

        {/* إحصائيات محسنة */}
        {showStats && (
          <div className="text-xs text-gray-600 mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="font-semibold text-green-800 mb-2 flex items-center gap-1">
              📊 إحصائيات OpenStreetMap
        </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1">
                <span className="text-green-600">🏢</span>
                <span>المباني: <span className="font-medium text-green-700">{stats.pointFeatures.toLocaleString()}</span></span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-blue-600">🛣️</span>
                <span>الشوارع: <span className="font-medium text-blue-700">{stats.lineFeatures}</span></span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-orange-600">🏘️</span>
                <span>الأراضي: <span className="font-medium text-orange-700">{stats.polygonFeatures}</span></span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-purple-600">🏛️</span>
                <span>المحافظات: <span className="font-medium text-purple-700">11</span></span>
              </div>
              <div className="flex items-center gap-1 col-span-2">
                <span className="text-gray-600">📈</span>
                <span>إجمالي العناصر: <span className="font-medium text-gray-700">{stats.totalFeatures.toLocaleString()}</span></span>
              </div>
            </div>
          </div>
        )}

        {/* أزرار التحكم المحسنة */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
          <button
              onClick={() => setShowStats(!showStats)}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm flex items-center justify-center gap-1"
          >
              {showStats ? '📊 إخفاء' : '📊 إظهار'}
          </button>
          <button
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded text-sm flex items-center justify-center gap-1"
          >
              {showAdvancedSearch ? '🔍 إخفاء' : '🔍 بحث'}
          </button>
          </div>
          
          <button
            onClick={exportProject}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm flex items-center justify-center gap-1"
          >
            💾 تصدير البيانات
          </button>
          
          <button
            onClick={() => {
              setZoom(1.5) // تكبير محسن لمسقط
              setPanX(0)
              setPanY(0)
              setSelectedFeature(null)
              setShowOmanWide(false) // التأكد من عرض مسقط
            }}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded text-sm flex items-center justify-center gap-1"
          >
            🏠 العودة لمسقط
          </button>
          
          {onToggleLayerManager && (
            <button
              onClick={onToggleLayerManager}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-3 rounded text-sm"
            >
              ⚙️ إدارة الطبقات
            </button>
          )}
        </div>
      </div>

      {/* أزرار التكبير المحسنة */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <button
          onClick={() => setZoom(prev => Math.min(10, prev * 1.3))}
          className="bg-white border border-gray-300 rounded-lg p-2 shadow-lg hover:bg-gray-50"
          title="تكبير أكثر"
        >
          +
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(0.1, prev * 0.7))}
          className="bg-white border border-gray-300 rounded-lg p-2 shadow-lg hover:bg-gray-50"
          title="تصغير أكثر"
        >
          -
        </button>
        <button
          onClick={() => {
            setZoom(1.5)
            setPanX(0)
            setPanY(0)
          }}
          className="bg-blue-500 text-white border border-gray-300 rounded-lg p-2 shadow-lg hover:bg-blue-600"
          title="العودة لمسقط"
        >
          🏠
        </button>
      </div>

      {/* معلومات التكبير */}
      <div className="absolute bottom-4 left-4 bg-white border border-gray-300 rounded-lg p-2 shadow-lg">
        <div className="text-sm text-gray-600">
          التكبير: {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* معلومات OpenStreetMap المحسنة */}
      <div className="absolute bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-3 shadow-lg">
        <div className="text-xs text-gray-600">
          <div className="font-semibold text-blue-600 flex items-center gap-1">
            🗺️ OpenStreetMap - عُمان
          </div>
          <div className="flex items-center gap-1">
            <span className="text-green-600">📊</span>
            <span>الإصدار: {qgisProject.version}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-purple-600">🌍</span>
            <span>النظام: {qgisProject.crs}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-orange-600">📁</span>
            <span>المشروع: {qgisProject.name}</span>
          </div>
          <div className="mt-1 text-green-600 flex items-center gap-1">
            ✅ <span>خريطة تفاعلية جاهزة</span>
          </div>
        </div>
      </div>

      {/* معلومات العنصر المحدد */}
      {selectedFeature && (
        <div className="absolute top-4 left-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm z-10">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-gray-800">تفاصيل العنصر</h4>
            <button
              onClick={() => setSelectedFeature(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="text-sm">
            <div className="font-medium text-blue-600">
              {selectedFeature.properties.building_name || 
               selectedFeature.properties.name || 
               `عنصر ${selectedFeature.id}`}
            </div>
            <div className="text-gray-600 mt-2">
              {selectedFeature.properties.building_type && (
                <div>النوع: {selectedFeature.properties.building_type}</div>
              )}
              {selectedFeature.properties.governorate && (
                <div>المحافظة: {selectedFeature.properties.governorate}</div>
              )}
              {selectedFeature.properties.wilayat && (
                <div>الولاية: {selectedFeature.properties.wilayat}</div>
              )}
              {selectedFeature.properties.area_m2 && (
                <div>المساحة: {selectedFeature.properties.area_m2} م²</div>
              )}
              {selectedFeature.properties.floors && (
                <div>الطوابق: {selectedFeature.properties.floors}</div>
              )}
              {selectedFeature.properties.construction_year && (
                <div>سنة البناء: {selectedFeature.properties.construction_year}</div>
              )}
              {selectedFeature.properties.owner_name && (
                <div>المالك: {selectedFeature.properties.owner_name}</div>
              )}
            </div>
          </div>
        </div>
      )}

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
