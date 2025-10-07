# إعداد Google Maps API - مشروع عُنْوَنِي

## 📋 المتطلبات

1. حساب Google Cloud Platform
2. تفعيل Google Maps JavaScript API
3. إنشاء API Key

## 🚀 خطوات الإعداد

### 1. إنشاء حساب Google Cloud Platform
1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. سجل الدخول بحساب Google
3. أنشئ مشروع جديد أو اختر مشروع موجود

### 2. تفعيل Google Maps JavaScript API
1. في Google Cloud Console، اذهب إلى "APIs & Services" > "Library"
2. ابحث عن "Maps JavaScript API"
3. اضغط "Enable"

### 3. إنشاء API Key
1. اذهب إلى "APIs & Services" > "Credentials"
2. اضغط "Create Credentials" > "API Key"
3. انسخ API Key

### 4. تكوين API Key
1. اضغط على API Key لتحريره
2. في "Application restrictions"، اختر "HTTP referrers"
3. أضف النطاقات المسموحة:
   - `localhost:3000/*`
   - `127.0.0.1:3000/*`
   - نطاق الإنتاج الخاص بك

### 5. تحديث المشروع

#### أ) تحديث index.html
```html
<script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&libraries=geometry&callback=initMap"></script>
```

#### ب) تحديث src/config/googleMaps.ts
```typescript
export const GOOGLE_MAPS_CONFIG = {
  API_KEY: 'YOUR_ACTUAL_API_KEY', // استبدل هذا بـ API Key الحقيقي
  // ... باقي الإعدادات
}
```

## 🔧 إعدادات متقدمة

### تقييد API Key (اختياري)
```javascript
// في Google Cloud Console
Application restrictions:
- HTTP referrers: localhost:3000/*, yourdomain.com/*

API restrictions:
- Maps JavaScript API
- Places API (إذا كنت تريد استخدامه)
```

### إعدادات الخريطة
```typescript
// في src/config/googleMaps.ts
MAP_OPTIONS: {
  zoom: 15,
  center: {
    lat: 23.6141, // مركز منطقة السلطان قابوس
    lng: 58.5922
  },
  mapTypeId: 'roadmap',
  styles: [
    // إعدادات التصميم المخصص
  ]
}
```

## 🧪 اختبار الإعداد

### 1. اختبار محلي
```bash
bun run dev
# افتح http://localhost:3000
# تأكد من ظهور خريطة Google
```

### 2. اختبار API Key
```javascript
// افتح Developer Console
console.log('Google Maps loaded:', !!window.google);
```

### 3. اختبار العلامات
- تأكد من ظهور نقاط البيوت
- اختبر النقر على العلامات
- تأكد من ظهور نافذة المعلومات

## 🚨 استكشاف الأخطاء

### خطأ: "Google Maps API key missing"
- تأكد من إضافة API Key في index.html
- تأكد من تفعيل Maps JavaScript API

### خطأ: "This page can't load Google Maps correctly"
- تأكد من إعدادات Application restrictions
- تأكد من إضافة النطاق الصحيح

### خطأ: "Quota exceeded"
- تحقق من حدود الاستخدام في Google Cloud Console
- فكر في ترقية الخطة

### الخريطة لا تظهر
- تحقق من اتصال الإنترنت
- تأكد من صحة API Key
- تحقق من Console للأخطاء

## 💰 التكلفة

### الخطة المجانية
- 28,000 تحميل خريطة شهرياً
- 40,000 طلب Places API شهرياً

### الدفع حسب الاستخدام
- $7 لكل 1000 تحميل خريطة إضافي
- $17 لكل 1000 طلب Places API إضافي

## 🔒 الأمان

### نصائح الأمان
1. لا تضع API Key في الكود العام
2. استخدم متغيرات البيئة
3. قيد API Key بالنطاقات المحددة
4. راقب الاستخدام بانتظام

### متغيرات البيئة (اختياري)
```bash
# .env.local
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

```typescript
// في الكود
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
```

## 📚 موارد إضافية

- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Maps API Pricing](https://developers.google.com/maps/billing-and-pricing)
- [API Key Best Practices](https://developers.google.com/maps/api-key-best-practices)

## 🆘 الدعم

إذا واجهت مشاكل:
1. تحقق من Console للأخطاء
2. راجع هذا الدليل
3. تحقق من Google Cloud Console
4. ابحث في Google Maps Documentation

---

**ملاحظة**: تأكد من استبدال `YOUR_ACTUAL_API_KEY` بـ API Key الحقيقي قبل النشر!
