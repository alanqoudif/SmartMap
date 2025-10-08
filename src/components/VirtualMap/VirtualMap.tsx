import { useState, useRef, useEffect } from 'react'
import { House } from '../../types'
import { generateOmanGISAddress, OmanGISAddress, OMAN_WILAYATS } from '../../utils/omanGIS'
import { createHousesQGISLayer, createStreetsQGISLayer, createBlocksQGISLayer, QGISLayer } from '../../utils/qgisSystem'

interface VirtualMapProps {
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

export default function VirtualMap({ houses, onHouseSelect, selectedHouse }: VirtualMapProps) {
  const [zoom, setZoom] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hoveredHouse, setHoveredHouse] = useState<HouseInfo | null>(null)
  const [qgisLayers, setQGISLayers] = useState<QGISLayer[]>([])
  const [activeLayers, setActiveLayers] = useState<string[]>(['houses_layer', 'streets_layer', 'blocks_layer'])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // إنشاء طبقات QGIS
  useEffect(() => {
    const housesLayer = createHousesQGISLayer(houses)
    const streetsLayer = createStreetsQGISLayer()
    const blocksLayer = createBlocksQGISLayer()
    
    setQGISLayers([blocksLayer, streetsLayer, housesLayer])
  }, [houses])

  // تحويل بيانات المنازل إلى معلومات مفصلة باستخدام نظام GIS العماني الرسمي
  const houseInfos: HouseInfo[] = houses.slice(0, 100).map((house, index) => {
    // ترتيب المنازل في شبكة مثل الصورة المرجعية
    const row = Math.floor(index / 8) // 8 منازل في كل صف
    const col = index % 8
    const blockSpacing = 120 // المسافة بين الكتل
    const houseSpacing = 45 // المسافة بين المنازل
    
    const x = 150 + col * houseSpacing + Math.floor(row / 3) * blockSpacing
    const y = 150 + row * houseSpacing
    
    // توليد عنوان GIS العماني الرسمي
    const omanGISAddress = generateOmanGISAddress(x, y, index)
    
    return {
      id: house.id,
      houseNo: parseInt(omanGISAddress.houseNumber),
      plotNo: parseInt(omanGISAddress.plotNumber),
      ownerName: generateOwnerName(parseInt(omanGISAddress.houseNumber)),
      ownerAvatar: generateAvatarFromHouse(parseInt(omanGISAddress.houseNumber)),
      civilNumber: generateCivilNumberFromHouse(parseInt(omanGISAddress.houseNumber)),
      area: omanGISAddress.sectorName,
      x,
      y,
      width: 35,
      height: 35,
      omanGISAddress
    }
  })

  // توليد اسم صاحب البيت
  function generateOwnerName(houseNo: number): string {
    const names = [
      'أحمد بن محمد العماني', 'فاطمة بنت علي السعيدي', 'محمد بن سالم الحارثي',
      'عائشة بنت عبدالله النعماني', 'خالد بن راشد الشامسي', 'مريم بنت سعد الكندي',
      'علي بن حسن البوسعيدي', 'زينب بنت عمر العبري', 'سالم بن أحمد الغافري',
      'رقية بنت يوسف المنجري', 'راشد بن عبدالرحمن الهنائي', 'أسماء بنت إبراهيم المزروعي'
    ]
    return names[houseNo % names.length]
  }

