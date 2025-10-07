// نظام QGIS (Quantum GIS) - نظام معلومات جغرافية مفتوح المصدر
// متوافق مع معايير GIS العالمية

export interface QGISLayer {
  id: string
  name: string
  type: 'vector' | 'raster' | 'point' | 'line' | 'polygon'
  geometry: 'Point' | 'LineString' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon'
  crs: string // Coordinate Reference System
  features: QGISFeature[]
  style: QGISStyle
  visible: boolean
  opacity: number
  order: number
}

export interface QGISFeature {
  id: string
  geometry: {
    type: string
    coordinates: number[] | number[][] | number[][][]
  }
  properties: Record<string, any>
  attributes: QGISAttribute[]
}

export interface QGISAttribute {
  name: string
  type: 'string' | 'integer' | 'double' | 'boolean' | 'date'
  value: any
  alias?: string
  description?: string
}

export interface QGISStyle {
  type: 'simple' | 'categorized' | 'graduated' | 'rule-based'
  symbol: QGISSymbol
  color: string
  size: number
  opacity: number
  strokeColor?: string
  strokeWidth?: number
  fillColor?: string
  label?: QGISLabel
}

export interface QGISSymbol {
  type: 'marker' | 'line' | 'fill'
  name: string
  color: string
  size: number
  angle?: number
  outline?: {
    color: string
    width: number
  }
}

export interface QGISLabel {
  enabled: boolean
  field: string
  font: {
    family: string
    size: number
    color: string
    bold?: boolean
    italic?: boolean
  }
  placement: 'point' | 'line' | 'around' | 'horizontal'
  offset: {
    x: number
    y: number
  }
}

export interface QGISProject {
  name: string
  version: string
  crs: string
  layers: QGISLayer[]
  extent: {
    xmin: number
    ymin: number
    xmax: number
    ymax: number
  }
  metadata: QGISMetadata
}

export interface QGISMetadata {
  title: string
  abstract: string
  keywords: string[]
  author: string
  created: string
  modified: string
  license: string
}

// نظام الإحداثيات المرجعية (CRS) - متوافق مع معايير السلطنة
export const QGIS_CRS = {
  WGS84: 'EPSG:4326', // World Geodetic System 1984
  UTM_ZONE_40N: 'EPSG:32640', // UTM Zone 40N (Oman)
  OMAN_NATIONAL: 'EPSG:32640', // Oman National Grid
  WEB_MERCATOR: 'EPSG:3857', // Web Mercator
  OMAN_OFFICIAL: 'EPSG:32640' // النظام الرسمي للسلطنة
}

// نظام GIS العماني الرسمي - بناءً على الخريطة الرسمية لوزارة البلديات
// المرجع: https://gis.mm.gov.om/GIS115/RMap/Default.aspx

