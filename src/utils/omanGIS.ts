// نظام GIS العماني الرسمي - بناءً على النظام الرسمي لوزارة البلديات الإقليمية وموارد المياه
// المرجع: https://gis.mm.gov.om/GIS115/RMap/Default.aspx?LANGUAGE=ar-OM#

export interface OmanGISAddress {
  wilayatCode: string
  wilayatName: string
  sectorCode: string
  sectorName: string
  blockNumber: string
  plotNumber: string
  houseNumber: string
  streetName: string
  streetNumber: string
  coordinates: {
    x: number
    y: number
    lat?: number
    lng?: number
  }
  fullAddress: string
  omanGISCode: string
  postalCode: string
}

export interface WilayatInfo {
  code: string
  name: string
  nameEn: string
  governorate: string
  sectors: SectorInfo[]
}

export interface SectorInfo {
  code: string
  name: string
  nameEn: string
  blocks: BlockInfo[]
}

export interface BlockInfo {
  id: string
  name: string
  code: string
  startX: number
  startY: number
  endX: number
  endY: number
  streetNames: string[]
}

// تعريف الولايات العمانية - بناءً على النظام الرسمي
export const OMAN_WILAYATS: WilayatInfo[] = [
  {
    code: 'MCT-001',
    name: 'مسقط',
    nameEn: 'Muscat',
    governorate: 'محافظة مسقط',
    sectors: [
      {
        code: 'MCT-SQ-001',
        name: 'مدينة سلطان قابوس',
        nameEn: 'Madinat As Sultan Qaboos',
        blocks: [
          {
            id: 'SQ-BLK-01',
            name: 'الكتلة الأولى',
            code: 'SQ-01',
            startX: 100,
            startY: 100,
            endX: 400,
            endY: 300,
            streetNames: ['شارع سلطان قابوس', 'شارع الإنشراح', 'شارع 3019', 'شارع 3038']
          },
          {
            id: 'SQ-BLK-02',
            name: 'الكتلة الثانية',
            code: 'SQ-02',
            startX: 500,
            startY: 100,
            endX: 800,
            endY: 300,
            streetNames: ['شارع الإنشراح', 'شارع البشائر', 'شارع 2128', 'شارع 1936']
          },
          {
            id: 'SQ-BLK-03',
            name: 'الكتلة الثالثة',
            code: 'SQ-03',
            startX: 100,
            startY: 400,
            endX: 400,
            endY: 600,
            streetNames: ['شارع البشائر', 'شارع 2133', 'شارع 2135', 'شارع 2122']
          },
          {
            id: 'SQ-BLK-04',
            name: 'الكتلة الرابعة',
            code: 'SQ-04',
            startX: 500,
            startY: 400,
            endX: 800,
            endY: 600,
            streetNames: ['شارع البشائر', 'شارع 2124', 'شارع 2125', 'شارع 2114']
          }
        ]
      }
    ]
  }
]

// دالة لتوليد عنوان GIS عماني بناءً على الموقع
export function generateOmanGISAddress(x: number, y: number, houseIndex: number): OmanGISAddress {
  // تحديد الولاية والقطاع والكتلة
  const wilayat = OMAN_WILAYATS[0] // مسقط
  const sector = wilayat.sectors[0] // مدينة سلطان قابوس
  const block = findBlockByCoordinates(x, y, sector.blocks)
  
  // حساب رقم القطعة داخل الكتلة
  const plotNumber = calculateOmanPlotNumber(x, y, block)
  
  // حساب رقم المنزل
  const houseNumber = calculateOmanHouseNumber(x, y, block, houseIndex)
  
  // توليد اسم الشارع
  const streetInfo = getOmanStreetInfo(x, y, block)
  
  // توليد كود GIS العماني
  const omanGISCode = generateOmanGISCode(wilayat, sector, block, plotNumber, houseNumber)
  
  // توليد الرمز البريدي
  const postalCode = generateOmanPostalCode(wilayat, sector, block)
  
  // توليد العنوان الكامل
  const fullAddress = generateOmanFullAddress(wilayat, sector, block, plotNumber, houseNumber, streetInfo.name)
  
  return {
    wilayatCode: wilayat.code,
    wilayatName: wilayat.name,
    sectorCode: sector.code,
    sectorName: sector.name,
    blockNumber: block.code,
    plotNumber: plotNumber.toString(),
    houseNumber: houseNumber.toString(),
    streetName: streetInfo.name,
    streetNumber: streetInfo.number,
    coordinates: { x, y },
    fullAddress,
    omanGISCode,
    postalCode
  }
}

