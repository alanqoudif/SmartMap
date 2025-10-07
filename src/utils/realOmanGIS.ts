// نظام GIS العماني الحقيقي - يستخدم بيانات حقيقية من OpenStreetMap
// متوافق مع البيانات الفعلية لسلطنة عُمان

export interface RealBuilding {
  id: string
  type: 'residential' | 'commercial' | 'industrial' | 'government' | 'educational' | 'health' | 'religious' | 'other'
  name?: string
  address?: string
  coordinates: {
    lat: number
    lng: number
  }
  area?: number
  floors?: number
  building_material?: string
  roof_material?: string
  construction_year?: number
  amenity?: string
  shop?: string
  office?: string
  tourism?: string
  leisure?: string
  sport?: string
  healthcare?: string
  education?: string
  religion?: string
  government?: string
  military?: string
  industrial?: string
  residential?: string
  commercial?: string
  tags: Record<string, string>
  source: 'OpenStreetMap'
  last_updated: string
}

export interface RealParcel {
  id: string
  type: 'residential' | 'commercial' | 'industrial' | 'agricultural' | 'government' | 'recreational' | 'educational' | 'health' | 'religious' | 'other'
  name?: string
  coordinates: {
    lat: number
    lng: number
  }
  area: number
  landuse?: string
  amenity?: string
  leisure?: string
  natural?: string
  waterway?: string
  highway?: string
  railway?: string
  aeroway?: string
  tags: Record<string, string>
  source: 'OpenStreetMap'
  last_updated: string
}

// حدود سلطنة عُمان الحقيقية
export const OMAN_BOUNDS = {
  north: 26.5,
  south: 16.0,
  east: 60.0,
  west: 52.0
}