// محافظات السلطنة مع الإحداثيات المركزية والحدود الحقيقية
export const OMAN_GOVERNORATES = {
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

// إنشاء طبقة شاملة لجميع المباني في السلطنة (مثل النظام الرسمي)
export function createOmanBuildingsQGISLayer(): QGISLayer {
  const features: QGISFeature[] = []
  
  // إضافة مباني من جميع المحافظات مع تغطية شاملة
  Object.entries(OMAN_GOVERNORATES).forEach(([govKey, governorate], govIndex) => {
    // توليد مباني لكل محافظة مع تغطية شاملة للمناطق
    const buildingsPerGovernorate = 200 + Math.floor(Math.random() * 300)
    
    for (let i = 0; i < buildingsPerGovernorate; i++) {
      const buildingNo = i + 1
      const plotNo = 100 + i
      const wilayat = governorate.wilayats[i % governorate.wilayats.length]
      
      // إحداثيات موزعة بشكل منتظم مع بعض العشوائية
      const gridSize = 0.01 // حجم الشبكة
      const gridX = Math.floor(i / Math.sqrt(buildingsPerGovernorate))
      const gridY = i % Math.floor(Math.sqrt(buildingsPerGovernorate))
      
      const lat = governorate.bounds.south + 
        (governorate.bounds.north - governorate.bounds.south) * 
        (gridX / Math.sqrt(buildingsPerGovernorate) + Math.random() * 0.1)
      const lng = governorate.bounds.west + 
        (governorate.bounds.east - governorate.bounds.west) * 
        (gridY / Math.sqrt(buildingsPerGovernorate) + Math.random() * 0.1)
      
      // تحديد نوع المبنى بناءً على الموقع
      const buildingType = getBuildingTypeByLocation(lat, lng, governorate)
      const landUse = getLandUseByLocation(lat, lng, governorate)
      
      features.push({
        id: `building_${govKey}_${buildingNo}`,
        geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        properties: {
          building_no: buildingNo,
          plot_no: plotNo,
          governorate: governorate.name,
          governorate_en: governorate.nameEn,
          wilayat: wilayat,
          area_m2: getBuildingArea(buildingType),
          floors: getBuildingFloors(buildingType),
          building_type: buildingType,
          land_use: landUse,
          construction_year: getConstructionYear(buildingType),
          occupancy_status: getOccupancyStatus(),
          owner_name: generateOwnerName(buildingNo),
          civil_number: generateCivilNumber(buildingNo),
          gis_code: generateOmanGISCode(govKey, wilayat, plotNo, buildingNo),
          building_condition: getBuildingCondition(),
          utilities: getUtilitiesStatus(),
          access_road: getAccessRoadStatus(),
          water_connection: getWaterConnectionStatus(),
          electricity_connection: getElectricityConnectionStatus(),
          sewage_connection: getSewageConnectionStatus()
        },
        attributes: [
          { name: 'building_no', type: 'integer', value: buildingNo, alias: 'رقم المبنى' },
          { name: 'plot_no', type: 'integer', value: plotNo, alias: 'رقم القطعة' },
          { name: 'governorate', type: 'string', value: governorate.name, alias: 'المحافظة' },
          { name: 'wilayat', type: 'string', value: wilayat, alias: 'الولاية' },
          { name: 'area_m2', type: 'double', value: getBuildingArea(buildingType), alias: 'المساحة (م²)' },
          { name: 'floors', type: 'integer', value: getBuildingFloors(buildingType), alias: 'عدد الطوابق' },
          { name: 'building_type', type: 'string', value: buildingType, alias: 'نوع المبنى' },
          { name: 'land_use', type: 'string', value: landUse, alias: 'استخدام الأرض' },
          { name: 'construction_year', type: 'integer', value: getConstructionYear(buildingType), alias: 'سنة البناء' },
          { name: 'occupancy_status', type: 'string', value: getOccupancyStatus(), alias: 'حالة الإشغال' },
          { name: 'owner_name', type: 'string', value: generateOwnerName(buildingNo), alias: 'اسم المالك' },
          { name: 'civil_number', type: 'string', value: generateCivilNumber(buildingNo), alias: 'الرقم المدني' },
          { name: 'gis_code', type: 'string', value: generateOmanGISCode(govKey, wilayat, plotNo, buildingNo), alias: 'كود GIS' },
          { name: 'building_condition', type: 'string', value: getBuildingCondition(), alias: 'حالة المبنى' },
          { name: 'utilities', type: 'string', value: getUtilitiesStatus(), alias: 'المرافق' },
          { name: 'access_road', type: 'string', value: getAccessRoadStatus(), alias: 'طريق الوصول' },
          { name: 'water_connection', type: 'string', value: getWaterConnectionStatus(), alias: 'ربط المياه' },
          { name: 'electricity_connection', type: 'string', value: getElectricityConnectionStatus(), alias: 'ربط الكهرباء' },
          { name: 'sewage_connection', type: 'string', value: getSewageConnectionStatus(), alias: 'ربط الصرف الصحي' }
        ]
      })
    }
  })

  return {
    id: 'oman_buildings_layer',
    name: 'جميع المباني في سلطنة عُمان',
    type: 'vector',
    geometry: 'Point',
    crs: QGIS_CRS.OMAN_OFFICIAL,
    features,
    style: {
      type: 'categorized',
      symbol: {
        type: 'marker',
        name: 'circle',
        color: '#3B82F6',
        size: 6
      },
      color: '#3B82F6',
      size: 6,
      opacity: 0.8,
      strokeColor: '#1D4ED8',
      strokeWidth: 1,
      label: {
        enabled: true,
        field: 'building_no',
        font: {
          family: 'Arial',
          size: 8,
          color: '#1F2937',
          bold: false
        },
        placement: 'point',
        offset: { x: 0, y: -12 }
      }
    },
    visible: true,
    opacity: 1.0,
    order: 1
  }
}

// إنشاء طبقة شاملة لجميع المنازل في السلطنة (النسخة المحسنة)
export function createOmanHousesQGISLayer(): QGISLayer {
  const buildingsLayer = createOmanBuildingsQGISLayer()
  
  // تصفية المباني السكنية فقط
  const housesFeatures = buildingsLayer.features.filter(feature => 
    feature.properties.land_use === 'سكني' || 
    feature.properties.building_type === 'فيلا' ||
    feature.properties.building_type === 'شقة' ||
    feature.properties.building_type === 'بيت شعبي'
  )
  
  return {
    ...buildingsLayer,
    id: 'oman_houses_layer',
    name: 'المنازل السكنية في سلطنة عُمان',
    features: housesFeatures,
    style: {
      ...buildingsLayer.style,
      color: '#10B981',
      symbol: {
        ...buildingsLayer.style.symbol,
        color: '#10B981'
      },
      strokeColor: '#059669',
      label: {
        ...buildingsLayer.style.label,
        field: 'building_no',
        font: {
          family: 'Arial',
          size: 9,
          color: '#1F2937',
          bold: true
        }
      }
    }
  }
}

// إنشاء طبقة قطع الأراضي في QGIS
export function createLandParcelsQGISLayer(): QGISLayer {
  const features: QGISFeature[] = []
  
  Object.entries(OMAN_GOVERNORATES).forEach(([govKey, governorate]) => {
    const parcelsPerGovernorate = 30 + Math.floor(Math.random() * 50)
    
    for (let i = 0; i < parcelsPerGovernorate; i++) {
      const parcelNo = 1000 + i
      const wilayat = governorate.wilayats[i % governorate.wilayats.length]
      
      // إنشاء مضلع عشوائي للقطعة
      const centerLat = governorate.bounds.south + 
        (governorate.bounds.north - governorate.bounds.south) * Math.random()
      const centerLng = governorate.bounds.west + 
        (governorate.bounds.east - governorate.bounds.west) * Math.random()
      
      const size = 0.001 + Math.random() * 0.005 // حجم القطعة
      const coordinates = [[
        [centerLng - size, centerLat - size],
        [centerLng + size, centerLat - size],
        [centerLng + size, centerLat + size],
        [centerLng - size, centerLat + size],
        [centerLng - size, centerLat - size]
      ]]
      
      features.push({
        id: `parcel_${govKey}_${parcelNo}`,
        geometry: {
          type: 'Polygon',
          coordinates
        },
        properties: {
          parcel_no: parcelNo,
          governorate: governorate.name,
          wilayat: wilayat,
          area_m2: Math.floor(500 + Math.random() * 2000),
          land_use: getRandomLandUse(),
          ownership_type: getRandomOwnershipType(),
          registration_date: generateRegistrationDate(),
          survey_number: generateSurveyNumber(parcelNo)
        },
        attributes: [
          { name: 'parcel_no', type: 'integer', value: parcelNo, alias: 'رقم القطعة' },
          { name: 'governorate', type: 'string', value: governorate.name, alias: 'المحافظة' },
          { name: 'wilayat', type: 'string', value: wilayat, alias: 'الولاية' },
          { name: 'area_m2', type: 'double', value: Math.floor(500 + Math.random() * 2000), alias: 'المساحة (م²)' },
          { name: 'land_use', type: 'string', value: getRandomLandUse(), alias: 'استخدام الأرض' },
          { name: 'ownership_type', type: 'string', value: getRandomOwnershipType(), alias: 'نوع الملكية' },
          { name: 'registration_date', type: 'date', value: generateRegistrationDate(), alias: 'تاريخ التسجيل' },
          { name: 'survey_number', type: 'string', value: generateSurveyNumber(parcelNo), alias: 'رقم المساحة' }
        ]
      })
    }
  })

  return {
    id: 'land_parcels_layer',
    name: 'قطع الأراضي في سلطنة عُمان',
    type: 'vector',
    geometry: 'Polygon',
    crs: QGIS_CRS.OMAN_OFFICIAL,
    features,
    style: {
      type: 'simple',
      symbol: {
        type: 'fill',
        name: 'solid',
        color: '#FEF3C7',
        size: 1
      },
      color: '#FEF3C7',
      size: 1,
      opacity: 0.4,
      strokeColor: '#9CA3AF',
      strokeWidth: 1,
      fillColor: '#FEF3C7',
      label: {
        enabled: true,
        field: 'parcel_no',
        font: {
          family: 'Arial',
          size: 8,
          color: '#374151',
          bold: false
        },
        placement: 'point',
        offset: { x: 0, y: 0 }
      }
    },
    visible: true,
    opacity: 0.4,
    order: 0
  }
}

// إنشاء طبقة المحافظات في QGIS
export function createGovernoratesQGISLayer(): QGISLayer {
  const features: QGISFeature[] = Object.entries(OMAN_GOVERNORATES).map(([govKey, governorate]) => {
    const bounds = governorate.bounds
    const coordinates = [[
      [bounds.west, bounds.south],
      [bounds.east, bounds.south],
      [bounds.east, bounds.north],
      [bounds.west, bounds.north],
      [bounds.west, bounds.south]
    ]]
    
    return {
      id: `governorate_${govKey}`,
      geometry: {
        type: 'Polygon',
        coordinates
      },
      properties: {
        name: governorate.name,
        name_en: governorate.nameEn,
        code: govKey,
        wilayats_count: governorate.wilayats.length,
        center_lat: governorate.center.lat,
        center_lng: governorate.center.lng
      },
      attributes: [
        { name: 'name', type: 'string', value: governorate.name, alias: 'اسم المحافظة' },
        { name: 'name_en', type: 'string', value: governorate.nameEn, alias: 'اسم المحافظة (إنجليزي)' },
        { name: 'code', type: 'string', value: govKey, alias: 'كود المحافظة' },
        { name: 'wilayats_count', type: 'integer', value: governorate.wilayats.length, alias: 'عدد الولايات' },
        { name: 'center_lat', type: 'double', value: governorate.center.lat, alias: 'خط العرض المركزي' },
        { name: 'center_lng', type: 'double', value: governorate.center.lng, alias: 'خط الطول المركزي' }
      ]
    }
  })

  return {
    id: 'governorates_layer',
    name: 'محافظات سلطنة عُمان',
    type: 'vector',
    geometry: 'Polygon',
    crs: QGIS_CRS.OMAN_OFFICIAL,
    features,
    style: {
      type: 'simple',
      symbol: {
        type: 'fill',
        name: 'solid',
        color: '#E5E7EB',
        size: 1
      },
      color: '#E5E7EB',
      size: 1,
      opacity: 0.2,
      strokeColor: '#6B7280',
      strokeWidth: 2,
      fillColor: '#E5E7EB',
      label: {
        enabled: true,
        field: 'name',
        font: {
          family: 'Arial',
          size: 12,
          color: '#374151',
          bold: true
        },
        placement: 'point',
        offset: { x: 0, y: 0 }
      }
    },
    visible: true,
    opacity: 0.2,
    order: -1
  }
}

// إنشاء طبقة المنازل في QGIS (النسخة المحسنة)
export function createHousesQGISLayer(houses: any[]): QGISLayer {
  const features: QGISFeature[] = houses.map((house, index) => ({
    id: `house_${house.id}`,
    geometry: {
      type: 'Point',
      coordinates: [house.lng || 58.5932, house.lat || 23.6151]
    },
    properties: {
      house_no: house.houseNo,
      plot_no: house.plotNo,
      area: house.area,
      area_m2: house.areaM2,
      rooms: house.rooms,
      owner_name: generateOwnerName(house.houseNo),
      civil_number: generateCivilNumber(house.houseNo),
      gis_code: generateGISCode(house.houseNo, house.plotNo)
    },
    attributes: [
      { name: 'house_no', type: 'integer', value: house.houseNo, alias: 'رقم المنزل' },
      { name: 'plot_no', type: 'integer', value: house.plotNo, alias: 'رقم القطعة' },
      { name: 'area', type: 'string', value: house.area, alias: 'المنطقة' },
      { name: 'area_m2', type: 'double', value: house.areaM2, alias: 'المساحة (م²)' },
      { name: 'rooms', type: 'integer', value: house.rooms, alias: 'عدد الغرف' },
      { name: 'owner_name', type: 'string', value: generateOwnerName(house.houseNo), alias: 'اسم المالك' },
      { name: 'civil_number', type: 'string', value: generateCivilNumber(house.houseNo), alias: 'الرقم المدني' },
      { name: 'gis_code', type: 'string', value: generateGISCode(house.houseNo, house.plotNo), alias: 'كود GIS' }
    ]
  }))

  return {
    id: 'houses_layer',
    name: 'المنازل - مدينة سلطان قابوس',
    type: 'vector',
    geometry: 'Point',
    crs: QGIS_CRS.WGS84,
    features,
    style: {
      type: 'categorized',
      symbol: {
        type: 'marker',
        name: 'circle',
        color: '#3B82F6',
        size: 12
      },
      color: '#3B82F6',
      size: 12,
      opacity: 0.8,
      strokeColor: '#1D4ED8',
      strokeWidth: 1,
      label: {
        enabled: true,
        field: 'house_no',
        font: {
          family: 'Arial',
          size: 12,
          color: '#1F2937',
          bold: true
        },
        placement: 'point',
        offset: { x: 0, y: -20 }
      }
    },
    visible: true,
    opacity: 1.0,
    order: 1
  }
}

// إنشاء طبقة الشوارع في QGIS
export function createStreetsQGISLayer(): QGISLayer {
  const features: QGISFeature[] = [
    {
      id: 'street_sultan_qaboos',
      geometry: {
        type: 'LineString',
        coordinates: [[58.5900, 23.6150], [58.6000, 23.6150]]
      },
      properties: {
        name: 'شارع سلطان قابوس',
        name_en: 'Sultan Qaboos Street',
        type: 'main',
        width: 8,
        lanes: 4
      },
      attributes: [
        { name: 'name', type: 'string', value: 'شارع سلطان قابوس', alias: 'اسم الشارع' },
        { name: 'name_en', type: 'string', value: 'Sultan Qaboos Street', alias: 'اسم الشارع (إنجليزي)' },
        { name: 'type', type: 'string', value: 'main', alias: 'نوع الشارع' },
        { name: 'width', type: 'double', value: 8, alias: 'العرض (م)' },
        { name: 'lanes', type: 'integer', value: 4, alias: 'عدد المسارات' }
      ]
    },
    {
      id: 'street_inshirah',
      geometry: {
        type: 'LineString',
        coordinates: [[58.5950, 23.6100], [58.5950, 23.6200]]
      },
      properties: {
        name: 'شارع الإنشراح',
        name_en: 'Al Inshirah Street',
        type: 'main',
        width: 6,
        lanes: 3
      },
      attributes: [
        { name: 'name', type: 'string', value: 'شارع الإنشراح', alias: 'اسم الشارع' },
        { name: 'name_en', type: 'string', value: 'Al Inshirah Street', alias: 'اسم الشارع (إنجليزي)' },
        { name: 'type', type: 'string', value: 'main', alias: 'نوع الشارع' },
        { name: 'width', type: 'double', value: 6, alias: 'العرض (م)' },
        { name: 'lanes', type: 'integer', value: 3, alias: 'عدد المسارات' }
      ]
    }
  ]

  return {
    id: 'streets_layer',
    name: 'الشوارع - مدينة سلطان قابوس',
    type: 'vector',
    geometry: 'LineString',
    crs: QGIS_CRS.WGS84,
    features,
    style: {
      type: 'simple',
      symbol: {
        type: 'line',
        name: 'solid',
        color: '#3B82F6',
        size: 4
      },
      color: '#3B82F6',
      size: 4,
      opacity: 0.9,
      strokeColor: '#1D4ED8',
      strokeWidth: 2,
      label: {
        enabled: true,
        field: 'name',
        font: {
          family: 'Arial',
          size: 12,
          color: '#1F2937',
          bold: true
        },
        placement: 'line',
        offset: { x: 0, y: 0 }
      }
    },
    visible: true,
    opacity: 1.0,
    order: 2
  }
}

// إنشاء طبقة الكتل في QGIS
export function createBlocksQGISLayer(): QGISLayer {
  const features: QGISFeature[] = [
    {
      id: 'block_1',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [58.5900, 23.6100],
          [58.5950, 23.6100],
          [58.5950, 23.6150],
          [58.5900, 23.6150],
          [58.5900, 23.6100]
        ]]
      },
      properties: {
        name: 'الكتلة الأولى',
        code: 'SQ-01',
        sector: 'A',
        area_m2: 250000,
        houses_count: 25
      },
      attributes: [
        { name: 'name', type: 'string', value: 'الكتلة الأولى', alias: 'اسم الكتلة' },
        { name: 'code', type: 'string', value: 'SQ-01', alias: 'كود الكتلة' },
        { name: 'sector', type: 'string', value: 'A', alias: 'القطاع' },
        { name: 'area_m2', type: 'double', value: 250000, alias: 'المساحة (م²)' },
        { name: 'houses_count', type: 'integer', value: 25, alias: 'عدد المنازل' }
      ]
    }
  ]

  return {
    id: 'blocks_layer',
    name: 'الكتل - مدينة سلطان قابوس',
    type: 'vector',
    geometry: 'Polygon',
    crs: QGIS_CRS.WGS84,
    features,
    style: {
      type: 'simple',
      symbol: {
        type: 'fill',
        name: 'solid',
        color: '#FEF3C7',
        size: 1
      },
      color: '#FEF3C7',
      size: 1,
      opacity: 0.3,
      strokeColor: '#9CA3AF',
      strokeWidth: 2,
      fillColor: '#FEF3C7',
      label: {
        enabled: true,
        field: 'name',
        font: {
          family: 'Arial',
          size: 14,
          color: '#374151',
          bold: true
        },
        placement: 'point',
        offset: { x: 0, y: 0 }
      }
    },
    visible: true,
    opacity: 0.3,
    order: 0
  }
}

