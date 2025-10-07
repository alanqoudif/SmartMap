import { House } from '../types'
import muscatHousesData from '../data/muscat-houses-complete.json'

const muscatHouses = muscatHousesData as House[]

export interface IDHouseMapping {
  civilNumber: string
  houseId: string
  name: string
  avatar: string
  assignedDate: string
}

// قاعدة بيانات ربط الأرقام المدنية بالمنازل
let idHouseMappings: IDHouseMapping[] = []

// دالة لربط رقم مدني بمنزل
export function assignHouseToID(
  civilNumber: string, 
  name: string, 
  avatar: string,
  houseId?: string
): IDHouseMapping | null {
  // إذا لم يتم تحديد منزل، نختار واحد عشوائياً
  if (!houseId) {
    const availableHouses = muscatHouses.filter((house: House) => 
      !idHouseMappings.some(mapping => mapping.houseId === house.id)
    )
    
    if (availableHouses.length === 0) {
      console.warn('لا توجد منازل متاحة للربط')
      return null
    }
    
    houseId = availableHouses[Math.floor(Math.random() * availableHouses.length)].id
  }
  
  // التحقق من أن المنزل موجود
  const house = muscatHouses.find((h: House) => h.id === houseId)
  if (!house) {
    console.error('المنزل المحدد غير موجود')
    return null
  }
  
  // التحقق من أن الرقم المدني غير مربوط مسبقاً
  const existingMapping = idHouseMappings.find(mapping => mapping.civilNumber === civilNumber)
  if (existingMapping) {
    console.warn('الرقم المدني مربوط مسبقاً بمنزل آخر')
    return existingMapping
  }
  
  // إنشاء الربط الجديد
  const newMapping: IDHouseMapping = {
    civilNumber,
    houseId,
    name,
    avatar,
    assignedDate: new Date().toISOString()
  }
  
  idHouseMappings.push(newMapping)
  
  // حفظ في localStorage
  saveMappingsToStorage()
  
  return newMapping
}

// دالة للبحث عن منزل بالرقم المدني
export function findHouseByCivilNumber(civilNumber: string): {
  house: House | null
  mapping: IDHouseMapping | null
} {
  const mapping = idHouseMappings.find(m => m.civilNumber === civilNumber)
  
  if (!mapping) {
    return { house: null, mapping: null }
  }
  
  const house = muscatHouses.find((h: House) => h.id === mapping.houseId)
  
  return { house: house || null, mapping }
}

// دالة للحصول على جميع الربطات
export function getAllMappings(): IDHouseMapping[] {
  return [...idHouseMappings]
}

// دالة لحذف ربط
export function removeMapping(civilNumber: string): boolean {
  const index = idHouseMappings.findIndex(mapping => mapping.civilNumber === civilNumber)
  
  if (index === -1) {
    return false
  }
  
  idHouseMappings.splice(index, 1)
  saveMappingsToStorage()
  
  return true
}

// دالة لتحديث ربط
export function updateMapping(
  civilNumber: string, 
  newHouseId: string
): IDHouseMapping | null {
  const mapping = idHouseMappings.find(m => m.civilNumber === civilNumber)
  
  if (!mapping) {
    return null
  }
  
  // التحقق من أن المنزل الجديد موجود
  const house = muscatHouses.find((h: House) => h.id === newHouseId)
  if (!house) {
    console.error('المنزل المحدد غير موجود')
    return null
  }
  
  mapping.houseId = newHouseId
  mapping.assignedDate = new Date().toISOString()
  
  saveMappingsToStorage()
  
  return mapping
}

// دالة للحصول على إحصائيات الربط
export function getMappingStats() {
  const totalHouses = muscatHouses.length
  const assignedHouses = idHouseMappings.length
  const availableHouses = totalHouses - assignedHouses
  
  return {
    totalHouses,
    assignedHouses,
    availableHouses,
    assignmentRate: totalHouses > 0 ? (assignedHouses / totalHouses) * 100 : 0
  }
}

// دالة للحصول على المنازل المتاحة
export function getAvailableHouses(): House[] {
  const assignedHouseIds = idHouseMappings.map(mapping => mapping.houseId)
  return muscatHouses.filter(house => !assignedHouseIds.includes(house.id))
}

// دالة للحصول على المنازل المربوطة
export function getAssignedHouses(): Array<{ house: House; mapping: IDHouseMapping }> {
  return idHouseMappings.map(mapping => {
    const house = muscatHouses.find((h: House) => h.id === mapping.houseId)
    return { house: house!, mapping }
  }).filter(item => item.house)
}

// حفظ الربطات في localStorage
function saveMappingsToStorage() {
  try {
    localStorage.setItem('idHouseMappings', JSON.stringify(idHouseMappings))
  } catch (error) {
    console.error('خطأ في حفظ الربطات:', error)
  }
}

// تحميل الربطات من localStorage
function loadMappingsFromStorage() {
  try {
    const stored = localStorage.getItem('idHouseMappings')
    if (stored) {
      idHouseMappings = JSON.parse(stored)
    }
  } catch (error) {
    console.error('خطأ في تحميل الربطات:', error)
    idHouseMappings = []
  }
}

// تحميل الربطات عند بدء التطبيق
loadMappingsFromStorage()

// دالة لإعادة تعيين جميع الربطات (للتطوير)
export function resetAllMappings() {
  idHouseMappings = []
  saveMappingsToStorage()
}

// دالة لإنشاء ربطات عشوائية للاختبار
export function createRandomMappings(count: number = 10) {
  const availableHouses = getAvailableHouses()
  const names = [
    'محمد أحمد', 'فاطمة علي', 'عبدالله حسن', 'مريم سالم', 'خالد راشد',
    'عائشة محمود', 'سعد يوسف', 'زينب عمر', 'طارق إبراهيم', 'رقية عبدالرحمن'
  ]
  
  for (let i = 0; i < Math.min(count, availableHouses.length, names.length); i++) {
    const name = names[i]
    const house = availableHouses[i] as House
    
    // توليد رقم مدني وهمي
    const civilNumber = `${1980 + i}${String(i + 1).padStart(2, '0')}${String(i + 1).padStart(2, '0')}-${String(i + 1).padStart(5, '0')}`
    
    // توليد أفاتار
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
    
    assignHouseToID(civilNumber, name, avatar, house.id)
  }
}
