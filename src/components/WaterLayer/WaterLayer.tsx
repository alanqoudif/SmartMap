import { useEffect, useRef } from 'react'
import { WaterFeature } from '../../types'

interface WaterLayerProps {
  waterFeatures: WaterFeature[]
  mapInstance: any
  isVisible: boolean
}

export default function WaterLayer({ waterFeatures, mapInstance, isVisible }: WaterLayerProps) {
  const waterLayersRef = useRef<any[]>([])

  useEffect(() => {
    if (!mapInstance || !window.google) return

    // مسح الطبقات السابقة
    waterLayersRef.current.forEach(layer => {
      layer.setMap(null)
    })
    waterLayersRef.current = []

    if (!isVisible) return

    // إضافة طبقات الماء
    waterFeatures.forEach(waterFeature => {
      const coordinates = waterFeature.coordinates.map(coord => ({
        lat: coord[0],
        lng: coord[1]
      }))

      let waterLayer: any

      switch (waterFeature.type) {
        case 'sea':
          waterLayer = new window.google.maps.Polygon({
            paths: coordinates,
            fillColor: '#4A90E2',
            fillOpacity: 0.6,
            strokeColor: '#2E5BBA',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            map: mapInstance
          })
          break

        case 'lake':
          waterLayer = new window.google.maps.Polygon({
            paths: coordinates,
            fillColor: '#5BA3F5',
            fillOpacity: 0.7,
            strokeColor: '#3A7BC8',
            strokeOpacity: 0.9,
            strokeWeight: 2,
            map: mapInstance
          })
          break

        case 'river':
          waterLayer = new window.google.maps.Polyline({
            path: coordinates,
            strokeColor: '#4A90E2',
            strokeOpacity: 0.8,
            strokeWeight: 4,
            map: mapInstance
          })
          break

        case 'pond':
          waterLayer = new window.google.maps.Polygon({
            paths: coordinates,
            fillColor: '#6BB6FF',
            fillOpacity: 0.8,
            strokeColor: '#4A90E2',
            strokeOpacity: 1,
            strokeWeight: 2,
            map: mapInstance
          })
          break

        case 'fountain':
          waterLayer = new window.google.maps.Polygon({
            paths: coordinates,
            fillColor: '#87CEEB',
            fillOpacity: 0.9,
            strokeColor: '#4682B4',
            strokeOpacity: 1,
            strokeWeight: 2,
            map: mapInstance
          })
          break

        default:
          return
      }

      // إضافة نافذة معلومات للماء
      if (waterFeature.lat && waterFeature.lng) {
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; font-family: Arial, sans-serif; direction: rtl; max-width: 250px;">
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
          `
        })

        // إضافة مستمع للنقر
        waterLayer.addListener('click', () => {
          infoWindow.setPosition({ lat: waterFeature.lat!, lng: waterFeature.lng! })
          infoWindow.open(mapInstance)
        })
      }

      waterLayersRef.current.push(waterLayer)
    })

    return () => {
      waterLayersRef.current.forEach(layer => {
        layer.setMap(null)
      })
      waterLayersRef.current = []
    }
  }, [waterFeatures, mapInstance, isVisible])

  return null
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