// إنشاء مشروع QGIS شامل للسلطنة (مثل النظام الرسمي)
export function createOmanQGISProject(): QGISProject {
  const governoratesLayer = createGovernoratesQGISLayer()
  const landParcelsLayer = createLandParcelsQGISLayer()
  const omanBuildingsLayer = createOmanBuildingsQGISLayer()
  const omanHousesLayer = createOmanHousesQGISLayer()
  const streetsLayer = createStreetsQGISLayer()
  const blocksLayer = createBlocksQGISLayer()
  
  const layers = [governoratesLayer, landParcelsLayer, omanBuildingsLayer, omanHousesLayer, streetsLayer, blocksLayer]
  
  // حساب الحدود الشاملة للسلطنة
  const allBounds = Object.values(OMAN_GOVERNORATES).map(gov => gov.bounds)
  const extent = {
    xmin: Math.min(...allBounds.map(b => b.west)),
    ymin: Math.min(...allBounds.map(b => b.south)),
    xmax: Math.max(...allBounds.map(b => b.east)),
    ymax: Math.max(...allBounds.map(b => b.north))
  }
  
  return {
    name: 'مشروع سلطنة عُمان الشامل - QGIS',
    version: '3.28.0',
    crs: QGIS_CRS.OMAN_OFFICIAL,
    layers,
    extent,
    metadata: {
      title: 'نظام معلومات جغرافية شامل لسلطنة عُمان',
      abstract: 'مشروع QGIS شامل لسلطنة عُمان يتضمن جميع المحافظات والولايات والمنازل وقطع الأراضي والشوارع',
      keywords: ['QGIS', 'GIS', 'Oman', 'سلطنة عُمان', 'محافظات', 'ولايات', 'منازل', 'أراضي', 'شوارع', 'تخطيط حضري'],
      author: 'فريق عُنْوَنِي - نظام العنونة الذكي',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      license: 'MIT License'
    }
  }
}

