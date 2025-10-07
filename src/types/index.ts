export interface House {
  id: string
  houseNo: number
  plotNo: number
  x: number
  y: number
  areaM2: number
  rooms: number
  lat?: number
  lng?: number
}

export interface MapElement {
  id: string
  type: 'wall' | 'path' | 'door' | 'kiosk' | 'plot'
  points?: [number, number][]
  rect?: { x: number; y: number; width: number; height: number }
  direction?: 'north' | 'south' | 'east' | 'west'
  color?: string
}

export interface UserMap {
  version: number
  elements: MapElement[]
  houseNotes: Record<string, string>
}

export type DrawingTool = 'select' | 'wall' | 'path' | 'door' | 'kiosk' | 'plot' | 'delete'

export interface MapState {
  zoom: number
  panX: number
  panY: number
  selectedTool: DrawingTool
  selectedElement: string | null
  isDrawing: boolean
  currentPath: [number, number][]
}
