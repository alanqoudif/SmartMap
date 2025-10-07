import { DrawingTool } from '../../types'

interface ToolBarProps {
  selectedTool: DrawingTool
  onToolSelect: (tool: DrawingTool) => void
  onExport: () => void
  onClear: () => void
  showWater: boolean
  onToggleWater: () => void
  showBuildings: boolean
  onToggleBuildings: () => void
}

const tools: { tool: DrawingTool; label: string; icon: string; color: string }[] = [
  { tool: 'select', label: 'اختيار', icon: '↖', color: 'bg-gray-100' },
  { tool: 'wall', label: 'جدار', icon: '▬', color: 'bg-gray-600' },
  { tool: 'path', label: 'ممر', icon: '◊', color: 'bg-green-500' },
  { tool: 'door', label: 'مدخل', icon: '◈', color: 'bg-blue-500' },
  { tool: 'kiosk', label: 'كشك', icon: '■', color: 'bg-orange-500' },
  { tool: 'plot', label: 'قطعة أرض', icon: '▭', color: 'bg-purple-500' },
  { tool: 'water', label: 'ماء', icon: '💧', color: 'bg-cyan-500' },
  { tool: 'delete', label: 'حذف', icon: '✕', color: 'bg-red-500' }
]

export default function ToolBar({ selectedTool, onToolSelect, onExport, onClear, showWater, onToggleWater, showBuildings, onToggleBuildings }: ToolBarProps) {
  return (
    <div className="w-60 h-full bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">عُنْوَنِي</h1>
        <p className="text-sm text-gray-600">خريطة العناوين التفاعلية</p>
      </div>

      {/* Tools */}
      <div className="flex-1 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">أدوات الرسم</h3>
        <div className="grid grid-cols-2 gap-2">
          {tools.map(({ tool, label, icon, color }) => (
            <button
              key={tool}
              onClick={() => onToolSelect(tool)}
              className={`tool-button flex flex-col items-center p-3 ${
                selectedTool === tool ? 'active' : ''
              }`}
              aria-label={`أداة ${label}`}
              title={`اختر أداة ${label} (${tool === 'select' ? '1' : tool === 'wall' ? '2' : tool === 'path' ? '3' : tool === 'door' ? '4' : tool === 'kiosk' ? '5' : tool === 'plot' ? '6' : 'Delete'})`}
            >
              <div className={`w-8 h-8 rounded ${color} flex items-center justify-center text-white text-lg mb-1`}>
                {icon}
              </div>
              <span className="text-xs text-gray-700">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <button
          onClick={onToggleWater}
          className={`w-full py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 ${
            showWater 
              ? 'bg-cyan-500 hover:bg-cyan-600 text-white' 
              : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
          }`}
        >
          <span>💧</span>
          <span>{showWater ? 'إخفاء الماء' : 'إظهار الماء'}</span>
        </button>
        <button
          onClick={onToggleBuildings}
          className={`w-full py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 ${
            showBuildings 
              ? 'bg-blue-500 hover:bg-blue-600 text-white' 
              : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
          }`}
        >
          <span>🏢</span>
          <span>{showBuildings ? 'إخفاء المباني' : 'إظهار المباني'}</span>
        </button>
        <button
          onClick={onExport}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <span>📷</span>
          <span>حفظ صورة</span>
        </button>
        <button
          onClick={onClear}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <span>🗑️</span>
          <span>مسح الكل</span>
        </button>
      </div>

      {/* Instructions */}
      <div className="p-4 border-t border-gray-200">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">تعليمات الاستخدام:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• اختر أداة من الأعلى</li>
          <li>• ارسم على الخريطة</li>
          <li>• استخدم عجلة الماوس للتكبير</li>
          <li>• اسحب للتنقل</li>
        </ul>
      </div>
    </div>
  )
}