// إنشاء مشروع QGIS
export function createQGISProject(layers: QGISLayer[]): QGISProject {
  return {
    name: 'مشروع مدينة سلطان قابوس - QGIS',
    version: '3.28.0',
    crs: QGIS_CRS.WGS84,
    layers,
    extent: {
      xmin: 58.5900,
      ymin: 23.6100,
      xmax: 58.6000,
      ymax: 23.6200
    },
    metadata: {
      title: 'نظام معلومات جغرافية لمدينة سلطان قابوس',
      abstract: 'مشروع QGIS شامل لمدينة سلطان قابوس يتضمن المنازل والشوارع والكتل',
      keywords: ['QGIS', 'GIS', 'Oman', 'Muscat', 'Sultan Qaboos City', 'Urban Planning'],
      author: 'فريق عُنْوَنِي',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      license: 'MIT License'
    }
  }
}

// دالة لتوليد اسم المالك
function generateOwnerName(houseNo: number): string {
  const names = [
    'أحمد بن محمد العماني', 'فاطمة بنت علي السعيدي', 'محمد بن سالم الحارثي',
    'عائشة بنت عبدالله النعماني', 'خالد بن راشد الشامسي', 'مريم بنت سعد الكندي'
  ]
  return names[houseNo % names.length]
}

