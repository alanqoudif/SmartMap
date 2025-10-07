import React, { useState } from 'react'
import { exportMapAsPNG } from '../../utils/exportPNG'

interface ExportButtonProps {
  onExport: () => void
}

export default function ExportButton({ onExport }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      await exportMapAsPNG('map-container', `omana-map-${new Date().toISOString().split('T')[0]}.png`)
      onExport()
    } catch (error) {
      console.error('Export failed:', error)
      alert('فشل في تصدير الصورة. يرجى المحاولة مرة أخرى.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
    >
      {isExporting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>جاري التصدير...</span>
        </>
      ) : (
        <>
          <span>📷</span>
          <span>حفظ صورة الخريطة</span>
        </>
      )}
    </button>
  )
}
