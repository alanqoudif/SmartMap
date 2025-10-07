// Test utilities for the Omana Address Map project

export const mockHouses = [
  {
    id: "45-102",
    houseNo: 45,
    plotNo: 102,
    x: 1020,
    y: 840,
    areaM2: 400,
    rooms: 4
  },
  {
    id: "23-87",
    houseNo: 23,
    plotNo: 87,
    x: 650,
    y: 320,
    areaM2: 350,
    rooms: 3
  }
]

export const mockMapElements = [
  {
    id: "wall-1",
    type: "wall" as const,
    points: [[0, 0], [200, 0]]
  },
  {
    id: "plot-1",
    type: "plot" as const,
    rect: { x: 100, y: 100, width: 200, height: 150 }
  }
]

export const mockMapState = {
  zoom: 1,
  panX: 0,
  panY: 0,
  selectedTool: "select" as const,
  selectedElement: null,
  isDrawing: false,
  currentPath: []
}

// Performance testing utilities
export const measurePerformance = (fn: () => void, iterations: number = 1000) => {
  const start = performance.now()
  
  for (let i = 0; i < iterations; i++) {
    fn()
  }
  
  const end = performance.now()
  return {
    totalTime: end - start,
    averageTime: (end - start) / iterations,
    iterations
  }
}

// Canvas testing utilities
export const createTestCanvas = (width: number = 800, height: number = 600) => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

// Local storage testing utilities
export const clearTestData = () => {
  localStorage.removeItem('userMap')
  localStorage.removeItem('houseNotes')
}

export const setTestData = (elements: any[], notes: Record<string, string> = {}) => {
  localStorage.setItem('userMap', JSON.stringify(elements))
  localStorage.setItem('houseNotes', JSON.stringify(notes))
}
