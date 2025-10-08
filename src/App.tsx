import { useState, useCallback } from 'react'
import OpenStreetMap from './components/OpenStreetMap/OpenStreetMap'
import ToolBar from './components/ToolBar/ToolBar'
import SearchBox from './components/SearchBox/SearchBox'
import HouseViewer from './components/HouseViewer/HouseViewer'
import { IDSystem } from './components/IDSystem/IDSystem'
import VirtualMap from './components/VirtualMap/VirtualMap'
import HousePopup from './components/HousePopup/HousePopup'
import QGISViewer from './components/QGISViewer/QGISViewer'
import RealQGISViewer from './components/RealQGISViewer/RealQGISViewer'
import RealMapWithGIS from './components/RealMapWithGIS/RealMapWithGIS'
import FastRealMapGIS from './components/FastRealMapGIS/FastRealMapGIS'
import SmartMapWithQGIS from './components/SmartMapWithQGIS/SmartMapWithQGIS'
import IntegratedSmartMap from './components/IntegratedSmartMap/IntegratedSmartMap'
import QGISLayerManager from './components/QGISLayerManager/QGISLayerManager'
import CitySelector from './components/CitySelector/CitySelector'
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
  const [currentView, setCurrentView] = useState<'map' | 'id-system' | 'qgis' | 'real-qgis' | 'real-map-gis' | 'fast-real-map-gis' | 'smart-map-qgis' | 'integrated-smart-map'>('map')
  const [selectedCity, setSelectedCity] = useState('muscat-sultan-qaboos')
  const [mapViewMode, setMapViewMode] = useState<'real' | 'virtual' | 'qgis'>('real')
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


  const handleToggleBuildings = useCallback(() => {
    setShowBuildings(prev => !prev)
  }, [])

  const handleBuildingSelect = useCallback((building: BuildingData) => {
    console.log('تم اختيار مبنى:', building)
  }, [])

  const handleIDSystemHouseSelect = useCallback((house: House) => {
    setSelectedHouse(house)
    setPopupHouse(house)
    setShowHousePopup(true)
    setCurrentView('map') // العودة إلى الخريطة
  }, [])

  const handleCitySelect = useCallback((cityId: string) => {
    if (cityId === 'virtual-view') {
      setMapViewMode('virtual')
    } else if (cityId === 'real-map') {
      setMapViewMode('real')
    } else {
      setSelectedCity(cityId)
    }
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
              onClick={() => setCurrentView('map')}
              className={`px-4 py-1 rounded-md font-medium transition-colors text-sm ${
                currentView === 'map'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              الخريطة الذكية
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
                 onClick={() => setCurrentView('real-qgis')}
                 className={`px-4 py-1 rounded-md font-medium transition-colors text-sm ${
                   currentView === 'real-qgis'
                     ? 'bg-purple-600 text-white'
                     : 'text-gray-600 hover:text-purple-600'
                 }`}
               >
                 GIS الحقيقي
               </button>
               <button
                 onClick={() => setCurrentView('real-map-gis')}
                 className={`px-4 py-1 rounded-md font-medium transition-colors text-sm ${
                   currentView === 'real-map-gis'
                     ? 'bg-red-600 text-white'
                     : 'text-gray-600 hover:text-red-600'
                 }`}
               >
                 خريطة حقيقية + GIS
               </button>
               <button
                 onClick={() => setCurrentView('fast-real-map-gis')}
                 className={`px-4 py-1 rounded-md font-medium transition-colors text-sm ${
                   currentView === 'fast-real-map-gis'
                     ? 'bg-orange-600 text-white'
                     : 'text-gray-600 hover:text-orange-600'
                 }`}
               >
                 خريطة سريعة + QGIS
               </button>
               <button
                 onClick={() => setCurrentView('smart-map-qgis')}
                 className={`px-4 py-1 rounded-md font-medium transition-colors text-sm ${
                   currentView === 'smart-map-qgis'
                     ? 'bg-teal-600 text-white'
                     : 'text-gray-600 hover:text-teal-600'
                 }`}
               >
                 الخريطة الذكية + QGIS
               </button>
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
          </div>
        </div>
      </div>

      {/* Main Content */}
      {currentView === 'map' ? (
        <>
          {/* City Selector - Hidden on mobile */}
          <div className="hidden md:block pt-12">
            <CitySelector
              onCitySelect={handleCitySelect}
              selectedCity={mapViewMode === 'virtual' ? 'virtual-view' : mapViewMode === 'real' ? 'real-map' : selectedCity}
            />
          </div>

          {/* Map Content */}
          <div className="flex-1 flex flex-col pt-12 overflow-hidden">
            {/* Search Bar */}
            <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
              <SearchBox onHouseSelect={handleHouseSelect} />
            </div>

            {/* Map Container */}
            <div id="map-container" className="flex-1 relative overflow-hidden">
              {mapViewMode === 'virtual' ? (
                <VirtualMap
                  houses={houses}
                  onHouseSelect={handleHouseSelect}
                  selectedHouse={selectedHouse}
                />
              ) : (
                <OpenStreetMap
                  houses={houses}
                  onHouseSelect={handleHouseSelect}
                  onMapClick={handleMapClick}
                  selectedHouse={selectedHouse}
                  waterFeatures={waterFeatures}
                  showBuildings={showBuildings}
                  onBuildingSelect={handleBuildingSelect}
                  showInformationOverlay={true}
                />
              )}
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
      ) : currentView === 'id-system' ? (
        /* ID System View */
        <div className="flex-1 pt-12">
          <IDSystem onHouseSelect={handleIDSystemHouseSelect} />
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
      ) : currentView === 'real-qgis' ? (
        /* Real QGIS View */
        <div className="flex-1 pt-12 h-screen">
          <RealQGISViewer 
            onBuildingSelect={(building) => {
              console.log('تم تحديد مبنى حقيقي:', building)
            }}
            onParcelSelect={(parcel) => {
              console.log('تم تحديد قطعة أرض حقيقية:', parcel)
            }}
          />
        </div>
      ) : currentView === 'real-map-gis' ? (
        /* Real Map with GIS View */
        <div className="flex-1 pt-12 h-screen">
          <RealMapWithGIS 
            onBuildingSelect={(building) => {
              console.log('تم تحديد مبنى حقيقي على الخريطة:', building)
            }}
            onParcelSelect={(parcel) => {
              console.log('تم تحديد قطعة أرض حقيقية على الخريطة:', parcel)
            }}
          />
        </div>
      ) : currentView === 'fast-real-map-gis' ? (
        /* Fast Real Map with QGIS View */
        <div className="flex-1 pt-12 h-screen">
          <FastRealMapGIS 
            onBuildingSelect={(building) => {
              console.log('تم تحديد مبنى QGIS على الخريطة السريعة:', building)
            }}
            onParcelSelect={(parcel) => {
              console.log('تم تحديد قطعة أرض QGIS على الخريطة السريعة:', parcel)
            }}
          />
        </div>
      ) : currentView === 'integrated-smart-map' ? (
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
      ) : (
        /* Smart Map with QGIS View */
        <div className="flex-1 pt-12 h-screen">
          <SmartMapWithQGIS 
            houses={houses}
            onHouseSelect={handleHouseSelect}
            selectedHouse={selectedHouse}
          />
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
