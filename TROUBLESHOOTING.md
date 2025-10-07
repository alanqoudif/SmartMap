# حل المشاكل - مشروع عُنْوَنِي

## 🚨 مشاكل شائعة وحلولها

### 1. خطأ "This page didn't load Google Maps correctly"

#### السبب:
- Google Maps API Key غير صحيح أو مفقود
- Google Maps JavaScript API غير مفعل
- قيود API Key غير صحيحة

#### الحل السريع:
```bash
# المشروع يعمل الآن مع الخريطة الافتراضية
# لا حاجة لـ Google Maps للاستخدام الأساسي
```

#### الحل الكامل (لتفعيل Google Maps):

**الخطوة 1: احصل على API Key**
1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. أنشئ مشروع جديد أو اختر مشروع موجود
3. فعّل "Maps JavaScript API"
4. أنشئ API Key من "Credentials"

**الخطوة 2: حدث الملفات**
```html
<!-- في index.html -->
<script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&libraries=geometry&callback=initMap"></script>
```

```typescript
// في src/config/googleMaps.ts
export const GOOGLE_MAPS_CONFIG = {
  API_KEY: 'YOUR_ACTUAL_API_KEY', // استبدل هذا
  // ...
}
```

**الخطوة 3: أعد تشغيل المشروع**
```bash
bun run dev
```

### 2. الخريطة الافتراضية لا تظهر

#### السبب:
- مشكلة في Canvas
- خطأ في JavaScript

#### الحل:
```bash
# امسح cache المتصفح
# أو استخدم Ctrl+Shift+R (Windows) أو Cmd+Shift+R (Mac)
```

### 3. البحث لا يعمل

#### السبب:
- مشكلة في تحميل البيانات
- خطأ في البحث

#### الحل:
1. تحقق من Console للأخطاء
2. جرب أرقام أخرى (23, 45, 67)
3. تأكد من كتابة رقم صحيح

### 4. الأدوات لا تعمل

#### السبب:
- لم يتم اختيار أداة
- مشكلة في Canvas events

#### الحل:
1. اختر أداة من الشريط الجانبي أولاً
2. جرب النقر في مكان مختلف
3. استخدم اختصارات لوحة المفاتيح (1, 2, 3, 4, 5, 6)

### 5. التصدير لا يعمل

#### السبب:
- html2canvas لم يتم تحميله
- لا توجد عناصر للتصدير

#### الحل:
1. تأكد من وجود عناصر على الخريطة
2. جرب تصدير خريطة Google
3. تحقق من Console للأخطاء

### 6. المشروع لا يبدأ

#### السبب:
- Bun غير مثبت
- مشكلة في التبعيات

#### الحل:
```bash
# تثبيت Bun
curl -fsSL https://bun.sh/install | bash

# إضافة Bun إلى PATH
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# تثبيت التبعيات
bun install

# تشغيل المشروع
bun run dev
```

### 7. مشاكل الأداء

#### السبب:
- الكثير من العناصر
- مشاكل في الذاكرة

#### الحل:
1. امسح العناصر غير المرغوب فيها
2. أعد تحميل الصفحة
3. استخدم "مسح الكل" لإعادة البدء

## 🔧 أدوات التشخيص

### 1. فحص Console
```javascript
// افتح Developer Tools (F12)
// اذهب إلى Console
// ابحث عن الأخطاء الحمراء
```

### 2. فحص Network
```javascript
// في Developer Tools
// اذهب إلى Network
// تأكد من تحميل جميع الملفات
```

### 3. فحص localStorage
```javascript
// في Console
console.log('User Map:', localStorage.getItem('userMap'));
console.log('House Notes:', localStorage.getItem('houseNotes'));
```

## 📞 الحصول على المساعدة

### 1. تحقق من الملفات
- `README.md` - دليل شامل
- `QUICK_START.md` - بدء سريع
- `GOOGLE_MAPS_SETUP.md` - إعداد Google Maps

### 2. خطوات التشخيص
1. افتح Developer Tools (F12)
2. اذهب إلى Console
3. ابحث عن الأخطاء
4. راجع هذا الدليل

### 3. إعادة تعيين المشروع
```bash
# امسح localStorage
# في Console
localStorage.clear();

# أعد تحميل الصفحة
location.reload();
```

## ✅ التحقق من صحة المشروع

### 1. اختبارات أساسية
- [ ] المشروع يبدأ بدون أخطاء
- [ ] الخريطة الافتراضية تظهر
- [ ] البحث يعمل
- [ ] الأدوات تعمل
- [ ] التصدير يعمل

### 2. اختبارات متقدمة
- [ ] Google Maps يعمل (إذا تم إعداد API Key)
- [ ] التبديل بين الخرائط يعمل
- [ ] البيانات تُحفظ في localStorage
- [ ] التصميم متجاوب

## 🆘 إذا لم تحل المشكلة

1. **انسخ رسالة الخطأ** من Console
2. **اذكر الخطوات** التي قمت بها
3. **اذكر المتصفح** والإصدار
4. **اذكر نظام التشغيل**

---

**نصيحة**: معظم المشاكل تحل بإعادة تحميل الصفحة أو مسح cache المتصفح! 🔄