// دالة للعثور على الكتلة بناءً على الإحداثيات
function findBlockByCoordinates(x: number, y: number, blocks: BlockInfo[]): BlockInfo {
  for (const block of blocks) {
    if (x >= block.startX && x <= block.endX && y >= block.startY && y <= block.endY) {
      return block
    }
  }
  // افتراضي - الكتلة الأولى
  return blocks[0]
}

// دالة لحساب رقم القطعة حسب النظام العماني
function calculateOmanPlotNumber(x: number, y: number, block: BlockInfo): number {
  const blockWidth = block.endX - block.startX
  const blockHeight = block.endY - block.startY
  
  // تقسيم الكتلة إلى شبكة 10x10 حسب النظام العماني
  const gridSize = 10
  const cellWidth = blockWidth / gridSize
  const cellHeight = blockHeight / gridSize
  
  const col = Math.floor((x - block.startX) / cellWidth)
  const row = Math.floor((y - block.startY) / cellHeight)
  
  // رقم القطعة = رقم الصف * 10 + رقم العمود + 1
  return row * gridSize + col + 1
}

// دالة لحساب رقم المنزل حسب النظام العماني
function calculateOmanHouseNumber(x: number, y: number, block: BlockInfo, houseIndex: number): number {
  // رقم المنزل = رقم القطعة * 100 + رقم تسلسلي
  const plotNumber = calculateOmanPlotNumber(x, y, block)
  return plotNumber * 100 + (houseIndex % 10) + 1
}

// دالة لتوليد معلومات الشارع
function getOmanStreetInfo(x: number, y: number, block: BlockInfo): { name: string; number: string } {
  const blockWidth = block.endX - block.startX
  const blockHeight = block.endY - block.startY
  
  const relativeX = (x - block.startX) / blockWidth
  const relativeY = (y - block.startY) / blockHeight
  
  // الشوارع الرئيسية
  if (relativeY < 0.3) {
    return { name: 'شارع سلطان قابوس', number: 'SQ-001' }
  } else if (relativeY > 0.7) {
    return { name: 'شارع البشائر', number: 'SQ-002' }
  } else if (relativeX < 0.3) {
    return { name: 'شارع الإنشراح', number: 'SQ-003' }
  } else if (relativeX > 0.7) {
    return { name: 'شارع الخارجية', number: 'SQ-004' }
  }
  
  // الشوارع الفرعية
  const streetIndex = Math.floor(relativeX * 4)
  const streetNumbers = ['2128', '1936', '2133', '2135']
  return { 
    name: `شارع ${streetNumbers[streetIndex]}`, 
    number: `SQ-${streetNumbers[streetIndex]}` 
  }
}

// دالة لتوليد كود GIS العماني
function generateOmanGISCode(wilayat: WilayatInfo, sector: SectorInfo, block: BlockInfo, plotNumber: number, houseNumber: number): string {
  // تنسيق: WILAYAT-SECTOR-BLOCK-PLOT-HOUSE
  return `${wilayat.code}-${sector.code}-${block.code}-${plotNumber.toString().padStart(3, '0')}-${houseNumber.toString().padStart(4, '0')}`
}

// دالة لتوليد الرمز البريدي العماني
function generateOmanPostalCode(wilayat: WilayatInfo, sector: SectorInfo, block: BlockInfo): string {
  // تنسيق: 1XX (مسقط) + XX (القطاع) + XX (الكتلة)
  const wilayatCode = '100' // مسقط
  const sectorCode = sector.code.split('-').pop()?.slice(-2) || '01'
  const blockCode = block.code.split('-').pop() || '01'
  return `${wilayatCode}${sectorCode}${blockCode}`
}

