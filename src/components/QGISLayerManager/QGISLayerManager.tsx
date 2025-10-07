import { useState } from 'react'
import { QGISLayer, QGISProject, exportLayerToGeoJSON, importLayerFromGeoJSON } from '../../utils/qgisSystem'

interface QGISLayerManagerProps {
  project: QGISProject
  onLayerUpdate: (layers: QGISLayer[]) => void
  onLayerSelect: (layer: QGISLayer) => void
}

export default function QGISLayerManager({ project, onLayerUpdate, onLayerSelect }: QGISLayerManagerProps) {
  const [selectedLayer, setSelectedLayer] = useState<QGISLayer | null>(null)
  const [showAttributeTable, setShowAttributeTable] = useState(false)
  const [showStyleEditor, setShowStyleEditor] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importData, setImportData] = useState('')

  const handleLayerSelect = (layer: QGISLayer) => {
    setSelectedLayer(layer)
    onLayerSelect(layer)
  }

  const handleLayerVisibility = (layerId: string, visible: boolean) => {
    const updatedLayers = project.layers.map(layer => 
      layer.id === layerId ? { ...layer, visible } : layer
    )
    onLayerUpdate(updatedLayers)
  }

  const handleLayerOpacity = (layerId: string, opacity: number) => {
    const updatedLayers = project.layers.map(layer => 
      layer.id === layerId ? { ...layer, opacity } : layer
    )
    onLayerUpdate(updatedLayers)
  }

  const handleLayerOrder = (layerId: string, direction: 'up' | 'down') => {
    const layerIndex = project.layers.findIndex(layer => layer.id === layerId)
    if (layerIndex === -1) return

    const newIndex = direction === 'up' ? layerIndex - 1 : layerIndex + 1
    if (newIndex < 0 || newIndex >= project.layers.length) return

    const updatedLayers = [...project.layers]
    const [movedLayer] = updatedLayers.splice(layerIndex, 1)
    updatedLayers.splice(newIndex, 0, movedLayer)

    // تحديث ترتيب الطبقات
    const reorderedLayers = updatedLayers.map((layer, index) => ({
      ...layer,
      order: index
    }))

    onLayerUpdate(reorderedLayers)
  }

  const handleExportLayer = (layer: QGISLayer) => {
    const geojson = exportLayerToGeoJSON(layer)
    const blob = new Blob([geojson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${layer.name.replace(/\s+/g, '_')}.geojson`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportLayer = () => {
    if (!importData.trim()) return

    const layer = importLayerFromGeoJSON(importData, 'Imported Layer')
    if (layer) {
      const updatedLayers = [...project.layers, layer]
      onLayerUpdate(updatedLayers)
      setImportData('')
      setShowImportDialog(false)
    }
  }

  const handleDeleteLayer = (layerId: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الطبقة؟')) {
      const updatedLayers = project.layers.filter(layer => layer.id !== layerId)
      onLayerUpdate(updatedLayers)
      if (selectedLayer?.id === layerId) {
        setSelectedLayer(null)
      }
    }
  }

  const handleStyleUpdate = (layerId: string, style: any) => {
    const updatedLayers = project.layers.map(layer => 
      layer.id === layerId ? { ...layer, style } : layer
    )
    onLayerUpdate(updatedLayers)
  }

  return (
    <div className="w-80 h-full bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">QGIS Layer Manager</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImportDialog(true)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm"
          >
            استيراد طبقة
          </button>
          <button
            onClick={() => setShowStyleEditor(true)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm"
          >
            تحرير النمط
          </button>
        </div>
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {project.layers.map((layer, index) => (
            <div
              key={layer.id}
              className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                selectedLayer?.id === layer.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleLayerSelect(layer)}
            >
              {/* Layer Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    layer.geometry === 'Point' ? 'bg-blue-500' :
                    layer.geometry === 'LineString' ? 'bg-green-500' :
                    'bg-yellow-500'
                  }`} />
                  <span className="font-medium text-sm">{layer.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLayerOrder(layer.id, 'up')
                    }}
                    disabled={index === 0}
                    className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  >
                    ↑
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLayerOrder(layer.id, 'down')
                    }}
                    disabled={index === project.layers.length - 1}
                    className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  >
                    ↓
                  </button>
                </div>
              </div>

              {/* Layer Info */}
              <div className="text-xs text-gray-600 mb-2">
                <div>النوع: {layer.geometry}</div>
                <div>العناصر: {layer.features.length}</div>
                <div>CRS: {layer.crs}</div>
              </div>

              {/* Layer Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={layer.visible}
                    onChange={(e) => {
                      e.stopPropagation()
                      handleLayerVisibility(layer.id, e.target.checked)
                    }}
                    className="rounded"
                  />
                  <span className="text-xs text-gray-600">مرئي</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={layer.opacity}
                    onChange={(e) => {
                      e.stopPropagation()
                      handleLayerOpacity(layer.id, parseFloat(e.target.value))
                    }}
                    className="w-16"
                  />
                  <span className="text-xs text-gray-600 w-8">
                    {Math.round(layer.opacity * 100)}%
                  </span>
                </div>
              </div>

              {/* Layer Actions */}
              <div className="flex gap-1 mt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleExportLayer(layer)
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-1 px-2 rounded text-xs"
                >
                  تصدير
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowAttributeTable(true)
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-xs"
                >
                  الجدول
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteLayer(layer.id)
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded text-xs"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Import Dialog */}
      {showImportDialog && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">استيراد طبقة من GeoJSON</h3>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="الصق محتوى GeoJSON هنا..."
              className="w-full h-40 p-3 border border-gray-300 rounded-lg font-mono text-sm"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleImportLayer}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                استيراد
              </button>
              <button
                onClick={() => {
                  setShowImportDialog(false)
                  setImportData('')
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attribute Table */}
      {showAttributeTable && selectedLayer && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-hidden">
            <h3 className="text-lg font-semibold mb-4">جدول الخصائص - {selectedLayer.name}</h3>
            <div className="overflow-auto max-h-80">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    {selectedLayer.features[0]?.attributes.map((attr, index) => (
                      <th key={index} className="p-2 text-left border-b">
                        {attr.alias || attr.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedLayer.features.slice(0, 50).map((feature, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {feature.attributes.map((attr, attrIndex) => (
                        <td key={attrIndex} className="p-2 border-b">
                          {attr.value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowAttributeTable(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Style Editor */}
      {showStyleEditor && selectedLayer && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">تحرير النمط - {selectedLayer.name}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اللون</label>
                <input
                  type="color"
                  value={selectedLayer.style.color}
                  onChange={(e) => {
                    const newStyle = { ...selectedLayer.style, color: e.target.value }
                    handleStyleUpdate(selectedLayer.id, newStyle)
                  }}
                  className="w-full h-10 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الحجم</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={selectedLayer.style.size}
                  onChange={(e) => {
                    const newStyle = { ...selectedLayer.style, size: parseInt(e.target.value) }
                    handleStyleUpdate(selectedLayer.id, newStyle)
                  }}
                  className="w-full"
                />
                <span className="text-sm text-gray-600">{selectedLayer.style.size}px</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الشفافية</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={selectedLayer.style.opacity}
                  onChange={(e) => {
                    const newStyle = { ...selectedLayer.style, opacity: parseFloat(e.target.value) }
                    handleStyleUpdate(selectedLayer.id, newStyle)
                  }}
                  className="w-full"
                />
                <span className="text-sm text-gray-600">{Math.round(selectedLayer.style.opacity * 100)}%</span>
              </div>

              {selectedLayer.style.strokeColor && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">لون الحدود</label>
                  <input
                    type="color"
                    value={selectedLayer.style.strokeColor}
                    onChange={(e) => {
                      const newStyle = { ...selectedLayer.style, strokeColor: e.target.value }
                      handleStyleUpdate(selectedLayer.id, newStyle)
                    }}
                    className="w-full h-10 border border-gray-300 rounded"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowStyleEditor(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
