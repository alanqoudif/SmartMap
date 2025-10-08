import { useState, useCallback } from 'react'
import HouseViewer from './components/HouseViewer/HouseViewer'
import { IDSystem } from './components/IDSystem/IDSystem'
import HousePopup from './components/HousePopup/HousePopup'
import QGISViewer from './components/QGISViewer/QGISViewer'
import IntegratedSmartMap from './components/IntegratedSmartMap/IntegratedSmartMap'
import QGISLayerManager from './components/QGISLayerManager/QGISLayerManager'
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
  // const [mapState, setMapState] = useState<MapState>(initialMapState)
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null)
  const [isHouseViewerOpen, setIsHouseViewerOpen] = useState(false)
  // إزالة mapType - سنستخدم OpenStreetMap فقط
  const [showBuildings, setShowBuildings] = useState(true)
  const [currentView, setCurrentView] = useState<'integrated-smart-map' | 'qgis' | 'id-system'>('integrated-smart-map')
  const [showHousePopup, setShowHousePopup] = useState(false)
  const [popupHouse, setPopupHouse] = useState<House | null>(null)
  const [showQGISLayerManager, setShowQGISLayerManager] = useState(false)
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
    setPopupHouse(house)
    setShowHousePopup(true)
    
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


  // const handleToggleBuildings = useCallback(() => {
  //   setShowBuildings(prev => !prev)
  // }, [])

  const handleBuildingSelect = useCallback((building: BuildingData) => {
    console.log('تم اختيار مبنى:', building)
  }, [])

  const handleIDSystemHouseSelect = useCallback((house: House) => {
    setSelectedHouse(house)
    setPopupHouse(house)
    setShowHousePopup(true)
    setCurrentView('integrated-smart-map') // العودة إلى الخريطة المدمجة
  }, [])


  const handleCloseHousePopup = useCallback(() => {
    setShowHousePopup(false)
    setPopupHouse(null)
  }, [])

  const handleViewHouse = useCallback(() => {
    setShowHousePopup(false)
    setPopupHouse(null)
    setIsHouseViewerOpen(true)
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
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 p-2">
        <div className="flex justify-center">
          <div className="bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setCurrentView('integrated-smart-map')}
              className={`px-4 py-1 rounded-md font-medium transition-colors text-sm ${
                currentView === 'integrated-smart-map'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-600 hover:text-emerald-600'
              }`}
            >
              الخريطة المدمجة
            </button>
            <button
              onClick={() => setCurrentView('qgis')}
              className={`px-4 py-1 rounded-md font-medium transition-colors text-sm ${
                currentView === 'qgis'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              QGIS
            </button>
            <button
              onClick={() => setCurrentView('id-system')}
              className={`px-4 py-1 rounded-md font-medium transition-colors text-sm ${
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
      {currentView === 'integrated-smart-map' ? (
        /* Integrated Smart Map View */
        <div className="flex-1 pt-12 h-screen">
          <IntegratedSmartMap 
            houses={houses}
            onHouseSelect={handleHouseSelect}
            onMapClick={handleMapClick}
            selectedHouse={selectedHouse}
            waterFeatures={waterFeatures}
            showBuildings={showBuildings}
            onBuildingSelect={handleBuildingSelect}
            showInformationOverlay={true}
          />
        </div>
      ) : currentView === 'qgis' ? (
        /* QGIS View */
        <div className="flex-1 pt-12 h-screen flex">
          <div className="flex-1">
            <QGISViewer 
              houses={houses}
              onHouseSelect={handleHouseSelect}
              selectedHouse={selectedHouse}
              onToggleLayerManager={() => setShowQGISLayerManager(!showQGISLayerManager)}
            />
          </div>
          {showQGISLayerManager && (
            <QGISLayerManager 
              project={{} as any} // سيتم تمرير المشروع الفعلي
              onLayerUpdate={() => {}}
              onLayerSelect={() => {}}
            />
          )}
        </div>
      ) : (
        /* ID System View */
        <div className="flex-1 pt-12">
          <IDSystem onHouseSelect={handleIDSystemHouseSelect} />
        </div>
      )}

      {/* House Viewer Modal */}
      <HouseViewer
        house={selectedHouse}
        isOpen={isHouseViewerOpen}
        onClose={handleCloseHouseViewer}
      />

      {/* House Popup */}
      <HousePopup
        house={popupHouse}
        isOpen={showHousePopup}
        onClose={handleCloseHousePopup}
        onViewHouse={handleViewHouse}
      />
    </div>
  )
}
