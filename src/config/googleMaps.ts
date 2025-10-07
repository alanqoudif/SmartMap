// Google Maps Configuration
export const GOOGLE_MAPS_CONFIG = {
  // يمكنك الحصول على API Key من: https://console.cloud.google.com/
  API_KEY: 'YOUR_GOOGLE_MAPS_API_KEY', // استبدل هذا بـ API Key الحقيقي
  
  // إعدادات الخريطة
  MAP_OPTIONS: {
    zoom: 15,
    center: {
      lat: 23.6141, // مركز منطقة السلطان قابوس
      lng: 58.5922
    },
    mapTypeId: 'roadmap',
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'transit',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'administrative',
        elementType: 'labels',
        stylers: [{ visibility: 'on' }]
      }
    ]
  },

  // إعدادات العلامات
  MARKER_OPTIONS: {
    default: {
      path: 'CIRCLE',
      scale: 8,
      fillColor: '#4285f4',
      fillOpacity: 0.8,
      strokeColor: '#ffffff',
      strokeWeight: 2
    },
    selected: {
      path: 'CIRCLE',
      scale: 10,
      fillColor: '#ff0000',
      fillOpacity: 0.9,
      strokeColor: '#ffffff',
      strokeWeight: 3
    }
  },

  // إعدادات نافذة المعلومات
  INFO_WINDOW_OPTIONS: {
    maxWidth: 300,
    pixelOffset: { width: 0, height: -30 }
  }
}

// رسائل الخطأ
export const ERROR_MESSAGES = {
  API_KEY_MISSING: 'مفتاح Google Maps API مفقود. يرجى إضافة API Key صحيح.',
  MAP_LOAD_FAILED: 'فشل في تحميل خريطة Google Maps.',
  GEOLOCATION_FAILED: 'فشل في الحصول على الموقع الحالي.'
}

// وظائف مساعدة
export const mapUtils = {
  // تحويل الإحداثيات الافتراضية إلى إحداثيات حقيقية
  convertToRealCoordinates: (x: number, y: number) => {
    const center = GOOGLE_MAPS_CONFIG.MAP_OPTIONS.center
    const offsetX = 0.001 // درجة لكل 100 متر تقريباً
    const offsetY = 0.001
    
    return {
      lat: center.lat + (y - 500) * offsetY,
      lng: center.lng + (x - 500) * offsetX
    }
  },

  // تحويل الإحداثيات الحقيقية إلى إحداثيات افتراضية
  convertToVirtualCoordinates: (lat: number, lng: number) => {
    const center = GOOGLE_MAPS_CONFIG.MAP_OPTIONS.center
    const offsetX = 0.001
    const offsetY = 0.001
    
    return {
      x: 500 + (lng - center.lng) / offsetX,
      y: 500 + (lat - center.lat) / offsetY
    }
  },

  // حساب المسافة بين نقطتين
  calculateDistance: (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371 // نصف قطر الأرض بالكيلومتر
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }
}