// دالة لتوليد الرقم المدني
function generateCivilNumber(houseNo: number): string {
  const year = 1980 + (houseNo % 30)
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')
  const serial = String(houseNo * 100 + Math.floor(Math.random() * 100)).padStart(5, '0')
  return `${year}${month}${day}-${serial}`
}

// دالة لتوليد كود GIS
function generateGISCode(houseNo: number, plotNo: number): string {
  return `SQ-A-${plotNo.toString().padStart(3, '0')}-${houseNo.toString().padStart(4, '0')}`
}

// دالة لتوليد كود GIS عماني شامل
function generateOmanGISCode(govKey: string, wilayat: string, plotNo: number, houseNo: number): string {
  const govCode = govKey.substring(0, 3).toUpperCase()
  const wilayatCode = wilayat.substring(0, 2).toUpperCase()
  return `OM-${govCode}-${wilayatCode}-${plotNo.toString().padStart(4, '0')}-${houseNo.toString().padStart(4, '0')}`
}

// دالة لتوليد نوع البناء
function getRandomBuildingType(): string {
  const types = ['فيلا', 'شقة', 'بيت شعبي', 'عمارة', 'مبنى تجاري', 'مبنى حكومي']
  return types[Math.floor(Math.random() * types.length)]
}

// دالة لتوليد استخدام الأرض
function getRandomLandUse(): string {
  const uses = ['سكني', 'تجاري', 'صناعي', 'زراعي', 'حكومي', 'ترفيهي', 'تعليمي', 'صحي']
  return uses[Math.floor(Math.random() * uses.length)]
}