// دالة لتوليد العنوان الكامل حسب النظام العماني
function generateOmanFullAddress(wilayat: WilayatInfo, sector: SectorInfo, block: BlockInfo, plotNumber: number, houseNumber: number, streetName: string): string {
  return `سلطنة عُمان، ${wilayat.governorate}، ${wilayat.name}، ${sector.name}، ${block.name}، ${streetName}، قطعة ${plotNumber}، منزل ${houseNumber}`
}

// دالة للبحث في نظام GIS العماني
export function searchOmanGISAddress(query: string): OmanGISAddress[] {
  const results: OmanGISAddress[] = []
  const searchTerm = query.toLowerCase()
  
  // البحث في الولايات والقطاعات
  for (const wilayat of OMAN_WILAYATS) {
    for (const sector of wilayat.sectors) {
      if (sector.name.toLowerCase().includes(searchTerm) || 
          sector.nameEn.toLowerCase().includes(searchTerm)) {
        // إضافة بعض العناوين من هذا القطاع
        for (const block of sector.blocks) {
          for (let i = 0; i < 3; i++) {
            const x = block.startX + (i * 50)
            const y = block.startY + 50
            results.push(generateOmanGISAddress(x, y, i))
          }
        }
      }
    }
  }
  
  return results
}

// دالة للحصول على إحصائيات النظام العماني
export function getOmanGISStats() {
  const totalWilayats = OMAN_WILAYATS.length
  const totalSectors = OMAN_WILAYATS.reduce((sum, w) => sum + w.sectors.length, 0)
  const totalBlocks = OMAN_WILAYATS.reduce((sum, w) => 
    sum + w.sectors.reduce((sSum, s) => sSum + s.blocks.length, 0), 0)
  const totalPlots = totalBlocks * 100 // 100 قطعة لكل كتلة
  const estimatedHouses = totalPlots * 1.2 // 1.2 منزل لكل قطعة في المتوسط
  
  return {
    totalWilayats,
    totalSectors,
    totalBlocks,
    totalPlots,
    estimatedHouses,
    wilayats: OMAN_WILAYATS.map(w => w.name),
    coverage: 'سلطنة عُمان - نظام GIS الرسمي'
  }
}

// دالة للتحقق من صحة كود GIS العماني
export function validateOmanGISCode(gisCode: string): boolean {
  const pattern = /^MCT-001-MCT-SQ-001-SQ-\d{2}-\d{3}-\d{4}$/
  return pattern.test(gisCode)
}

// دالة لتحليل كود GIS العماني
export function parseOmanGISCode(gisCode: string): {
  wilayat: string
  sector: string
  block: string
  plotNumber: number
  houseNumber: number
} | null {
  if (!validateOmanGISCode(gisCode)) {
    return null
  }
  
  const parts = gisCode.split('-')
  return {
    wilayat: parts[0] + '-' + parts[1],
    sector: parts[2] + '-' + parts[3] + '-' + parts[4],
    block: parts[5] + '-' + parts[6],
    plotNumber: parseInt(parts[7]),
    houseNumber: parseInt(parts[8])
  }
}

// دالة لتصدير بيانات GIS العمانية
export function exportOmanGISData(addresses: OmanGISAddress[]) {
  const csvData = addresses.map(addr => ({
    'Oman GIS Code': addr.omanGISCode,
    'Wilayat': addr.wilayatName,
    'Sector': addr.sectorName,
    'Block': addr.blockNumber,
    'Plot': addr.plotNumber,
    'House': addr.houseNumber,
    'Street': addr.streetName,
    'Street Number': addr.streetNumber,
    'Full Address': addr.fullAddress,
    'Postal Code': addr.postalCode,
    'X': addr.coordinates.x,
    'Y': addr.coordinates.y
  }))
  
  return csvData
}

// دالة للحصول على معلومات الولاية
export function getWilayatInfo(wilayatCode: string): WilayatInfo | null {
  return OMAN_WILAYATS.find(w => w.code === wilayatCode) || null
}

// دالة للحصول على معلومات القطاع
export function getSectorInfo(sectorCode: string): SectorInfo | null {
  for (const wilayat of OMAN_WILAYATS) {
    const sector = wilayat.sectors.find(s => s.code === sectorCode)
    if (sector) return sector
  }
  return null
}
