import { createAvatar } from '@dicebear/core'
import { avataaars } from '@dicebear/collection'

export interface AvatarOptions {
  gender?: 'male' | 'female'
  style?: 'avataaars'
  seed?: string
}

export function generateAvatar(options: AvatarOptions = {}) {
  const { seed } = options
  
  const avatar = createAvatar(avataaars, {
    seed: seed || Math.random().toString(),
    backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf']
  })
  
  return avatar.toDataUri()
}

// دالة لتحديد الجنس من الاسم العربي
export function detectGenderFromArabicName(name: string): 'male' | 'female' {
  const maleNames = [
    'محمد', 'أحمد', 'علي', 'حسن', 'حسين', 'عبدالله', 'عبدالرحمن', 'عبدالعزيز', 'سعد', 'خالد',
    'عمر', 'يوسف', 'إبراهيم', 'عبدالله', 'محمود', 'طارق', 'سالم', 'راشد', 'سيف', 'هشام',
    'عبدالرحيم', 'عبدالكريم', 'عبداللطيف', 'عبدالمجيد', 'عبدالمنعم', 'عبدالوهاب', 'عبدالرزاق',
    'عبدالغني', 'عبدالفتاح', 'عبدالخالق', 'عبدالرحمن', 'عبدالسلام', 'عبدالستار', 'عبدالغفار',
    'عبدالرؤوف', 'عبدالبديع', 'عبدالبارئ', 'عبدالبر', 'عبدالبديع', 'عبدالبارئ', 'عبدالبر',
    'عبدالبديع', 'عبدالبارئ', 'عبدالبر', 'عبدالبديع', 'عبدالبارئ', 'عبدالبر'
  ]
  
  const femaleNames = [
    'فاطمة', 'عائشة', 'خديجة', 'مريم', 'زينب', 'رقية', 'أم كلثوم', 'صفية', 'حفصة', 'سودة',
    'أسماء', 'فاطمة', 'عائشة', 'خديجة', 'مريم', 'زينب', 'رقية', 'أم كلثوم', 'صفية', 'حفصة',
    'سودة', 'أسماء', 'فاطمة', 'عائشة', 'خديجة', 'مريم', 'زينب', 'رقية', 'أم كلثوم', 'صفية',
    'حفصة', 'سودة', 'أسماء', 'فاطمة', 'عائشة', 'خديجة', 'مريم', 'زينب', 'رقية', 'أم كلثوم',
    'صفية', 'حفصة', 'سودة', 'أسماء', 'فاطمة', 'عائشة', 'خديجة', 'مريم', 'زينب', 'رقية'
  ]
  
  const cleanName = name.trim().toLowerCase()
  
  // البحث في أسماء الذكور
  if (maleNames.some(maleName => cleanName.includes(maleName.toLowerCase()))) {
    return 'male'
  }
  
  // البحث في أسماء الإناث
  if (femaleNames.some(femaleName => cleanName.includes(femaleName.toLowerCase()))) {
    return 'female'
  }
  
  // إذا لم نجد الاسم، نرجع ذكر كافتراضي
  return 'male'
}

// دالة لإنشاء أفاتار بناءً على الاسم
export function generateAvatarFromName(name: string, style: 'avataaars' = 'avataaars') {
  const gender = detectGenderFromArabicName(name)
  return generateAvatar({ gender, style, seed: name })
}
