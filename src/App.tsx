import { useState, useCallback } from 'react'
import OpenStreetMap from './components/OpenStreetMap/OpenStreetMap'
import ToolBar from './components/ToolBar/ToolBar'
import SearchBox from './components/SearchBox/SearchBox'
import HouseViewer from './components/HouseViewer/HouseViewer'
import { IDSystem } from './components/IDSystem/IDSystem'
import { MapState, DrawingTool, House, WaterFeature } from './types'
import { BuildingData } from './utils/overpassAPI'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import muscatHouses from './data/muscat-houses-complete.json'
import muscatWater from './data/muscat-water.json'

const initialMapState: MapState = {
  zoom: 1,
  panX: 0,
  panY: 0,
  selectedTool: 'select',
  selectedElement: null,
  isDrawing: false,
  currentPath: []
}

export default function App() {
  const [mapState, setMapState] = useState<MapState>(initialMapState)
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null)
  const [isHouseViewerOpen, setIsHouseViewerOpen] = useState(false)
  // إزالة mapType - سنستخدم OpenStreetMap فقط
  const [showBuildings, setShowBuildings] = useState(true)
  const [currentView, setCurrentView] = useState<'map' | 'id-system'>('map')
  const houses = muscatHouses as House[]
  const waterFeatures = muscatWater as WaterFeature[]

  const handleToolSelect = useCallback((tool: DrawingTool) => {
    setMapState(prev => ({
      ...prev,
      selectedTool: tool,
      selectedElement: null,
      isDrawing: false,
      currentPath: []
    }))
  }, [])


  const handleHouseSelect = useCallback((house: House) => {
    setSelectedHouse(house)
    setIsHouseViewerOpen(true)
    
    // يمكن إضافة منطق للانتقال إلى موقع المنزل هنا لاحقاً
  }, [])

  const handleMapClick = useCallback((lat: number, lng: number) => {
    // إضافة بيت جديد عند النقر على الخريطة
    const newHouse: House = {
      id: `new-${Date.now()}`,
      houseNo: Math.floor(Math.random() * 1000) + 1,
      plotNo: Math.floor(Math.random() * 500) + 1,
      area: 'منطقة جديدة',
      x: 0, // سيتم حسابها لاحقاً
      y: 0, // سيتم حسابها لاحقاً
      areaM2: 300 + Math.floor(Math.random() * 300),
      rooms: 2 + Math.floor(Math.random() * 4),
      lat,
      lng
    }
    
    // يمكن إضافة منطق لحفظ البيت الجديد هنا
    console.log('New house added:', newHouse)
  }, [])

  const handleExport = useCallback(() => {
    console.log('Map exported successfully!')
  }, [])

  const handleClear = useCallback(() => {
    if (window.confirm('هل أنت متأكد من مسح جميع العناصر؟')) {
      console.log('تم مسح العناصر')
    }
  }, [])

  const handleCloseHouseViewer = useCallback(() => {
    setIsHouseViewerOpen(false)
    setSelectedHouse(null)
  }, [])


  const handleToggleBuildings = useCallback(() => {
    setShowBuildings(prev => !prev)
  }, [])

  const handleBuildingSelect = useCallback((building: BuildingData) => {
    console.log('تم اختيار مبنى:', building)
  }, [])

  const handleIDSystemHouseSelect = useCallback((house: House) => {
    setSelectedHouse(house)
    setIsHouseViewerOpen(true)
    setCurrentView('map') // العودة إلى الخريطة
  }, [])

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onToolSelect: handleToolSelect,
    onExport: handleExport,
    onClear: handleClear
  })

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Navigation Header */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 p-4">
        <div className="flex justify-center">
          <div className="bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setCurrentView('map')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                currentView === 'map'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              الخريطة الذكية
            </button>
            <button
              onClick={() => setCurrentView('id-system')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                currentView === 'id-system'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              نظام البطاقة الشخصية
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {currentView === 'map' ? (
        <>
          {/* Toolbar - Hidden on mobile */}
          <div className="hidden md:block mt-16">
            <ToolBar
              selectedTool={mapState.selectedTool}
              onToolSelect={handleToolSelect}
              onExport={handleExport}
              onClear={handleClear}
              showBuildings={showBuildings}
              onToggleBuildings={handleToggleBuildings}
            />
          </div>

          {/* Map Content */}
          <div className="flex-1 flex flex-col mt-16">
            {/* Search Bar */}
            <div className="bg-white border-b border-gray-200 p-4">
              <SearchBox onHouseSelect={handleHouseSelect} />
            </div>

            {/* Map Container */}
            <div id="map-container" className="flex-1 relative">
              {/* OpenStreetMap - الخريطة الوحيدة */}
              <OpenStreetMap
                houses={houses}
                onHouseSelect={handleHouseSelect}
                onMapClick={handleMapClick}
                selectedHouse={selectedHouse}
                waterFeatures={waterFeatures}
                showBuildings={showBuildings}
                onBuildingSelect={handleBuildingSelect}
              />
            </div>

            {/* Mobile Toolbar */}
            <div className="md:hidden bg-white border-t border-gray-200 p-2">
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => handleToolSelect('select')}
                  className={`p-2 rounded ${mapState.selectedTool === 'select' ? 'bg-blue-100' : 'bg-gray-100'}`}
                >
                  ↖
                </button>
                <button
                  onClick={() => handleToolSelect('wall')}
                  className={`p-2 rounded ${mapState.selectedTool === 'wall' ? 'bg-blue-100' : 'bg-gray-100'}`}
                >
                  ▬
                </button>
                <button
                  onClick={() => handleToolSelect('path')}
                  className={`p-2 rounded ${mapState.selectedTool === 'path' ? 'bg-blue-100' : 'bg-gray-100'}`}
                >
                  ◊
                </button>
                <button
                  onClick={() => handleToolSelect('plot')}
                  className={`p-2 rounded ${mapState.selectedTool === 'plot' ? 'bg-blue-100' : 'bg-gray-100'}`}
                >
                  ▭
                </button>
                <button
                  onClick={() => handleToolSelect('water')}
                  className={`p-2 rounded ${mapState.selectedTool === 'water' ? 'bg-blue-100' : 'bg-gray-100'}`}
                >
                  💧
                </button>
                <button
                  onClick={handleExport}
                  className="p-2 rounded bg-green-100"
                >
                  📷
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* ID System View */
        <div className="flex-1 mt-16">
          <IDSystem onHouseSelect={handleIDSystemHouseSelect} />
        </div>
      )}

      {/* House Viewer Modal */}
      <HouseViewer
        house={selectedHouse}
        isOpen={isHouseViewerOpen}
        onClose={handleCloseHouseViewer}
      />
    </div>
  )
}
