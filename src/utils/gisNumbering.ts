// نظام ترقيم GIS للبيوت - مثل الأنظمة الحقيقية
export interface GISAddress {
  blockNumber: string
  plotNumber: string
  houseNumber: string
  streetName: string
  sector: string
  coordinates: {
    x: number
    y: number
    lat?: number
    lng?: number
  }
  fullAddress: string
  gisCode: string
}

export interface BlockInfo {
  id: string
  name: string
  sector: string
  startX: number
  startY: number
  endX: number
  endY: number
  streetNames: string[]
}

// تعريف الكتل والأحياء في مدينة سلطان قابوس
export const SULTAN_QABOOS_BLOCKS: BlockInfo[] = [
  {
    id: 'SQ-01',
    name: 'القطاع الأول',
    sector: 'A',
    startX: 100,
    startY: 100,
    endX: 400,
    endY: 300,
    streetNames: ['شارع سلطان قابوس', 'شارع الإنشراح', 'شارع 3019', 'شارع 3038']
  },
  {
    id: 'SQ-02',
    name: 'القطاع الثاني',
    sector: 'B',
    startX: 500,
    startY: 100,
    endX: 800,
    endY: 300,
    streetNames: ['شارع الإنشراح', 'شارع البشائر', 'شارع 2128', 'شارع 1936']
  },
  {
    id: 'SQ-03',
    name: 'القطاع الثالث',
    sector: 'C',
    startX: 100,
    startY: 400,
    endX: 400,
    endY: 600,
    streetNames: ['شارع البشائر', 'شارع 2133', 'شارع 2135', 'شارع 2122']
  },
  {
    id: 'SQ-04',
    name: 'القطاع الرابع',
    sector: 'D',
    startX: 500,
    startY: 400,
    endX: 800,
    endY: 600,
    streetNames: ['شارع البشائر', 'شارع 2124', 'شارع 2125', 'شارع 2114']
  }
]

// دالة لتوليد عنوان GIS بناءً على الموقع
export function generateGISAddress(x: number, y: number, houseIndex: number): GISAddress {
  // تحديد القطاع والكتلة
  const block = findBlockByCoordinates(x, y)
  
  // حساب رقم القطعة داخل الكتلة
  const plotNumber = calculatePlotNumber(x, y, block)
  
  // حساب رقم المنزل
  const houseNumber = calculateHouseNumber(x, y, block, houseIndex)
  
  // توليد اسم الشارع
  const streetName = getStreetName(x, y, block)
  
  // توليد كود GIS
  const gisCode = generateGISCode(block, plotNumber, houseNumber)
  
  // توليد العنوان الكامل
  const fullAddress = generateFullAddress(block, plotNumber, houseNumber, streetName)
  
  return {
    blockNumber: block.id,
    plotNumber: plotNumber.toString(),
    houseNumber: houseNumber.toString(),
    streetName,
    sector: block.sector,
    coordinates: { x, y },
    fullAddress,
    gisCode
  }
}

// دالة للعثور على الكتلة بناءً على الإحداثيات
function findBlockByCoordinates(x: number, y: number): BlockInfo {
  for (const block of SULTAN_QABOOS_BLOCKS) {
    if (x >= block.startX && x <= block.endX && y >= block.startY && y <= block.endY) {
      return block
    }
  }
  // افتراضي - القطاع الأول
  return SULTAN_QABOOS_BLOCKS[0]
}

// دالة لحساب رقم القطعة
function calculatePlotNumber(x: number, y: number, block: BlockInfo): number {
  const blockWidth = block.endX - block.startX
  const blockHeight = block.endY - block.startY
  
  // تقسيم الكتلة إلى شبكة 10x10
  const gridSize = 10
  const cellWidth = blockWidth / gridSize
  const cellHeight = blockHeight / gridSize
  
  const col = Math.floor((x - block.startX) / cellWidth)
  const row = Math.floor((y - block.startY) / cellHeight)
  
  // رقم القطعة = رقم الصف * 10 + رقم العمود + 1
  return row * gridSize + col + 1
}

