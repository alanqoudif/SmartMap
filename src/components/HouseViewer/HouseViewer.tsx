import React, { useState } from 'react'
import { House } from '../../types'
import { useLocalStorage } from '../../hooks/useLocalStorage'

interface HouseViewerProps {
  house: House | null
  isOpen: boolean
  onClose: () => void
}

export default function HouseViewer({ house, isOpen, onClose }: HouseViewerProps) {
  const [houseNotes, setHouseNotes] = useLocalStorage<Record<string, string>>('houseNotes', {})
  const [currentNote, setCurrentNote] = useState('')

  React.useEffect(() => {
    if (house) {
      setCurrentNote(houseNotes[house.id] || '')
    }
  }, [house, houseNotes])

  const handleSaveNote = () => {
    if (house) {
      const updatedNotes = {
        ...houseNotes,
        [house.id]: currentNote
      }
      setHouseNotes(updatedNotes)
    }
  }

  const generateHouseSVG = (house: House) => {
    const width = 200
    const height = 150
    const rooms = house.rooms
    const roomWidth = width / Math.ceil(rooms / 2)
    const roomHeight = height / 2

    let roomElements = []
    for (let i = 0; i < rooms; i++) {
      const x = (i % Math.ceil(rooms / 2)) * roomWidth
      const y = Math.floor(i / Math.ceil(rooms / 2)) * roomHeight
      
      roomElements.push(
        <rect
          key={i}
          x={x}
          y={y}
          width={roomWidth - 2}
          height={roomHeight - 2}
          fill="#e5e7eb"
          stroke="#374151"
          strokeWidth="1"
        />
      )
    }

    return (
      <svg width={width} height={height} className="border border-gray-300 rounded">
        {roomElements}
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill="none"
          stroke="#374151"
          strokeWidth="2"
        />
        {/* Door */}
        <rect
          x={width - 20}
          y={height / 2 - 10}
          width="20"
          height="20"
          fill="#0ea5e9"
        />
      </svg>
    )
  }

  if (!isOpen || !house) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                المنزل {house.houseNo}
              </h2>
              <p className="text-sm text-gray-600">
                قطعة {house.plotNo}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* House Plan */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">مخطط المنزل</h3>
            <div className="flex justify-center">
              {generateHouseSVG(house)}
            </div>
          </div>

          {/* House Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">المساحة</div>
              <div className="font-semibold text-gray-800">{house.areaM2} م²</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">عدد الغرف</div>
              <div className="font-semibold text-gray-800">{house.rooms}</div>
            </div>
          </div>

          {/* Coordinates */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">الإحداثيات</div>
            <div className="text-sm text-gray-800">
              X: {house.x} • Y: {house.y}
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">ملاحظات</h3>
            <textarea
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              placeholder="أضف ملاحظاتك هنا..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <button
              onClick={handleSaveNote}
              className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors duration-200"
            >
              حفظ الملاحظة
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors duration-200"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  )
}