// دالة لتوليد نوع الملكية
function getRandomOwnershipType(): string {
  const types = ['ملكية خاصة', 'ملكية حكومية', 'ملكية وقفية', 'ملكية مشتركة', 'إيجار']
  return types[Math.floor(Math.random() * types.length)]
}

// دالة لتوليد تاريخ التسجيل
function generateRegistrationDate(): string {
  const year = 1990 + Math.floor(Math.random() * 34)
  const month = Math.floor(Math.random() * 12) + 1
  const day = Math.floor(Math.random() * 28) + 1
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
}

// دالة لتوليد رقم المساحة
function generateSurveyNumber(parcelNo: number): string {
  return `SUR-${parcelNo.toString().padStart(6, '0')}`
}

// دوال مساعدة جديدة للنظام الشامل
function getBuildingTypeByLocation(lat: number, lng: number, governorate: any): string {
  // تحديد نوع المبنى بناءً على الموقع
  const types = ['فيلا', 'شقة', 'بيت شعبي', 'عمارة', 'مبنى تجاري', 'مبنى حكومي', 'مبنى صناعي', 'مبنى تعليمي', 'مبنى صحي']
  
  // في المناطق الحضرية (مسقط، صلالة) - مباني حديثة أكثر
  if (governorate.name.includes('مسقط') || governorate.name.includes('ظفار')) {
    const urbanTypes = ['فيلا', 'شقة', 'عمارة', 'مبنى تجاري', 'مبنى حكومي']
    return urbanTypes[Math.floor(Math.random() * urbanTypes.length)]
  }
  
  // في المناطق الريفية - بيوت شعبية أكثر
  if (governorate.name.includes('الداخلية') || governorate.name.includes('الظاهرة')) {
    const ruralTypes = ['بيت شعبي', 'فيلا', 'مبنى حكومي', 'مبنى تعليمي']
    return ruralTypes[Math.floor(Math.random() * ruralTypes.length)]
  }
  
  return types[Math.floor(Math.random() * types.length)]
}

function getLandUseByLocation(lat: number, lng: number, governorate: any): string {
  const uses = ['سكني', 'تجاري', 'صناعي', 'زراعي', 'حكومي', 'ترفيهي', 'تعليمي', 'صحي', 'ديني']
  
  // في المناطق الحضرية
  if (governorate.name.includes('مسقط') || governorate.name.includes('ظفار')) {
    const urbanUses = ['سكني', 'تجاري', 'حكومي', 'تعليمي', 'صحي']
    return urbanUses[Math.floor(Math.random() * urbanUses.length)]
  }
  
  // في المناطق الريفية
  if (governorate.name.includes('الداخلية') || governorate.name.includes('الظاهرة')) {
    const ruralUses = ['سكني', 'زراعي', 'حكومي', 'تعليمي']
    return ruralUses[Math.floor(Math.random() * ruralUses.length)]
  }
  
  return uses[Math.floor(Math.random() * uses.length)]
}

function getBuildingArea(buildingType: string): number {
  const areas = {
    'فيلا': 400 + Math.floor(Math.random() * 600),
    'شقة': 80 + Math.floor(Math.random() * 120),
    'بيت شعبي': 200 + Math.floor(Math.random() * 300),
    'عمارة': 1000 + Math.floor(Math.random() * 2000),
    'مبنى تجاري': 500 + Math.floor(Math.random() * 1500),
    'مبنى حكومي': 800 + Math.floor(Math.random() * 1200),
    'مبنى صناعي': 2000 + Math.floor(Math.random() * 3000),
    'مبنى تعليمي': 1500 + Math.floor(Math.random() * 2500),
    'مبنى صحي': 1200 + Math.floor(Math.random() * 1800)
  }
  return areas[buildingType as keyof typeof areas] || 300
}

function getBuildingFloors(buildingType: string): number {
  const floors = {
    'فيلا': 1 + Math.floor(Math.random() * 2),
    'شقة': 1,
    'بيت شعبي': 1,
    'عمارة': 3 + Math.floor(Math.random() * 7),
    'مبنى تجاري': 2 + Math.floor(Math.random() * 8),
    'مبنى حكومي': 2 + Math.floor(Math.random() * 6),
    'مبنى صناعي': 1 + Math.floor(Math.random() * 3),
    'مبنى تعليمي': 1 + Math.floor(Math.random() * 4),
    'مبنى صحي': 2 + Math.floor(Math.random() * 5)
  }
  return floors[buildingType as keyof typeof floors] || 1
}

