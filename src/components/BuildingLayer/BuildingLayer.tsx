import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { BuildingData, fetchBuildingsFromOSM, calculateBuildingArea } from '../../utils/overpassAPI'

interface BuildingLayerProps {
  mapInstance: L.Map
  isVisible: boolean
  onBuildingSelect?: (building: BuildingData) => void
}

export default function BuildingLayer({ mapInstance, isVisible, onBuildingSelect }: BuildingLayerProps) {
  const buildingsRef = useRef<L.Layer[]>([])
  const [buildings, setBuildings] = useState<BuildingData[]>([])
  const [, setIsLoading] = useState(false)

  // جلب بيانات المباني من OpenStreetMap
  useEffect(() => {
    const loadBuildings = async () => {
      setIsLoading(true)
      try {
        const buildingData = await fetchBuildingsFromOSM()
        setBuildings(buildingData)
        console.log(`تم جلب ${buildingData.length} مبنى من OpenStreetMap`)
      } catch (error) {
        console.error('خطأ في جلب بيانات المباني:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isVisible) {
      loadBuildings()
    }
  }, [isVisible])

  // عرض المباني على الخريطة
  useEffect(() => {
    if (!mapInstance || !isVisible || buildings.length === 0) return

    // مسح المباني السابقة
    buildingsRef.current.forEach(layer => {
      mapInstance.removeLayer(layer)
    })
    buildingsRef.current = []

    // إضافة المباني الجديدة
    buildings.forEach(building => {
      try {
        const coordinates = building.geometry.coordinates[0].map(coord => [coord[1], coord[0]] as [number, number])
        
        // إنشاء مضلع للمبنى
        const buildingPolygon = L.polygon(coordinates, {
          color: '#4285f4',
          weight: 2,
          opacity: 0.8,
          fillColor: '#e3f2fd',
          fillOpacity: 0.6
        })

        // إضافة معلومات المبنى
        const area = calculateBuildingArea(building)
        
        const popupContent = `
          <div style="padding: 15px; font-family: Arial, sans-serif; direction: rtl; min-width: 250px;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px; border-bottom: 2px solid #4285f4; padding-bottom: 8px;">
              ${building.properties['addr:housenumber'] ? `المنزل ${building.properties['addr:housenumber']}` : 'مبنى'}
            </h3>
            <div style="margin-bottom: 10px;">
              ${building.properties['addr:street'] ? `
                <p style="margin: 8px 0; color: #666; font-size: 14px;"><strong>الشارع:</strong> ${building.properties['addr:street']}</p>
              ` : ''}
              ${building.properties.building ? `
                <p style="margin: 8px 0; color: #666; font-size: 14px;"><strong>النوع:</strong> ${getBuildingTypeName(building.properties.building)}</p>
              ` : ''}
              <p style="margin: 8px 0; color: #666; font-size: 14px;"><strong>المساحة:</strong> ${Math.round(area)} م²</p>
              ${building.properties.name ? `
                <p style="margin: 8px 0; color: #666; font-size: 14px;"><strong>الاسم:</strong> ${building.properties.name}</p>
              ` : ''}
              ${building.properties.amenity ? `
                <p style="margin: 8px 0; color: #666; font-size: 14px;"><strong>الخدمة:</strong> ${building.properties.amenity}</p>
              ` : ''}
            </div>
            <button onclick="window.selectBuilding('${building.id}')" 
                    style="background: #4285f4; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; width: 100%; font-size: 14px; font-weight: bold; transition: background 0.3s;"
                    onmouseover="this.style.background='#3367d6'"
                    onmouseout="this.style.background='#4285f4'">
              عرض تفاصيل المبنى
            </button>
          </div>
        `

        buildingPolygon.bindPopup(popupContent, {
          className: 'custom-building-popup',
          closeButton: true,
          autoClose: false,
          closeOnClick: false,
          maxWidth: 300
        })

        buildingPolygon.on('click', () => {
          if (onBuildingSelect) {
            onBuildingSelect(building)
          }
        })

        buildingPolygon.addTo(mapInstance)
        buildingsRef.current.push(buildingPolygon)
      } catch (error) {
        console.error('خطأ في إضافة المبنى:', building.id, error)
      }
    })

    return () => {
      buildingsRef.current.forEach(layer => {
        mapInstance.removeLayer(layer)
      })
      buildingsRef.current = []
    }
  }, [mapInstance, isVisible, buildings, onBuildingSelect])

  // إضافة دالة عامة لاختيار المبنى
  useEffect(() => {
    (window as any).selectBuilding = (buildingId: string) => {
      const building = buildings.find(b => b.id === buildingId)
      if (building && onBuildingSelect) {
        onBuildingSelect(building)
      }
    }

    return () => {
      delete (window as any).selectBuilding
    }
  }, [buildings, onBuildingSelect])

  return null
}

// دالة للحصول على اسم نوع المبنى بالعربية
function getBuildingTypeName(type: string): string {
  const typeNames: Record<string, string> = {
    'house': 'منزل',
    'residential': 'سكني',
    'apartments': 'شقق',
    'commercial': 'تجاري',
    'office': 'مكتب',
    'retail': 'تجاري',
    'industrial': 'صناعي',
    'warehouse': 'مستودع',
    'school': 'مدرسة',
    'hospital': 'مستشفى',
    'mosque': 'مسجد',
    'church': 'كنيسة',
    'hotel': 'فندق',
    'restaurant': 'مطعم',
    'shop': 'متجر',
    'garage': 'كراج',
    'shed': 'سقيفة',
    'barn': 'حظيرة',
    'stable': 'إسطبل',
    'greenhouse': 'بيت زجاجي',
    'yes': 'مبنى'
  }
  return typeNames[type] || type
}