// دالة لحساب رقم المنزل
function calculateHouseNumber(x: number, y: number, block: BlockInfo, houseIndex: number): number {
  // رقم المنزل = رقم القطعة * 100 + رقم تسلسلي
  const plotNumber = calculatePlotNumber(x, y, block)
  return plotNumber * 100 + (houseIndex % 10) + 1
}

// دالة لتوليد اسم الشارع
function getStreetName(x: number, y: number, block: BlockInfo): string {
  // تحديد الشارع بناءً على الموقع
  const blockWidth = block.endX - block.startX
  const blockHeight = block.endY - block.startY
  
  const relativeX = (x - block.startX) / blockWidth
  const relativeY = (y - block.startY) / blockHeight
  
  // الشوارع الرئيسية
  if (relativeY < 0.3) {
    return 'شارع سلطان قابوس'
  } else if (relativeY > 0.7) {
    return 'شارع البشائر'
  } else if (relativeX < 0.3) {
    return 'شارع الإنشراح'
  } else if (relativeX > 0.7) {
    return 'شارع الخارجية'
  }
  
  // الشوارع الفرعية
  const streetIndex = Math.floor(relativeX * 4)
  const streetNumbers = ['2128', '1936', '2133', '2135']
  return `شارع ${streetNumbers[streetIndex]}`
}

// دالة لتوليد كود GIS
function generateGISCode(block: BlockInfo, plotNumber: number, houseNumber: number): string {
  // تنسيق: SQ-SECTOR-PLOT-HOUSE
  return `SQ-${block.sector}-${plotNumber.toString().padStart(3, '0')}-${houseNumber.toString().padStart(4, '0')}`
}

// دالة لتوليد العنوان الكامل
function generateFullAddress(block: BlockInfo, plotNumber: number, houseNumber: number, streetName: string): string {
  return `مدينة سلطان قابوس، ${block.name}، ${streetName}، قطعة ${plotNumber}، منزل ${houseNumber}`
}

// دالة للبحث عن عنوان GIS
export function searchGISAddress(query: string): GISAddress[] {
  const results: GISAddress[] = []
  const searchTerm = query.toLowerCase()
  
  // البحث في الكتل
  for (const block of SULTAN_QABOOS_BLOCKS) {
    if (block.name.toLowerCase().includes(searchTerm) || 
        block.id.toLowerCase().includes(searchTerm)) {
      // إضافة بعض العناوين من هذه الكتلة
      for (let i = 0; i < 5; i++) {
        const x = block.startX + (i * 50)
        const y = block.startY + 50
        results.push(generateGISAddress(x, y, i))
      }
    }
  }
  
  return results
}

// دالة للحصول على إحصائيات GIS
export function getGISStats() {
  const totalBlocks = SULTAN_QABOOS_BLOCKS.length
  const totalPlots = totalBlocks * 100 // 100 قطعة لكل كتلة
  const estimatedHouses = totalPlots * 1.2 // 1.2 منزل لكل قطعة في المتوسط
  
  return {
    totalBlocks,
    totalPlots,
    estimatedHouses,
    sectors: SULTAN_QABOOS_BLOCKS.map(block => block.sector),
    coverage: 'مدينة سلطان قابوس - 100%'
  }
}

// دالة لتصدير بيانات GIS
export function exportGISData(addresses: GISAddress[]) {
  const csvData = addresses.map(addr => ({
    'GIS Code': addr.gisCode,
    'Block': addr.blockNumber,
    'Sector': addr.sector,
    'Plot': addr.plotNumber,
    'House': addr.houseNumber,
    'Street': addr.streetName,
    'Full Address': addr.fullAddress,
    'X': addr.coordinates.x,
    'Y': addr.coordinates.y
  }))
  
  return csvData
}

// دالة للتحقق من صحة عنوان GIS
export function validateGISAddress(gisCode: string): boolean {
  const pattern = /^SQ-[A-D]-\d{3}-\d{4}$/
  return pattern.test(gisCode)
}

// دالة لتحليل عنوان GIS
export function parseGISAddress(gisCode: string): {
  sector: string
  plotNumber: number
  houseNumber: number
} | null {
  if (!validateGISAddress(gisCode)) {
    return null
  }
  
  const parts = gisCode.split('-')
  return {
    sector: parts[1],
    plotNumber: parseInt(parts[2]),
    houseNumber: parseInt(parts[3])
  }
}