function getConstructionYear(buildingType: string): number {
  // المباني الحديثة (فيلا، عمارة) - سنوات أحدث
  if (buildingType === 'فيلا' || buildingType === 'عمارة' || buildingType === 'مبنى تجاري') {
    return 2000 + Math.floor(Math.random() * 24)
  }
  
  // المباني الحكومية والتعليمية - سنوات متوسطة
  if (buildingType === 'مبنى حكومي' || buildingType === 'مبنى تعليمي' || buildingType === 'مبنى صحي') {
    return 1990 + Math.floor(Math.random() * 34)
  }
  
  // البيوت الشعبية - سنوات أقدم
  return 1980 + Math.floor(Math.random() * 44)
}

function getOccupancyStatus(): string {
  const statuses = ['مشغول', 'فارغ', 'قيد الإنشاء', 'مهجور', 'قيد الترميم']
  return statuses[Math.floor(Math.random() * statuses.length)]
}

function getBuildingCondition(): string {
  const conditions = ['ممتاز', 'جيد', 'مقبول', 'يحتاج ترميم', 'سيء']
  return conditions[Math.floor(Math.random() * conditions.length)]
}

function getUtilitiesStatus(): string {
  const statuses = ['متوفر', 'غير متوفر', 'قيد التوصيل', 'مشكلة في التوصيل']
  return statuses[Math.floor(Math.random() * statuses.length)]
}

function getAccessRoadStatus(): string {
  const statuses = ['طريق معبد', 'طريق ترابي', 'طريق غير معبد', 'لا يوجد طريق']
  return statuses[Math.floor(Math.random() * statuses.length)]
}

function getWaterConnectionStatus(): string {
  const statuses = ['متصل', 'غير متصل', 'قيد التوصيل', 'مشكلة في التوصيل']
  return statuses[Math.floor(Math.random() * statuses.length)]
}

function getElectricityConnectionStatus(): string {
  const statuses = ['متصل', 'غير متصل', 'قيد التوصيل', 'مشكلة في التوصيل']
  return statuses[Math.floor(Math.random() * statuses.length)]
}

function getSewageConnectionStatus(): string {
  const statuses = ['متصل', 'غير متصل', 'قيد التوصيل', 'مشكلة في التوصيل', 'صرف صحي محلي']
  return statuses[Math.floor(Math.random() * statuses.length)]
}

// دالة لتصدير مشروع QGIS
export function exportQGISProject(project: QGISProject): string {
  const qgsContent = {
    qgis: {
      version: project.version,
      crs: project.crs,
      extent: project.extent,
      layers: project.layers.map(layer => ({
        id: layer.id,
        name: layer.name,
        type: layer.type,
        geometry: layer.geometry,
        crs: layer.crs,
        features: layer.features,
        style: layer.style,
        visible: layer.visible,
        opacity: layer.opacity,
        order: layer.order
      })),
      metadata: project.metadata
    }
  }
  
  return JSON.stringify(qgsContent, null, 2)
}

// دالة لاستيراد مشروع QGIS
export function importQGISProject(qgsContent: string): QGISProject | null {
  try {
    const data = JSON.parse(qgsContent)
    return data.qgis as QGISProject
  } catch (error) {
    console.error('خطأ في استيراد مشروع QGIS:', error)
    return null
  }
}

// دالة للحصول على إحصائيات QGIS
export function getQGISStats(project: QGISProject) {
  const totalLayers = project.layers.length
  const totalFeatures = project.layers.reduce((sum, layer) => sum + layer.features.length, 0)
  const vectorLayers = project.layers.filter(layer => layer.type === 'vector').length
  const pointFeatures = project.layers
    .filter(layer => layer.geometry === 'Point')
    .reduce((sum, layer) => sum + layer.features.length, 0)
  const lineFeatures = project.layers
    .filter(layer => layer.geometry === 'LineString')
    .reduce((sum, layer) => sum + layer.features.length, 0)
  const polygonFeatures = project.layers
    .filter(layer => layer.geometry === 'Polygon')
    .reduce((sum, layer) => sum + layer.features.length, 0)
  
  return {
    totalLayers,
    totalFeatures,
    vectorLayers,
    pointFeatures,
    lineFeatures,
    polygonFeatures,
    crs: project.crs,
    extent: project.extent
  }
}

// دالة لتصدير طبقة إلى GeoJSON
export function exportLayerToGeoJSON(layer: QGISLayer): string {
  const geojson = {
    type: 'FeatureCollection',
    crs: {
      type: 'name',
      properties: {
        name: layer.crs
      }
    },
    features: layer.features.map(feature => ({
      type: 'Feature',
      id: feature.id,
      geometry: feature.geometry,
      properties: feature.properties
    }))
  }
  
  return JSON.stringify(geojson, null, 2)
}

// دالة لتصدير جميع طبقات المشروع إلى ملفات GeoJSON منفصلة
export function exportAllLayersToGeoJSON(project: QGISProject): { [layerId: string]: string } {
  const exports: { [layerId: string]: string } = {}
  
  project.layers.forEach(layer => {
    exports[layer.id] = exportLayerToGeoJSON(layer)
  })
  
  return exports
}

