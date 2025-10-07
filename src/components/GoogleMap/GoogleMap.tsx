import React, { useEffect, useRef, useState, useCallback } from 'react'
import { House } from '../../types'
import { GOOGLE_MAPS_CONFIG, mapUtils, ERROR_MESSAGES } from '../../config/googleMaps'

// إعلان Google Maps types
declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

interface GoogleMapProps {
  houses: House[]
  onHouseSelect: (house: House) => void
  onMapClick: (lat: number, lng: number) => void
  selectedHouse: House | null
}

export default function GoogleMap({ houses, onHouseSelect, onMapClick, selectedHouse }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  // تحويل الإحداثيات الافتراضية إلى إحداثيات حقيقية
  const convertToRealCoordinates = useCallback((x: number, y: number) => {
    return mapUtils.convertToRealCoordinates(x, y)
  }, [])

  // إنشاء خريطة Google
  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google) return

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, GOOGLE_MAPS_CONFIG.MAP_OPTIONS)
    
    // إضافة نقاط البيوت
    houses.forEach(house => {
      // استخدام الإحداثيات الحقيقية إذا كانت متوفرة، وإلا استخدم التحويل
      const realCoords = house.lat && house.lng 
        ? { lat: house.lat, lng: house.lng }
        : convertToRealCoordinates(house.x, house.y)
      
      const marker = new window.google.maps.Marker({
        position: realCoords,
        map: mapInstanceRef.current,
        title: `المنزل ${house.houseNo} - قطعة ${house.plotNo}`,
        label: {
          text: house.houseNo.toString(),
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: 'bold'
        },
        icon: selectedHouse?.id === house.id 
          ? GOOGLE_MAPS_CONFIG.MARKER_OPTIONS.selected
          : GOOGLE_MAPS_CONFIG.MARKER_OPTIONS.default
      })

      // إضافة نافذة معلومات
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; font-family: Arial, sans-serif; direction: rtl;">
            <h3 style="margin: 0 0 10px 0; color: #333;">المنزل ${house.houseNo}</h3>
            <p style="margin: 5px 0; color: #666;">قطعة: ${house.plotNo}</p>
            <p style="margin: 5px 0; color: #666;">المساحة: ${house.areaM2} م²</p>
            <p style="margin: 5px 0; color: #666;">الغرف: ${house.rooms}</p>
            <button onclick="window.selectHouse('${house.id}')" 
                    style="background: #4285f4; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 10px;">
              تصفح المنزل
            </button>
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker)
        onHouseSelect(house)
      })

      markersRef.current.push(marker)
    })

    // إضافة نقاط جديدة عند النقر على الخريطة
    mapInstanceRef.current.addListener('click', (event: any) => {
      const lat = event.latLng.lat()
      const lng = event.latLng.lng()
      onMapClick(lat, lng)
    })

    setIsMapLoaded(true)
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

  // تحميل Google Maps
  useEffect(() => {
    if (window.google) {
      initializeMap()
    } else {
      // تحقق من وجود Google Maps API
      const checkGoogleMaps = () => {
        if (window.google) {
          initializeMap()
        } else {
          console.warn('Google Maps API not loaded. Please check your API key configuration.')
        }
      }
      
      // محاولة التحميل بعد 2 ثانية
      setTimeout(checkGoogleMaps, 2000)
    }

    return () => {
      if (window.initMap === initializeMap) {
        delete window.initMap
      }
    }
  }, [initializeMap])

  // تحديث المحدد عند تغيير المنزل المختار
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded) return

    markersRef.current.forEach((marker, index) => {
      const house = houses[index]
      if (house) {
        marker.setIcon({
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: selectedHouse?.id === house.id ? '#ff0000' : '#4285f4',
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2
        })
      }
    })
  }, [selectedHouse, houses, isMapLoaded])

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* شريط التحكم */}
      <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">منطقة السلطان قابوس</h3>
        <div className="text-xs text-gray-600">
          <p>إجمالي البيوت: {houses.length}</p>
          <p>انقر على الخريطة لإضافة بيت جديد</p>
        </div>
      </div>

      {/* مؤشر التحميل أو رسالة الخطأ */}
      {!isMapLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center max-w-md mx-4">
            {!window.google ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="text-yellow-600 text-4xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  Google Maps غير متاح
                </h3>
                <p className="text-yellow-700 mb-4">
                  لإظهار خريطة Google، تحتاج إلى إعداد API Key صحيح.
                </p>
                <div className="text-sm text-yellow-600">
                  <p>1. احصل على API Key من Google Cloud Console</p>
                  <p>2. حدث index.html و src/config/googleMaps.ts</p>
                  <p>3. اتبع دليل GOOGLE_MAPS_SETUP.md</p>
                </div>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : (
              <div>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-gray-600">جاري تحميل الخريطة...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
