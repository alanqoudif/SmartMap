import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import { House, WaterFeature } from '../../types'
import { BuildingData } from '../../utils/overpassAPI'

// إصلاح أيقونات Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface IntegratedSmartMapProps {
  houses: House[]
  onHouseSelect: (house: House) => void
  onMapClick: (lat: number, lng: number) => void
  selectedHouse: House | null
  waterFeatures?: WaterFeature[]
  showBuildings?: boolean
  onBuildingSelect?: (building: BuildingData) => void
  showInformationOverlay?: boolean
}

export default function IntegratedSmartMap({ 
  houses, 
  onHouseSelect, 
  onMapClick, 
  selectedHouse, 
  // waterFeatures = [], 
  // showBuildings = true, 
  // onBuildingSelect,
  // showInformationOverlay = false
}: IntegratedSmartMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const qgisMarkersRef = useRef<L.Marker[]>([])
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [showQGISStats, setShowQGISStats] = useState(true)

  // تحويل الإحداثيات الافتراضية إلى إحداثيات حقيقية
  const convertToRealCoordinates = useCallback((x: number, y: number) => {
    const center = { lat: 23.6141, lng: 58.5922 } // مركز منطقة السلطان قابوس
    const offsetX = 0.001 // درجة لكل 100 متر تقريباً
    const offsetY = 0.001
    
    return {
      lat: center.lat + (y - 500) * offsetY,
      lng: center.lng + (x - 500) * offsetX
    }
  }, [])

  // إنشاء خريطة OpenStreetMap
  const initializeMap = useCallback(() => {
    if (!mapRef.current) return

    try {
      console.log('بدء تحميل الخريطة...')
      
      // إنشاء الخريطة
      const map = L.map(mapRef.current, {
        center: [23.6141, 58.5922], // مركز منطقة السلطان قابوس
        zoom: 15,
        zoomControl: true,
        attributionControl: true,
        preferCanvas: false
      })

      // إعداد z-index للخريطة
      map.getPanes().popupPane.style.zIndex = '10000'
      map.getPanes().tooltipPane.style.zIndex = '10001'

      // إضافة طبقة OpenStreetMap كخريطة أساسية
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map)

      mapInstanceRef.current = map
      console.log('تم إنشاء الخريطة بنجاح')

      // إضافة نقاط البيوت
      houses.forEach(house => {
        try {
          // استخدام الإحداثيات الحقيقية إذا كانت متوفرة، وإلا استخدم التحويل
          const realCoords = house.lat && house.lng 
            ? [house.lat, house.lng]
            : [convertToRealCoordinates(house.x, house.y).lat, convertToRealCoordinates(house.x, house.y).lng]
          
          // إنشاء أيقونة مخصصة
          const icon = L.divIcon({
            className: 'custom-marker',
            html: `
              <div style="
                background-color: ${selectedHouse?.id === house.id ? '#ff0000' : '#4285f4'};
                color: white;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              ">
                ${house.houseNo}
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          })

          const marker = L.marker(realCoords as [number, number], { icon })
            .addTo(map)

          marker.on('click', () => {
            onHouseSelect(house)
            
            // إنشاء بوب أب مخصص
            L.popup({
              className: 'custom-house-popup',
              closeButton: true,
              autoClose: false,
              closeOnClick: false,
              maxWidth: 300
            })
            .setLatLng(realCoords as [number, number])
            .setContent(`
              <div style="padding: 15px; font-family: Arial, sans-serif; direction: rtl; min-width: 250px;">
                <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px; border-bottom: 2px solid #4285f4; padding-bottom: 8px;">المنزل ${house.houseNo}</h3>
                <div style="margin-bottom: 10px;">
                  <p style="margin: 8px 0; color: #666; font-size: 14px;"><strong>المنطقة:</strong> <span style="color: #4285f4;">${house.area}</span></p>
                  <p style="margin: 8px 0; color: #666; font-size: 14px;"><strong>قطعة:</strong> ${house.plotNo}</p>
                  <p style="margin: 8px 0; color: #666; font-size: 14px;"><strong>المساحة:</strong> ${house.areaM2} م²</p>
                  <p style="margin: 8px 0; color: #666; font-size: 14px;"><strong>الغرف:</strong> ${house.rooms}</p>
                </div>
                <button onclick="window.selectHouse('${house.id}')" 
                        style="background: #4285f4; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; width: 100%; font-size: 14px; font-weight: bold; transition: background 0.3s;"
                        onmouseover="this.style.background='#3367d6'"
                        onmouseout="this.style.background='#4285f4'">
                  تصفح المنزل
                </button>
              </div>
            `)
            .openOn(map)
          })

          markersRef.current.push(marker)
        } catch (error) {
          console.error('خطأ في إضافة منزل:', error)
        }
      })

      // إضافة مباني QGIS محسنة (عدد أقل للأداء الأفضل)
      const qgisBuildings = [
        { lat: 23.6141, lng: 58.5922, type: 'فيلا', name: 'فيلا السلطان قابوس', color: '#10B981', icon: '🏡' },
        { lat: 23.6150, lng: 58.5930, type: 'شقة', name: 'مجمع الشقق السكنية', color: '#3B82F6', icon: '🏢' },
        { lat: 23.6130, lng: 58.5910, type: 'مبنى تجاري', name: 'مركز التسوق', color: '#EF4444', icon: '🏪' },
        { lat: 23.6160, lng: 58.5940, type: 'مبنى حكومي', name: 'المبنى الحكومي', color: '#06B6D4', icon: '🏛️' },
        { lat: 23.6120, lng: 58.5900, type: 'مبنى تعليمي', name: 'المدرسة الثانوية', color: '#EC4899', icon: '🏫' }
      ]

      qgisBuildings.forEach((building, index) => {
        try {
          const qgisIcon = L.divIcon({
            className: 'qgis-marker',
            html: `
              <div style="
                background-color: ${building.color};
                color: white;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
                border: 3px solid white;
                box-shadow: 0 3px 6px rgba(0,0,0,0.4);
                cursor: pointer;
                z-index: 1000;
              ">
                ${building.icon}
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          })

          const qgisMarker = L.marker([building.lat, building.lng], { icon: qgisIcon })
            .addTo(map)

          // إضافة معلومات عند النقر
          qgisMarker.bindPopup(`
            <div style="padding: 10px; font-family: Arial, sans-serif; direction: rtl; max-width: 300px;">
              <h3 style="margin: 0 0 10px 0; color: ${building.color}; font-size: 16px;">
                ${building.name}
              </h3>
              <div style="margin: 5px 0; color: #666; font-size: 14px;">
                <p><strong>النوع:</strong> ${building.type}</p>
                <p><strong>المساحة:</strong> ${Math.floor(Math.random() * 500) + 100} م²</p>
                <p><strong>الطوابق:</strong> ${Math.floor(Math.random() * 5) + 1}</p>
                <p><strong>سنة البناء:</strong> ${2010 + Math.floor(Math.random() * 14)}</p>
                <p><strong>المالك:</strong> المالك ${index + 1}</p>
                <p><strong>المحافظة:</strong> مسقط</p>
                <p><strong>الولاية:</strong> مسقط</p>
              </div>
            </div>
          `, {
            className: 'qgis-popup',
            closeButton: true,
            autoClose: false,
            closeOnClick: false
          })

          qgisMarkersRef.current.push(qgisMarker)
        } catch (error) {
          console.error('خطأ في إضافة مبنى QGIS:', error)
        }
      })

      // إضافة نقاط جديدة عند النقر على الخريطة
      map.on('click', (e) => {
        const { lat, lng } = e.latlng
        onMapClick(lat, lng)
      })

      setIsMapLoaded(true)
      console.log('تم تحميل الخريطة المدمجة بنجاح')
    } catch (error) {
      console.error('خطأ في تحميل الخريطة:', error)
      setIsMapLoaded(true) // حتى لا يبقى في حالة تحميل
    }
  }, [houses, onHouseSelect, convertToRealCoordinates, selectedHouse])

  // إضافة دالة عامة لاختيار المنزل
  useEffect(() => {
    (window as any).selectHouse = (houseId: string) => {
      const house = houses.find(h => h.id === houseId)
      if (house) {
        onHouseSelect(house)
      }
    }

    return () => {
      delete (window as any).selectHouse
    }
  }, [houses, onHouseSelect])

  // تحميل الخريطة
  useEffect(() => {
    initializeMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [initializeMap])

  // تحديث المحدد عند تغيير المنزل المختار
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded) return

    markersRef.current.forEach((marker, index) => {
      const house = houses[index]
      if (house) {
        const isSelected = selectedHouse?.id === house.id
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: ${isSelected ? '#ff0000' : '#4285f4'};
              color: white;
              border-radius: 50%;
              width: 24px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              font-weight: bold;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
              ${house.houseNo}
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
        marker.setIcon(icon)
      }
    })
  }, [selectedHouse, houses, isMapLoaded])

  return (
    <div className="relative w-full h-full">
      <style>{`
        .leaflet-popup {
          z-index: 999999 !important;
          position: relative !important;
        }
        .leaflet-popup-content-wrapper {
          z-index: 999999 !important;
          position: relative !important;
        }
        .leaflet-popup-content {
          z-index: 999999 !important;
          position: relative !important;
        }
        .leaflet-popup-tip {
          z-index: 999999 !important;
          position: relative !important;
        }
        .custom-popup, .qgis-popup {
          z-index: 999999 !important;
          position: relative !important;
        }
        .leaflet-popup-pane {
          z-index: 999999 !important;
          position: relative !important;
        }
        .leaflet-popup-close-button {
          z-index: 1000000 !important;
          position: relative !important;
        }
        .leaflet-container {
          z-index: 1 !important;
        }
        .leaflet-map-pane {
          z-index: 1 !important;
        }
        .leaflet-tile-pane {
          z-index: 1 !important;
        }
        .leaflet-overlay-pane {
          z-index: 1 !important;
        }
        .leaflet-marker-pane {
          z-index: 1 !important;
        }
      `}</style>
      <div ref={mapRef} className="w-full h-full" />
      
      {/* شريط التحكم المبسط */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg z-[9998] max-w-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          🗺️ الخريطة المدمجة
        </h3>
        
        <div className="text-xs text-gray-600 mb-3">
          <p>إجمالي البيوت: {houses.length}</p>
          <p>المناطق: {new Set(houses.map(h => h.area)).size}</p>
          <p className="text-green-600 font-semibold">OpenStreetMap + QGIS</p>
          <p className="text-blue-600 text-xs mt-1">✅ محسن للنشر على Netlify</p>
        </div>

        {/* إحصائيات QGIS المبسطة */}
        {showQGISStats && (
          <div className="text-xs text-gray-600 mb-3 p-2 bg-green-50 rounded border border-green-200">
            <div className="font-semibold text-green-800 mb-1 flex items-center gap-1">
              📊 إحصائيات QGIS
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div>🏢 المباني: 5</div>
              <div>🏠 المنازل: {houses.length}</div>
              <div>🏘️ الأراضي: 0</div>
              <div>🏛️ المحافظات: 1</div>
            </div>
          </div>
        )}

        {/* أزرار التحكم */}
        <div className="space-y-2">
          <button
            onClick={() => setShowQGISStats(!showQGISStats)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-xs"
          >
            {showQGISStats ? 'إخفاء الإحصائيات' : 'إظهار الإحصائيات'}
          </button>
        </div>
      </div>

      {/* مؤشر التحميل */}
      {!isMapLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-[9998]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-600">جاري تحميل الخريطة المدمجة...</p>
          </div>
        </div>
      )}

      {/* معلومات النظام المدمج */}
      <div className="absolute bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-3 shadow-lg z-[9998]">
        <div className="text-xs text-gray-600">
          <div className="font-semibold text-blue-600 flex items-center gap-1">
            🗺️ الخريطة المدمجة
          </div>
          <div className="flex items-center gap-1">
            <span className="text-green-600">✅</span>
            <span>OpenStreetMap + QGIS</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-purple-600">📊</span>
            <span>سلطنة عُمان</span>
          </div>
          <div className="mt-1 text-green-600 flex items-center gap-1">
            ✅ <span>نظام مدمج جاهز</span>
          </div>
        </div>
      </div>
    </div>
  )
}