// دالة لتصدير مشروع QGIS بصيغة QGS (QGIS Project File)
export function exportQGISProjectFile(project: QGISProject): string {
  const qgsContent = `<?xml version="1.0" encoding="UTF-8"?>
<qgis version="3.28.0" styleCategories="AllStyleCategories">
  <title>${project.name}</title>
  <abstract>${project.metadata.abstract}</abstract>
  <keywords>${project.metadata.keywords.join(', ')}</keywords>
  <author>${project.metadata.author}</author>
  <created>${project.metadata.created}</created>
  <modified>${project.metadata.modified}</modified>
  <license>${project.metadata.license}</license>
  
  <projectCrs>
    <spatialrefsys>
      <crs class_id="1" version="0">
        <srsid>0</srsid>
        <srid>${project.crs.split(':')[1]}</srid>
        <authid>${project.crs}</authid>
        <description>Oman National Grid</description>
        <projectionacronym>UTM</projectionacronym>
        <ellipsoidacronym>WGS84</ellipsoidacronym>
        <geographicflag>false</geographicflag>
      </crs>
    </spatialrefsys>
  </projectCrs>
  
  <extent>
    <xmin>${project.extent.xmin}</xmin>
    <ymin>${project.extent.ymin}</ymin>
    <xmax>${project.extent.xmax}</xmax>
    <ymax>${project.extent.ymax}</ymax>
  </extent>
  
  <layers>
    ${project.layers.map((layer, index) => `
    <layer-tree-layer name="${layer.name}" id="${layer.id}" checked="Qt::Checked" expanded="1">
      <customproperties/>
      <layer-tree-layer>
        <layer-tree-layer name="${layer.name}" id="${layer.id}" checked="Qt::Checked" expanded="1">
          <customproperties/>
        </layer-tree-layer>
      </layer-tree-layer>
    </layer-tree-layer>
    `).join('')}
  </layers>
  
  <mapcanvas>
    <units>degrees</units>
    <extent>
      <xmin>${project.extent.xmin}</xmin>
      <ymin>${project.extent.ymin}</ymin>
      <xmax>${project.extent.xmax}</xmax>
      <ymax>${project.extent.ymax}</ymax>
    </extent>
    <projections>0</projections>
    <destinationsrs>
      <spatialrefsys>
        <crs class_id="1" version="0">
          <srsid>0</srsid>
          <srid>${project.crs.split(':')[1]}</srid>
          <authid>${project.crs}</authid>
          <description>Oman National Grid</description>
          <projectionacronym>UTM</projectionacronym>
          <ellipsoidacronym>WGS84</ellipsoidacronym>
          <geographicflag>false</geographicflag>
        </crs>
      </spatialrefsys>
    </destinationsrs>
    <layer_coordinate_transform_info>
      <layer_coordinate_transform_info>
        <id>${project.layers[0]?.id || ''}</id>
        <precision>0</precision>
        <destinationsrs>
          <spatialrefsys>
            <crs class_id="1" version="0">
              <srsid>0</srsid>
              <srid>${project.crs.split(':')[1]}</srid>
              <authid>${project.crs}</authid>
              <description>Oman National Grid</description>
              <projectionacronym>UTM</projectionacronym>
              <ellipsoidacronym>WGS84</ellipsoidacronym>
              <geographicflag>false</geographicflag>
            </crs>
          </spatialrefsys>
        </destinationsrs>
      </layer_coordinate_transform_info>
    </layer_coordinate_transform_info>
  </mapcanvas>
  
  <pipe>
    <rasterrenderer opacity="1" alphaBand="-1" classificationMax="0" classificationMin="0" band="1" classificationMinMaxOrigin="0">
      <rasterTransparency/>
      <minMaxOrigin>
        <limits>None</limits>
        <extent>WholeRaster</extent>
        <statAccuracy>Estimated</statAccuracy>
        <cumulativeCutLower>0.02</cumulativeCutLower>
        <cumulativeCutUpper>0.98</cumulativeCutUpper>
        <stdDevFactor>2</stdDevFactor>
      </minMaxOrigin>
      <contrastEnhancement>
        <minValue>0</minValue>
        <maxValue>0</maxValue>
        <algorithm>NoEnhancement</algorithm>
      </contrastEnhancement>
    </rasterrenderer>
    <brightnesscontrast brightness="0" contrast="0" gamma="1"/>
    <huesaturation colorizeGreen="128" colorizeOn="0" colorizeRed="255" grayscaleMode="0" saturation="0" colorizeBlue="128"/>
    <rasterresampler maxOversampling="2"/>
  </pipe>
  
  <blendMode>0</blendMode>
</qgis>`
  
  return qgsContent
}

// دالة لاستيراد طبقة من GeoJSON
export function importLayerFromGeoJSON(geojsonContent: string, layerName: string): QGISLayer | null {
  try {
    const data = JSON.parse(geojsonContent)
    const features: QGISFeature[] = data.features.map((feature: any) => ({
      id: feature.id || `feature_${Math.random()}`,
      geometry: feature.geometry,
      properties: feature.properties,
      attributes: Object.entries(feature.properties).map(([name, value]) => ({
        name,
        type: typeof value === 'number' ? 'double' : 'string',
        value
      }))
    }))
    
    return {
      id: `imported_${Date.now()}`,
      name: layerName,
      type: 'vector',
      geometry: data.features[0]?.geometry?.type || 'Point',
      crs: data.crs?.properties?.name || QGIS_CRS.WGS84,
      features,
      style: {
        type: 'simple',
        symbol: {
          type: 'marker',
          name: 'circle',
          color: '#3B82F6',
          size: 8
        },
        color: '#3B82F6',
        size: 8,
        opacity: 0.8
      },
      visible: true,
      opacity: 1.0,
      order: 0
    }
  } catch (error) {
    console.error('خطأ في استيراد GeoJSON:', error)
    return null
  }
}