  // توليد صورة رمزية من رقم البيت
  function generateAvatarFromHouse(houseNo: number): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F']
    const color = colors[houseNo % colors.length]
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="20" fill="${color}"/>
        <text x="20" y="26" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="bold">${houseNo}</text>
      </svg>
    `)}`
  }

  // توليد رقم مدني من رقم البيت
  function generateCivilNumberFromHouse(houseNo: number): string {
    const year = 1980 + (houseNo % 30)
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')
    const serial = String(houseNo * 100 + Math.floor(Math.random() * 100)).padStart(5, '0')
    return `${year}${month}${day}-${serial}`
  }

  // رسم الخريطة
  useEffect(() => {
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
        canvas.width = window.innerWidth - 240 // طرح عرض الشريط الجانبي
        canvas.height = window.innerHeight - 200 // طرح مساحة الهيدر والبحث
      }

      // مسح الكانفاس
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // حفظ حالة الكانفاس
      ctx.save()

      // تطبيق التحويلات (تكبير ونقل)
      ctx.translate(panX, panY)
      ctx.scale(zoom, zoom)

      // رسم الشبكة
      drawGrid(ctx, canvas.width, canvas.height)

      // رسم طبقات QGIS
      drawQGISLayers(ctx, canvas.width, canvas.height)

      // رسالة تشخيصية
      ctx.fillStyle = '#000000'
      ctx.font = '16px Arial'
      ctx.fillText(`المنازل: ${houseInfos.length}`, 10, 30)

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
  }, [zoom, panX, panY, houseInfos, selectedHouse])

  // رسم الشبكة
  function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.strokeStyle = '#E5E7EB'
    ctx.lineWidth = 1 / zoom
    ctx.setLineDash([])

    const gridSize = 50
    const startX = Math.floor(-panX / zoom / gridSize) * gridSize
    const startY = Math.floor(-panY / zoom / gridSize) * gridSize

    for (let x = startX; x < width / zoom; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, -panY / zoom)
      ctx.lineTo(x, height / zoom)
      ctx.stroke()
    }

    for (let y = startY; y < height / zoom; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(-panX / zoom, y)
      ctx.lineTo(width / zoom, y)
      ctx.stroke()
    }
  }

  // رسم طبقات QGIS
  function drawQGISLayers(ctx: CanvasRenderingContext2D, width: number, height: number) {
    qgisLayers
      .filter(layer => activeLayers.includes(layer.id))
      .sort((a, b) => a.order - b.order)
      .forEach(layer => {
        drawQGISLayer(ctx, layer, width, height)
      })
  }

  // رسم طبقة QGIS واحدة
  function drawQGISLayer(ctx: CanvasRenderingContext2D, layer: QGISLayer, width: number, height: number) {
    if (!layer.visible) return

    ctx.globalAlpha = layer.opacity

    layer.features.forEach(feature => {
      drawQGISFeature(ctx, feature, layer)
    })

    ctx.globalAlpha = 1.0
  }

  // رسم عنصر QGIS
  function drawQGISFeature(ctx: CanvasRenderingContext2D, feature: any, layer: QGISLayer) {
    const style = layer.style

    // تطبيق النمط
    ctx.fillStyle = style.color
    ctx.strokeStyle = style.strokeColor || style.color
    ctx.lineWidth = style.strokeWidth || 1

    // رسم حسب نوع الهندسة
    if (layer.geometry === 'Point') {
      drawQGISPoint(ctx, feature, style)
    } else if (layer.geometry === 'LineString') {
      drawQGISLineString(ctx, feature, style)
    } else if (layer.geometry === 'Polygon') {
      drawQGISPolygon(ctx, feature, style)
    }

    // رسم التسميات
    if (style.label?.enabled) {
      drawQGISLabel(ctx, feature, style.label)
    }
  }

  // رسم نقطة QGIS
  function drawQGISPoint(ctx: CanvasRenderingContext2D, feature: any, style: any) {
    const [x, y] = feature.geometry.coordinates
    const screenX = (x - 58.5900) * 10000 + 100
    const screenY = (23.6200 - y) * 10000 + 100

    // دائرة
    ctx.beginPath()
    ctx.arc(screenX, screenY, style.size / 2, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
  }

  // رسم خط QGIS
  function drawQGISLineString(ctx: CanvasRenderingContext2D, feature: any, style: any) {
    const coordinates = feature.geometry.coordinates
    ctx.beginPath()
    
    coordinates.forEach((coord: number[], index: number) => {
      const x = (coord[0] - 58.5900) * 10000 + 100
      const y = (23.6200 - coord[1]) * 10000 + 100
      
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    
    ctx.stroke()
  }

  // رسم مضلع QGIS
  function drawQGISPolygon(ctx: CanvasRenderingContext2D, feature: any, style: any) {
    const coordinates = feature.geometry.coordinates[0]
    ctx.beginPath()
    
    coordinates.forEach((coord: number[], index: number) => {
      const x = (coord[0] - 58.5900) * 10000 + 100
      const y = (23.6200 - coord[1]) * 10000 + 100
      
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

  // رسم تسمية QGIS
  function drawQGISLabel(ctx: CanvasRenderingContext2D, feature: any, label: any) {
    const value = feature.properties[label.field]
    if (!value) return

    const [x, y] = feature.geometry.coordinates
    const screenX = (x - 58.5900) * 10000 + 100 + label.offset.x
    const screenY = (23.6200 - y) * 10000 + 100 + label.offset.y

    ctx.fillStyle = label.font.color
    ctx.font = `${label.font.bold ? 'bold' : 'normal'} ${label.font.size}px ${label.font.family}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(value.toString(), screenX, screenY)
  }

  // رسم الكتل والأحياء حسب النظام العماني الرسمي
  function drawBlocks(ctx: CanvasRenderingContext2D) {
    OMAN_WILAYATS.forEach(wilayat => {
      wilayat.sectors.forEach(sector => {
        sector.blocks.forEach((block, index) => {
          // لون الكتلة حسب النظام العماني
          const colors = ['#FEF3C7', '#DCFCE7', '#DBEAFE', '#F3E8FF']
          ctx.fillStyle = colors[index % colors.length]
          
          // رسم الكتلة
          ctx.fillRect(block.startX, block.startY, block.endX - block.startX, block.endY - block.startY)
          
          // حدود الكتلة
          ctx.strokeStyle = '#9CA3AF'
          ctx.lineWidth = 2
          ctx.strokeRect(block.startX, block.startY, block.endX - block.startX, block.endY - block.startY)
          
          // اسم الكتلة
          ctx.fillStyle = '#374151'
          ctx.font = 'bold 14px Arial'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(block.name, (block.startX + block.endX) / 2, (block.startY + block.endY) / 2)
          
          // كود الكتلة العماني
          ctx.fillStyle = '#6B7280'
          ctx.font = '12px Arial'
          ctx.fillText(`كود: ${block.code}`, (block.startX + block.endX) / 2, (block.startY + block.endY) / 2 + 20)
        })
      })
    })
  }

  // رسم الشوارع الرئيسية - مثل الصورة المرجعية
  function drawMainStreets(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // الشوارع الرئيسية - أزرق مثل الصورة المرجعية
    ctx.strokeStyle = '#3B82F6'
    ctx.lineWidth = 6
    ctx.setLineDash([])

    // شارع سلطان قابوس (أفقي)
    ctx.beginPath()
    ctx.moveTo(0, 300)
    ctx.lineTo(width / zoom, 300)
    ctx.stroke()

    // شارع الإنشراح (عمودي)
    ctx.beginPath()
    ctx.moveTo(500, 0)
    ctx.lineTo(500, height / zoom)
    ctx.stroke()

    // شارع البشائر (أفقي)
    ctx.beginPath()
    ctx.moveTo(0, 600)
    ctx.lineTo(width / zoom, 600)
    ctx.stroke()

    // شوارع فرعية - رمادي فاتح
    ctx.strokeStyle = '#E5E7EB'
    ctx.lineWidth = 2

    // شوارع فرعية أفقية
    for (let y = 200; y < height / zoom; y += 100) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width / zoom, y)
      ctx.stroke()
    }

    // شوارع فرعية عمودية
    for (let x = 200; x < width / zoom; x += 150) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height / zoom)
      ctx.stroke()
    }
  }

  // رسم أسماء الشوارع
  function drawStreetNames(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#1F2937'
    ctx.font = 'bold 12px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // اسم شارع سلطان قابوس
    ctx.fillText('شارع سلطان قابوس', 400, 280)
    ctx.fillText('Sultan Qaboos St', 400, 320)

    // اسم شارع الإنشراح
    ctx.save()
    ctx.translate(480, 400)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('شارع الإنشراح', 0, 0)
    ctx.restore()

    // اسم شارع البشائر
    ctx.fillText('شارع البشائر', 400, 580)
    ctx.fillText('Al Bashair St', 400, 620)
  }

  // رسم منزل
  function drawHouse(ctx: CanvasRenderingContext2D, house: HouseInfo, isSelected: boolean) {
    const x = house.x
    const y = house.y
    const w = house.width
    const h = house.height

    // لون المنزل - مثل الصورة المرجعية
    if (isSelected) {
      ctx.fillStyle = '#3B82F6'
    } else if (hoveredHouse?.id === house.id) {
      ctx.fillStyle = '#60A5FA'
    } else {
      ctx.fillStyle = '#F8F9FA' // لون فاتح مثل الصورة المرجعية
    }

    // رسم المنزل
    ctx.fillRect(x, y, w, h)
    
    // حدود المنزل
    ctx.strokeStyle = isSelected ? '#1D4ED8' : '#D1D5DB'
    ctx.lineWidth = 1
    ctx.strokeRect(x, y, w, h)

    // رقم المنزل - مثل الصورة المرجعية
    ctx.fillStyle = isSelected ? 'white' : '#1F2937'
    ctx.font = 'bold 10px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(house.houseNo.toString(), x + w/2, y + h/2)
  }

  // معالجة النقر
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const mouseX = (e.clientX - rect.left - panX) / zoom
    const mouseY = (e.clientY - rect.top - panY) / zoom

    // البحث عن منزل في طبقات QGIS
    const clickedFeature = findQGISFeatureUnderMouse(mouseX, mouseY)
    
    if (clickedFeature && clickedFeature.layer.id === 'houses_layer') {
      const house = houses.find(h => h.id === clickedFeature.id.replace('house_', ''))
      if (house) {
        onHouseSelect(house)
      }
    } else {
      // بدء السحب
      setIsDragging(true)
      setDragStart({ x: e.clientX - panX, y: e.clientY - panY })
    }
  }

  // البحث عن عنصر QGIS تحت الماوس
  function findQGISFeatureUnderMouse(mouseX: number, mouseY: number) {
    for (const layer of qgisLayers) {
      if (!activeLayers.includes(layer.id)) continue

      for (const feature of layer.features) {
        if (layer.geometry === 'Point') {
          const [x, y] = feature.geometry.coordinates
          const screenX = (x - 58.5900) * 10000 + 100
          const screenY = (23.6200 - y) * 10000 + 100
          
          const distance = Math.sqrt((mouseX - screenX) ** 2 + (mouseY - screenY) ** 2)
          if (distance < 15) {
            return { ...feature, layer }
          }
        }
      }
    }
    return null
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanX(e.clientX - dragStart.x)
      setPanY(e.clientY - dragStart.y)
    } else {
      // فحص ما إذا كان الماوس فوق منزل
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const mouseX = (e.clientX - rect.left - panX) / zoom
      const mouseY = (e.clientY - rect.top - panY) / zoom

      const hoveredFeature = findQGISFeatureUnderMouse(mouseX, mouseY)
      
      if (hoveredFeature && hoveredFeature.layer.id === 'houses_layer') {
        // تحويل إلى HouseInfo للتوافق مع الكود الموجود
        const house = houses.find(h => h.id === hoveredFeature.id.replace('house_', ''))
        if (house) {
          const houseInfo = houseInfos.find(hi => hi.id === house.id)
          setHoveredHouse(houseInfo || null)
        }
      } else {
        setHoveredHouse(null)
      }
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) {
      // فحص النقر على منزل
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const mouseX = (e.clientX - rect.left - panX) / zoom
      const mouseY = (e.clientY - rect.top - panY) / zoom

      const clickedHouse = houseInfos.find(house => 
        mouseX >= house.x && mouseX <= house.x + house.width &&
        mouseY >= house.y && mouseY <= house.y + house.height
      )

      if (clickedHouse) {
        const originalHouse = houses.find(h => h.id === clickedHouse.id)
        if (originalHouse) {
          onHouseSelect(originalHouse)
        }
      }
    }
    setIsDragging(false)
  }

  // معالجة عجلة الماوس للتكبير
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(prev => Math.max(0.5, Math.min(3, prev * delta)))
  }

  return (
    <div className="relative w-full h-full bg-white">
      {/* معلومات المنزل المحدد */}
      {hoveredHouse && (
        <div 
          className="absolute bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-10 pointer-events-none max-w-xs"
          style={{
            left: hoveredHouse.x * zoom + panX + 50,
            top: hoveredHouse.y * zoom + panY - 10
          }}
        >
          <div className="text-sm">
            <div className="font-semibold text-blue-600">المنزل رقم {hoveredHouse.houseNo}</div>
            <div className="text-gray-600">القطعة {hoveredHouse.plotNo}</div>
            <div className="text-gray-600">القطاع {hoveredHouse.omanGISAddress.sectorName}</div>
            <div className="text-gray-600">{hoveredHouse.omanGISAddress.streetName}</div>
            <div className="text-xs text-gray-500 mt-1">
              <div>كود GIS العماني: {hoveredHouse.omanGISAddress.omanGISCode}</div>
              <div>الكتلة: {hoveredHouse.omanGISAddress.blockNumber}</div>
              <div>الرمز البريدي: {hoveredHouse.omanGISAddress.postalCode}</div>
            </div>
            <div className="text-gray-600 text-xs mt-1">{hoveredHouse.ownerName}</div>
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

      {/* أزرار التحكم */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
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
        <button
          onClick={() => {
            setZoom(1)
            setPanX(0)
            setPanY(0)
          }}
          className="bg-white border border-gray-300 rounded-lg p-2 shadow-lg hover:bg-gray-50 text-xs"
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

      {/* لوحة تحكم QGIS */}
      <div className="absolute top-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-xs">
        <h3 className="font-semibold text-gray-800 mb-3">QGIS Layers</h3>
        
        {/* قائمة الطبقات */}
        <div className="space-y-2 mb-4">
          {qgisLayers.map(layer => (
            <div key={layer.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={activeLayers.includes(layer.id)}
                onChange={() => {
                  if (activeLayers.includes(layer.id)) {
                    setActiveLayers(prev => prev.filter(id => id !== layer.id))
                  } else {
                    setActiveLayers(prev => [...prev, layer.id])
                  }
                }}
                className="rounded"
              />
              <span className="text-sm text-gray-700">{layer.name}</span>
              <span className="text-xs text-gray-500">({layer.features.length})</span>
            </div>
          ))}
        </div>

        {/* إحصائيات */}
        <div className="text-xs text-gray-600 mb-4">
          <div>الطبقات: {qgisLayers.length}</div>
          <div>العناصر: {qgisLayers.reduce((sum, layer) => sum + layer.features.length, 0)}</div>
          <div>النقاط: {qgisLayers.filter(l => l.geometry === 'Point').reduce((sum, layer) => sum + layer.features.length, 0)}</div>
          <div>الخطوط: {qgisLayers.filter(l => l.geometry === 'LineString').reduce((sum, layer) => sum + layer.features.length, 0)}</div>
          <div>المضلعات: {qgisLayers.filter(l => l.geometry === 'Polygon').reduce((sum, layer) => sum + layer.features.length, 0)}</div>
        </div>
      </div>

      {/* معلومات GIS العماني */}
      <div className="absolute bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-2 shadow-lg">
        <div className="text-xs text-gray-600">
          <div className="font-semibold">نظام GIS العماني الرسمي</div>
          <div>المنازل: {houseInfos.length}</div>
          <div>الكتل: {OMAN_WILAYATS[0].sectors[0].blocks.length}</div>
          <div>القطاع: {OMAN_WILAYATS[0].sectors[0].name}</div>
          <div>الولاية: {OMAN_WILAYATS[0].name}</div>
        </div>
      </div>
    </div>
  )
}