// محافظات سلطنة عُمان مع الإحداثيات الحقيقية
export const OMAN_GOVERNORATES_REAL = {
  MUSCAT: {
    name: 'محافظة مسقط',
    nameEn: 'Muscat Governorate',
    center: { lat: 23.6141, lng: 58.5922 },
    bounds: {
      north: 23.8, south: 23.2, east: 59.0, west: 58.0
    },
    wilayats: ['مسقط', 'مطرح', 'بوشر', 'السيب', 'العامرات', 'قريات']
  },
  DHAHIRA: {
    name: 'محافظة الظاهرة',
    nameEn: 'Ad Dhahirah Governorate',
    center: { lat: 23.0, lng: 56.5 },
    bounds: {
      north: 24.0, south: 22.0, east: 57.5, west: 55.5
    },
    wilayats: ['عبري', 'ينقل', 'ضنك']
  },
  BURAIMI: {
    name: 'محافظة البريمي',
    nameEn: 'Al Buraimi Governorate',
    center: { lat: 24.25, lng: 55.8 },
    bounds: {
      north: 24.5, south: 24.0, east: 56.2, west: 55.4
    },
    wilayats: ['البريمي', 'محضة', 'السنينة']
  },
  NORTH_BATINAH: {
    name: 'محافظة شمال الباطنة',
    nameEn: 'North Al Batinah Governorate',
    center: { lat: 24.3, lng: 56.7 },
    bounds: {
      north: 24.8, south: 23.8, east: 57.5, west: 56.0
    },
    wilayats: ['صحار', 'شناص', 'لوى', 'صحم', 'الخابورة', 'السويق', 'شناص']
  },
  SOUTH_BATINAH: {
    name: 'محافظة جنوب الباطنة',
    nameEn: 'South Al Batinah Governorate',
    center: { lat: 23.4, lng: 57.4 },
    bounds: {
      north: 24.0, south: 22.8, east: 58.5, west: 56.5
    },
    wilayats: ['الرستاق', 'العوابي', 'نخل', 'وادي المعاول', 'بركاء', 'المصنعة']
  },
  NORTH_SHARQIYA: {
    name: 'محافظة شمال الشرقية',
    nameEn: 'North Ash Sharqiyah Governorate',
    center: { lat: 22.5, lng: 58.8 },
    bounds: {
      north: 23.5, south: 21.5, east: 59.5, west: 58.0
    },
    wilayats: ['إبراء', 'المضيبي', 'بدية', 'القابل', 'وادي بني خالد', 'دماء والطائيين']
  },
  SOUTH_SHARQIYA: {
    name: 'محافظة جنوب الشرقية',
    nameEn: 'South Ash Sharqiyah Governorate',
    center: { lat: 22.0, lng: 59.2 },
    bounds: {
      north: 23.0, south: 21.0, east: 60.0, west: 58.5
    },
    wilayats: ['صور', 'الكامل والوافي', 'جعلان بني بو علي', 'جعلان بني بو حسن', 'مصيرة']
  },
  AD_DAKHILIYA: {
    name: 'محافظة الداخلية',
    nameEn: 'Ad Dakhiliyah Governorate',
    center: { lat: 22.8, lng: 57.5 },
    bounds: {
      north: 23.5, south: 22.0, east: 58.5, west: 56.5
    },
    wilayats: ['نزوى', 'سمائل', 'بهلاء', 'منح', 'الحمراء', 'أدم', 'إزكي', 'بدبد']
  },
  WUSTA: {
    name: 'محافظة الوسطى',
    nameEn: 'Al Wusta Governorate',
    center: { lat: 20.0, lng: 57.0 },
    bounds: {
      north: 22.0, south: 18.0, east: 58.5, west: 55.5
    },
    wilayats: ['هيما', 'محوت', 'الدقم', 'الجازر']
  },
  DHOFAR: {
    name: 'محافظة ظفار',
    nameEn: 'Dhofar Governorate',
    center: { lat: 17.0, lng: 54.0 },
    bounds: {
      north: 19.0, south: 16.0, east: 55.5, west: 52.0
    },
    wilayats: ['صلالة', 'طاقة', 'مرباط', 'ضلكوت', 'مقشن', 'شليم وجزر الحلانيات', 'ثمريت', 'رخيوت', 'سدح']
  },
  MUSANDAM: {
    name: 'محافظة مسندم',
    nameEn: 'Musandam Governorate',
    center: { lat: 26.0, lng: 56.2 },
    bounds: {
      north: 26.5, south: 25.5, east: 56.5, west: 55.8
    },
    wilayats: ['خصب', 'دبا', 'بخا', 'مدحاء']
  }
}

