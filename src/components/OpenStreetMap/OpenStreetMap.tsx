import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import { House, WaterFeature } from '../../types'
import BuildingLayer from '../BuildingLayer/BuildingLayer'
import { BuildingData } from '../../utils/overpassAPI'

// إصلاح أيقونات Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface OpenStreetMapProps {
  houses: House[]
  onHouseSelect: (house: House) => void
  onMapClick: (lat: number, lng: number) => void
  selectedHouse: House | null
  waterFeatures?: WaterFeature[]
  showBuildings?: boolean
  onBuildingSelect?: (building: BuildingData) => void
}

export default function OpenStreetMap({ 
  houses, 
  onHouseSelect, 
  onMapClick, 
  selectedHouse, 
  waterFeatures = [], 
  showBuildings = true, 
  onBuildingSelect 
}: OpenStreetMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const waterLayersRef = useRef<L.Layer[]>([])
  const [isMapLoaded, setIsMapLoaded] = useState(false)

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

    // إضافة طبقة OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map)

    mapInstanceRef.current = map

    // إضافة نقاط البيوت
    houses.forEach(house => {
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
    })

    // إضافة نقاط جديدة عند النقر على الخريطة
    map.on('click', (e) => {
      const { lat, lng } = e.latlng
      onMapClick(lat, lng)
    })

    setIsMapLoaded(true)
  }, [houses, onHouseSelect, convertToRealCoordinates, selectedHouse])

  // إضافة المعالم المائية
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded) return

    // مسح الطبقات السابقة
    waterLayersRef.current.forEach(layer => {
      mapInstanceRef.current?.removeLayer(layer)
    })
    waterLayersRef.current = []


    // إضافة طبقات الماء
    waterFeatures.forEach(waterFeature => {
      const coordinates = waterFeature.coordinates.map(coord => [coord[0], coord[1]] as [number, number])

      let waterLayer: L.Layer

      switch (waterFeature.type) {
        case 'sea':
          waterLayer = L.polygon(coordinates, {
            color: '#2E5BBA',
            weight: 2,
            opacity: 0.8,
            fillColor: '#4A90E2',
            fillOpacity: 0.6
          })
          break

        case 'lake':
          waterLayer = L.polygon(coordinates, {
            color: '#3A7BC8',
            weight: 2,
            opacity: 0.9,
            fillColor: '#5BA3F5',
            fillOpacity: 0.7
          })
          break

        case 'river':
          waterLayer = L.polyline(coordinates, {
            color: '#4A90E2',
            weight: 4,
            opacity: 0.8
          })
          break

        case 'pond':
          waterLayer = L.polygon(coordinates, {
            color: '#4A90E2',
            weight: 2,
            opacity: 1,
            fillColor: '#6BB6FF',
            fillOpacity: 0.8
          })
          break

        case 'fountain':
          waterLayer = L.polygon(coordinates, {
            color: '#4682B4',
            weight: 2,
            opacity: 1,
            fillColor: '#87CEEB',
            fillOpacity: 0.9
          })
          break

        default:
          return
      }

      // إضافة نافذة معلومات للماء
      if (waterFeature.lat && waterFeature.lng) {
        waterLayer.bindPopup(`
          <div style="padding: 10px; font-family: Arial, sans-serif; direction: rtl; max-width: 250px; z-index: 9999; position: relative;">
            <h3 style="margin: 0 0 10px 0; color: #2E5BBA; font-size: 16px;">
              ${waterFeature.name}
            </h3>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">
              <strong>النوع:</strong> ${getWaterTypeName(waterFeature.type)}
            </p>
            ${waterFeature.area ? `
              <p style="margin: 5px 0; color: #666; font-size: 14px;">
                <strong>المساحة:</strong> ${waterFeature.area.toLocaleString()} م²
              </p>
            ` : ''}
            ${waterFeature.description ? `
              <p style="margin: 5px 0; color: #666; font-size: 14px;">
                ${waterFeature.description}
              </p>
            ` : ''}
          </div>
        `, {
          className: 'custom-popup',
          closeButton: true,
          autoClose: false,
          closeOnClick: false
        })
      }

      if (mapInstanceRef.current) {
        waterLayer.addTo(mapInstanceRef.current)
      }
      waterLayersRef.current.push(waterLayer)
    })

    return () => {
      waterLayersRef.current.forEach(layer => {
        mapInstanceRef.current?.removeLayer(layer)
      })
      waterLayersRef.current = []
    }
  }, [waterFeatures, isMapLoaded])

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
        .custom-popup {
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
      
      {/* طبقة المباني */}
      {isMapLoaded && mapInstanceRef.current && (
        <BuildingLayer 
          mapInstance={mapInstanceRef.current}
          isVisible={showBuildings}
          onBuildingSelect={onBuildingSelect}
        />
      )}
      
      {/* شريط التحكم */}
      <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg z-[9998]">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">مدينة مسقط</h3>
        <div className="text-xs text-gray-600">
          <p>إجمالي البيوت: {houses.length}</p>
          <p>المناطق: {new Set(houses.map(h => h.area)).size}</p>
          <p>المباني الحقيقية: {showBuildings ? 'مُحمّلة من OpenStreetMap' : 'مخفية'}</p>
          <p>انقر على الخريطة لإضافة بيت جديد</p>
          <p className="text-green-600 font-semibold">خريطة OpenStreetMap - مجانية</p>
        </div>
      </div>

      {/* مؤشر التحميل */}
      {!isMapLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-[9998]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-600">جاري تحميل الخريطة...</p>
          </div>
        </div>
      )}
    </div>
  )
}

// دالة للحصول على اسم نوع الماء بالعربية
function getWaterTypeName(type: string): string {
  const typeNames: Record<string, string> = {
    sea: 'بحر',
    lake: 'بحيرة',
    river: 'نهر/وادي',
    pond: 'بركة',
    fountain: 'نافورة'
  }
  return typeNames[type] || type
}
