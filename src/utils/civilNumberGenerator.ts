// نظام توليد الأرقام المدنية العمانية
// تنسيق الرقم المدني العماني: YYYYMMDD-XXXXX
// حيث YYYYMMDD هو تاريخ الميلاد و XXXXX هو رقم تسلسلي

export interface CivilNumberData {
  civilNumber: string
  birthDate: string
  serialNumber: string
  gender: 'male' | 'female'
}

// دالة لتوليد رقم مدني عماني
export function generateOmaniCivilNumber(
  name: string, 
  gender?: 'male' | 'female',
  birthYear?: number
): CivilNumberData {
  // تحديد الجنس إذا لم يتم توفيره
  const detectedGender = gender || detectGenderFromName(name)
  
  // توليد تاريخ ميلاد عشوائي إذا لم يتم توفيره
  const year = birthYear || generateRandomBirthYear()
  const month = Math.floor(Math.random() * 12) + 1
  const day = Math.floor(Math.random() * 28) + 1 // استخدام 28 لتجنب مشاكل فبراير
  
  // تنسيق التاريخ
  const birthDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
  
  // توليد الرقم التسلسلي (5 أرقام)
  const serialNumber = Math.floor(Math.random() * 100000).toString().padStart(5, '0')
  
  // تكوين الرقم المدني
  const civilNumber = `${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}-${serialNumber}`
  
  return {
    civilNumber,
    birthDate,
    serialNumber,
    gender: detectedGender
  }
}

// دالة لتوليد سنة ميلاد عشوائية (18-65 سنة)
function generateRandomBirthYear(): number {
  const currentYear = new Date().getFullYear()
  const minYear = currentYear - 65
  const maxYear = currentYear - 18
  return Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear
}

// دالة لتحديد الجنس من الاسم (مبسطة)
function detectGenderFromName(name: string): 'male' | 'female' {
  const maleNames = [
    'محمد', 'أحمد', 'علي', 'حسن', 'حسين', 'عبدالله', 'عبدالرحمن', 'عبدالعزيز', 'سعد', 'خالد',
    'عمر', 'يوسف', 'إبراهيم', 'محمود', 'طارق', 'سالم', 'راشد', 'سيف', 'هشام', 'عبدالرحيم',
    'عبدالكريم', 'عبداللطيف', 'عبدالمجيد', 'عبدالمنعم', 'عبدالوهاب', 'عبدالرزاق', 'عبدالغني',
    'عبدالفتاح', 'عبدالخالق', 'عبدالرحمن', 'عبدالسلام', 'عبدالستار', 'عبدالغفار', 'عبدالرؤوف'
  ]
  
  const femaleNames = [
    'فاطمة', 'عائشة', 'خديجة', 'مريم', 'زينب', 'رقية', 'أم كلثوم', 'صفية', 'حفصة', 'سودة',
    'أسماء', 'فاطمة', 'عائشة', 'خديجة', 'مريم', 'زينب', 'رقية', 'أم كلثوم', 'صفية', 'حفصة',
    'سودة', 'أسماء', 'فاطمة', 'عائشة', 'خديجة', 'مريم', 'زينب', 'رقية', 'أم كلثوم', 'صفية'
  ]
  
  const cleanName = name.trim().toLowerCase()
  
  if (maleNames.some(maleName => cleanName.includes(maleName.toLowerCase()))) {
    return 'male'
  }
  
  if (femaleNames.some(femaleName => cleanName.includes(femaleName.toLowerCase()))) {
    return 'female'
  }
  
  return 'male' // افتراضي
}

// دالة للتحقق من صحة الرقم المدني
export function validateCivilNumber(civilNumber: string): boolean {
  // تنسيق الرقم المدني: YYYYMMDD-XXXXX
  const pattern = /^\d{8}-\d{5}$/
  if (!pattern.test(civilNumber)) {
    return false
  }
  
  const [datePart] = civilNumber.split('-')
  const year = parseInt(datePart.substring(0, 4))
  const month = parseInt(datePart.substring(4, 6))
  const day = parseInt(datePart.substring(6, 8))
  
  // التحقق من صحة التاريخ
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return false
  }
  
  // التحقق من أن السنة منطقية (1900-2024)
  if (year < 1900 || year > 2024) {
    return false
  }
  
  return true
}

// دالة لاستخراج معلومات من الرقم المدني
export function parseCivilNumber(civilNumber: string): CivilNumberData | null {
  if (!validateCivilNumber(civilNumber)) {
    return null
  }
  
  const [datePart, serialPart] = civilNumber.split('-')
  const year = parseInt(datePart.substring(0, 4))
  const month = parseInt(datePart.substring(4, 6))
  const day = parseInt(datePart.substring(6, 8))
  
  return {
    civilNumber,
    birthDate: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
    serialNumber: serialPart,
    gender: 'male' // لا يمكن تحديد الجنس من الرقم المدني وحده
  }
}