// دالة لجلب المباني الحقيقية من OpenStreetMap
export async function fetchRealBuildingsFromOSM(
  bounds: { north: number; south: number; east: number; west: number },
  buildingType?: string
): Promise<RealBuilding[]> {
  try {
    const overpassQuery = `
      [out:json][timeout:25];
      (
        way["building"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
        relation["building"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
      );
      out geom;
    `

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(overpassQuery)}`
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return processOSMBuildings(data.elements)
  } catch (error) {
    console.error('Error fetching real buildings from OSM:', error)
    return []
  }
}

// دالة لجلب قطع الأراضي الحقيقية من OpenStreetMap
export async function fetchRealParcelsFromOSM(
  bounds: { north: number; south: number; east: number; west: number }
): Promise<RealParcel[]> {
  try {
    const overpassQuery = `
      [out:json][timeout:25];
      (
        way["landuse"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
        way["amenity"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
        way["leisure"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
        way["natural"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
      );
      out geom;
    `

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(overpassQuery)}`
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return processOSMParcels(data.elements)
  } catch (error) {
    console.error('Error fetching real parcels from OSM:', error)
    return []
  }
}

// معالجة بيانات المباني من OSM
function processOSMBuildings(elements: any[]): RealBuilding[] {
  return elements.map((element, index) => {
    const tags = element.tags || {}
    const coordinates = getElementCenter(element)
    
    return {
      id: `real_building_${element.id || index}`,
      type: determineBuildingType(tags),
      name: tags.name || tags['name:ar'] || undefined,
      address: tags['addr:full'] || tags['addr:street'] || undefined,
      coordinates,
      area: calculateArea(element),
      floors: parseInt(tags['building:levels']) || undefined,
      building_material: tags['building:material'],
      roof_material: tags['roof:material'],
      construction_year: parseInt(tags['start_date']) || undefined,
      amenity: tags.amenity,
      shop: tags.shop,
      office: tags.office,
      tourism: tags.tourism,
      leisure: tags.leisure,
      sport: tags.sport,
      healthcare: tags.healthcare,
      education: tags.education,
      religion: tags.religion,
      government: tags.government,
      military: tags.military,
      industrial: tags.industrial,
      residential: tags.residential,
      commercial: tags.commercial,
      tags,
      source: 'OpenStreetMap',
      last_updated: new Date().toISOString()
    }
  })
}

// معالجة بيانات قطع الأراضي من OSM
function processOSMParcels(elements: any[]): RealParcel[] {
  return elements.map((element, index) => {
    const tags = element.tags || {}
    const coordinates = getElementCenter(element)
    
    return {
      id: `real_parcel_${element.id || index}`,
      type: determineParcelType(tags),
      name: tags.name || tags['name:ar'] || undefined,
      coordinates,
      area: calculateArea(element),
      landuse: tags.landuse,
      amenity: tags.amenity,
      leisure: tags.leisure,
      natural: tags.natural,
      waterway: tags.waterway,
      highway: tags.highway,
      railway: tags.railway,
      aeroway: tags.aeroway,
      tags,
      source: 'OpenStreetMap',
      last_updated: new Date().toISOString()
    }
  })
}

// تحديد نوع المبنى
function determineBuildingType(tags: Record<string, string>): RealBuilding['type'] {
  if (tags.amenity === 'school' || tags.amenity === 'university' || tags.amenity === 'college') {
    return 'educational'
  }
  if (tags.amenity === 'hospital' || tags.amenity === 'clinic' || tags.amenity === 'pharmacy') {
    return 'health'
  }
  if (tags.amenity === 'place_of_worship' || tags.religion) {
    return 'religious'
  }
  if (tags.government || tags.amenity === 'townhall' || tags.amenity === 'courthouse') {
    return 'government'
  }
  if (tags.industrial || tags.amenity === 'industrial') {
    return 'industrial'
  }
  if (tags.commercial || tags.shop || tags.office) {
    return 'commercial'
  }
  if (tags.residential || tags['building:use'] === 'residential') {
    return 'residential'
  }
  return 'other'
}

// تحديد نوع قطعة الأرض
function determineParcelType(tags: Record<string, string>): RealParcel['type'] {
  if (tags.landuse === 'residential') {
    return 'residential'
  }
  if (tags.landuse === 'commercial' || tags.landuse === 'retail') {
    return 'commercial'
  }
  if (tags.landuse === 'industrial') {
    return 'industrial'
  }
  if (tags.landuse === 'agricultural' || tags.landuse === 'farmland') {
    return 'agricultural'
  }
  if (tags.landuse === 'recreation_ground' || tags.leisure) {
    return 'recreational'
  }
  if (tags.amenity === 'school' || tags.amenity === 'university') {
    return 'educational'
  }
  if (tags.amenity === 'hospital' || tags.amenity === 'clinic') {
    return 'health'
  }
  if (tags.amenity === 'place_of_worship') {
    return 'religious'
  }
  if (tags.government) {
    return 'government'
  }
  return 'other'
}

// حساب مركز العنصر
function getElementCenter(element: any): { lat: number; lng: number } {
  if (element.center) {
    return { lat: element.center.lat, lng: element.center.lon }
  }
  
  if (element.geometry && element.geometry.length > 0) {
    const coords = element.geometry
    let latSum = 0
    let lngSum = 0
    
    coords.forEach((coord: any) => {
      latSum += coord.lat
      lngSum += coord.lon
    })
    
    return {
      lat: latSum / coords.length,
      lng: lngSum / coords.length
    }
  }
  
  return { lat: 0, lng: 0 }
}

// حساب المساحة (تقريبي)
function calculateArea(element: any): number {
  if (element.geometry && element.geometry.length > 0) {
    // حساب المساحة باستخدام صيغة شوبيك
    const coords = element.geometry
    let area = 0
    
    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length
      area += coords[i].lat * coords[j].lon
      area -= coords[j].lat * coords[i].lon
    }
    
    area = Math.abs(area) / 2
    
    // تحويل من درجات إلى متر مربع (تقريبي)
    return area * 111000 * 111000
  }
  
  return 0
}

// دالة لجلب جميع المباني الحقيقية في سلطنة عُمان
export async function fetchAllRealBuildingsInOman(): Promise<RealBuilding[]> {
  const allBuildings: RealBuilding[] = []
  
  // جلب المباني من كل محافظة
  for (const [govKey, governorate] of Object.entries(OMAN_GOVERNORATES_REAL)) {
    try {
      console.log(`جاري جلب المباني من ${governorate.name}...`)
      const buildings = await fetchRealBuildingsFromOSM(governorate.bounds)
      allBuildings.push(...buildings)
      console.log(`تم جلب ${buildings.length} مبنى من ${governorate.name}`)
    } catch (error) {
      console.error(`خطأ في جلب المباني من ${governorate.name}:`, error)
    }
  }
  
  return allBuildings
}

// دالة لجلب جميع قطع الأراضي الحقيقية في سلطنة عُمان
export async function fetchAllRealParcelsInOman(): Promise<RealParcel[]> {
  const allParcels: RealParcel[] = []
  
  // جلب قطع الأراضي من كل محافظة
  for (const [govKey, governorate] of Object.entries(OMAN_GOVERNORATES_REAL)) {
    try {
      console.log(`جاري جلب قطع الأراضي من ${governorate.name}...`)
      const parcels = await fetchRealParcelsFromOSM(governorate.bounds)
      allParcels.push(...parcels)
      console.log(`تم جلب ${parcels.length} قطعة أرض من ${governorate.name}`)
    } catch (error) {
      console.error(`خطأ في جلب قطع الأراضي من ${governorate.name}:`, error)
    }
  }
  
  return allParcels
}

// دالة للبحث في المباني الحقيقية
export function searchRealBuildings(
  buildings: RealBuilding[],
  query: string,
  governorate?: string,
  wilayat?: string
): RealBuilding[] {
  return buildings.filter(building => {
    const matchesQuery = !query || 
      building.name?.toLowerCase().includes(query.toLowerCase()) ||
      building.address?.toLowerCase().includes(query.toLowerCase()) ||
      building.id.includes(query)
    
    const matchesGovernorate = !governorate || 
      building.tags['addr:state']?.includes(governorate) ||
      building.tags['addr:province']?.includes(governorate)
    
    const matchesWilayat = !wilayat || 
      building.tags['addr:city']?.includes(wilayat) ||
      building.tags['addr:district']?.includes(wilayat)
    
    return matchesQuery && matchesGovernorate && matchesWilayat
  })
}

// دالة للبحث في قطع الأراضي الحقيقية
export function searchRealParcels(
  parcels: RealParcel[],
  query: string,
  governorate?: string,
  wilayat?: string
): RealParcel[] {
  return parcels.filter(parcel => {
    const matchesQuery = !query || 
      parcel.name?.toLowerCase().includes(query.toLowerCase()) ||
      parcel.id.includes(query)
    
    const matchesGovernorate = !governorate || 
      parcel.tags['addr:state']?.includes(governorate) ||
      parcel.tags['addr:province']?.includes(governorate)
    
    const matchesWilayat = !wilayat || 
      parcel.tags['addr:city']?.includes(wilayat) ||
      parcel.tags['addr:district']?.includes(wilayat)
    
    return matchesQuery && matchesGovernorate && matchesWilayat
  })
}
