import React, { useState, useCallback } from 'react'
import MapCanvas from './components/MapCanvas/MapCanvas'
import GoogleMap from './components/GoogleMap/GoogleMap'
import MapToggle from './components/MapToggle/MapToggle'
import ToolBar from './components/ToolBar/ToolBar'
import SearchBox from './components/SearchBox/SearchBox'
import HouseViewer from './components/HouseViewer/HouseViewer'
import ExportButton from './components/ExportButton/ExportButton'
import { MapState, MapElement, DrawingTool, House } from './types'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import omanHouses from './data/oman-houses.json'

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
  const [elements, setElements] = useLocalStorage<MapElement[]>('userMap', [])
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null)
  const [isHouseViewerOpen, setIsHouseViewerOpen] = useState(false)
  const [mapType, setMapType] = useState<'canvas' | 'google'>('canvas')
  const houses = omanHouses as House[]

  const handleToolSelect = useCallback((tool: DrawingTool) => {
    setMapState(prev => ({
      ...prev,
      selectedTool: tool,
      selectedElement: null,
      isDrawing: false,
      currentPath: []
    }))
  }, [])

  const handleElementAdd = useCallback((element: MapElement) => {
    setElements(prev => [...prev, element])
  }, [setElements])

  const handleElementUpdate = useCallback((id: string, updates: Partial<MapElement>) => {
    setElements(prev => 
      prev.map(el => el.id === id ? { ...el, ...updates } : el)
    )
  }, [setElements])

  const handleElementDelete = useCallback((id: string) => {
    setElements(prev => prev.filter(el => el.id !== id))
  }, [setElements])

  const handleMapStateUpdate = useCallback((updates: Partial<MapState>) => {
    setMapState(prev => ({ ...prev, ...updates }))
  }, [])

  const handleHouseSelect = useCallback((house: House) => {
    setSelectedHouse(house)
    setIsHouseViewerOpen(true)
    
    // Move camera to house location (only for canvas map)
    if (mapType === 'canvas') {
      setMapState(prev => ({
        ...prev,
        panX: -house.x * prev.zoom + window.innerWidth / 2 - 120,
        panY: -house.y * prev.zoom + window.innerHeight / 2,
        zoom: 2
      }))
    }
  }, [mapType])

  const handleMapClick = useCallback((lat: number, lng: number) => {
    // إضافة بيت جديد عند النقر على خريطة Google
    const newHouse: House = {
      id: `new-${Date.now()}`,
      houseNo: Math.floor(Math.random() * 1000) + 1,
      plotNo: Math.floor(Math.random() * 500) + 1,
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
      setElements([])
    }
  }, [setElements])

  const handleCloseHouseViewer = useCallback(() => {
    setIsHouseViewerOpen(false)
    setSelectedHouse(null)
  }, [])

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onToolSelect: handleToolSelect,
    onExport: handleExport,
    onClear: handleClear
  })

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Toolbar - Hidden on mobile */}
      <div className="hidden md:block">
        <ToolBar
          selectedTool={mapState.selectedTool}
          onToolSelect={handleToolSelect}
          onExport={handleExport}
          onClear={handleClear}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Search Bar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <SearchBox onHouseSelect={handleHouseSelect} />
        </div>

        {/* Map Container */}
        <div id="map-container" className="flex-1 relative">
          {/* Map Toggle */}
          <MapToggle
            mapType={mapType}
            onMapTypeChange={setMapType}
          />
          
          {/* Canvas Map */}
          {mapType === 'canvas' && (
            <MapCanvas
              mapState={mapState}
              elements={elements}
              onElementAdd={handleElementAdd}
              onElementUpdate={handleElementUpdate}
              onElementDelete={handleElementDelete}
              onMapStateUpdate={handleMapStateUpdate}
            />
          )}
          
          {/* Google Map */}
          {mapType === 'google' && (
            <GoogleMap
              houses={houses}
              onHouseSelect={handleHouseSelect}
              onMapClick={handleMapClick}
              selectedHouse={selectedHouse}
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
              onClick={handleExport}
              className="p-2 rounded bg-green-100"
            >
              📷
            </button>
          </div>
        </div>
      </div>

      {/* House Viewer Modal */}
      <HouseViewer
        house={selectedHouse}
        isOpen={isHouseViewerOpen}
        onClose={handleCloseHouseViewer}
      />
    </div>
  )
}
