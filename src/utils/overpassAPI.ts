// Overpass API utility for fetching building data from OpenStreetMap

export interface BuildingData {
  id: string
  type: string
  geometry: {
    type: string
    coordinates: number[][][]
  }
  properties: {
    building?: string
    'addr:housenumber'?: string
    'addr:street'?: string
    'addr:city'?: string
    name?: string
    amenity?: string
    shop?: string
    office?: string
    residential?: string
  }
}

export interface OverpassResponse {
  type: string
  features: BuildingData[]
}

// إحداثيات منطقة موسعة تشمل مدينة السلطان قابوس والمناطق المحيطة
const MUSCAT_EXTENDED_BOUNDS = {
  south: 23.58,  // توسيع جنوباً
  north: 23.65,  // توسيع شمالاً
  west: 58.55,   // توسيع غرباً
  east: 58.62    // توسيع شرقاً
}

// استعلام Overpass API محسن لجلب جميع أنواع المباني والمرافق
const OVERPASS_QUERY = `
[out:json][timeout:60];
(
  way["building"](${MUSCAT_EXTENDED_BOUNDS.south},${MUSCAT_EXTENDED_BOUNDS.west},${MUSCAT_EXTENDED_BOUNDS.north},${MUSCAT_EXTENDED_BOUNDS.east});
  relation["building"](${MUSCAT_EXTENDED_BOUNDS.south},${MUSCAT_EXTENDED_BOUNDS.west},${MUSCAT_EXTENDED_BOUNDS.north},${MUSCAT_EXTENDED_BOUNDS.east});
  way["amenity"](${MUSCAT_EXTENDED_BOUNDS.south},${MUSCAT_EXTENDED_BOUNDS.west},${MUSCAT_EXTENDED_BOUNDS.north},${MUSCAT_EXTENDED_BOUNDS.east});
  way["shop"](${MUSCAT_EXTENDED_BOUNDS.south},${MUSCAT_EXTENDED_BOUNDS.west},${MUSCAT_EXTENDED_BOUNDS.north},${MUSCAT_EXTENDED_BOUNDS.east});
  way["office"](${MUSCAT_EXTENDED_BOUNDS.south},${MUSCAT_EXTENDED_BOUNDS.west},${MUSCAT_EXTENDED_BOUNDS.north},${MUSCAT_EXTENDED_BOUNDS.east});
  way["leisure"](${MUSCAT_EXTENDED_BOUNDS.south},${MUSCAT_EXTENDED_BOUNDS.west},${MUSCAT_EXTENDED_BOUNDS.north},${MUSCAT_EXTENDED_BOUNDS.east});
  way["tourism"](${MUSCAT_EXTENDED_BOUNDS.south},${MUSCAT_EXTENDED_BOUNDS.west},${MUSCAT_EXTENDED_BOUNDS.north},${MUSCAT_EXTENDED_BOUNDS.east});
  way["healthcare"](${MUSCAT_EXTENDED_BOUNDS.south},${MUSCAT_EXTENDED_BOUNDS.west},${MUSCAT_EXTENDED_BOUNDS.north},${MUSCAT_EXTENDED_BOUNDS.east});
  way["education"](${MUSCAT_EXTENDED_BOUNDS.south},${MUSCAT_EXTENDED_BOUNDS.west},${MUSCAT_EXTENDED_BOUNDS.north},${MUSCAT_EXTENDED_BOUNDS.east});
  way["religion"](${MUSCAT_EXTENDED_BOUNDS.south},${MUSCAT_EXTENDED_BOUNDS.west},${MUSCAT_EXTENDED_BOUNDS.north},${MUSCAT_EXTENDED_BOUNDS.east});
  way["government"](${MUSCAT_EXTENDED_BOUNDS.south},${MUSCAT_EXTENDED_BOUNDS.west},${MUSCAT_EXTENDED_BOUNDS.north},${MUSCAT_EXTENDED_BOUNDS.east});
);
out geom;
`

export async function fetchBuildingsFromOSM(): Promise<BuildingData[]> {
  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(OVERPASS_QUERY)}`
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return convertToGeoJSON(data)
  } catch (error) {
    console.error('Error fetching buildings from OSM:', error)
    return []
  }
}

// تحويل بيانات Overpass إلى GeoJSON
function convertToGeoJSON(overpassData: any): BuildingData[] {
  const features: BuildingData[] = []

  overpassData.elements?.forEach((element: any) => {
    if (element.type === 'way' && element.geometry) {
      const coordinates = element.geometry.map((point: any) => [point.lon, point.lat])
      
      // إغلاق المضلع إذا لم يكن مغلقاً
      if (coordinates.length > 2 && 
          (coordinates[0][0] !== coordinates[coordinates.length - 1][0] || 
           coordinates[0][1] !== coordinates[coordinates.length - 1][1])) {
        coordinates.push(coordinates[0])
      }

      const feature: BuildingData = {
        id: `building-${element.id}`,
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates]
        },
        properties: {
          building: element.tags?.building || 'yes',
          'addr:housenumber': element.tags?.['addr:housenumber'],
          'addr:street': element.tags?.['addr:street'],
          'addr:city': element.tags?.['addr:city'],
          name: element.tags?.name,
          amenity: element.tags?.amenity,
          shop: element.tags?.shop,
          office: element.tags?.office,
          residential: element.tags?.residential
        }
      }

      features.push(feature)
    }
  })

  return features
}

// استعلام مبسط لجلب المباني السكنية فقط
export async function fetchResidentialBuildings(): Promise<BuildingData[]> {
  const buildings = await fetchBuildingsFromOSM()
  return buildings.filter(building => 
    building.properties.building === 'house' || 
    building.properties.building === 'residential' ||
    building.properties.residential === 'yes' ||
    building.properties['addr:housenumber']
  )
}

// استعلام لجلب المباني التجارية
export async function fetchCommercialBuildings(): Promise<BuildingData[]> {
  const buildings = await fetchBuildingsFromOSM()
  return buildings.filter(building => 
    building.properties.shop ||
    building.properties.office ||
    building.properties.amenity ||
    building.properties.building === 'commercial'
  )
}

// دالة لترقيم المباني تلقائياً
export function assignHouseNumbers(buildings: BuildingData[]): BuildingData[] {
  return buildings.map((building, index) => ({
    ...building,
    properties: {
      ...building.properties,
      'addr:housenumber': building.properties['addr:housenumber'] || (index + 1).toString()
    }
  }))
}

// دالة لحساب مركز المبنى
export function getBuildingCenter(building: BuildingData): { lat: number; lng: number } {
  const coordinates = building.geometry.coordinates[0]
  let latSum = 0
  let lngSum = 0
  
  coordinates.forEach(coord => {
    lngSum += coord[0]
    latSum += coord[1]
  })
  
  return {
    lat: latSum / coordinates.length,
    lng: lngSum / coordinates.length
  }
}

// دالة لحساب مساحة المبنى (تقريبية)
export function calculateBuildingArea(building: BuildingData): number {
  const coordinates = building.geometry.coordinates[0]
  let area = 0
  
  for (let i = 0; i < coordinates.length - 1; i++) {
    const [lng1, lat1] = coordinates[i]
    const [lng2, lat2] = coordinates[i + 1]
    area += (lng2 - lng1) * (lat2 + lat1)
  }
  
  // تحويل إلى متر مربع (تقريبي)
  return Math.abs(area) * 111000 * 111000 // 1 درجة ≈ 111 كم
}
