export const GRID_SIZE = 10 // 10px = 1 meter

export function snapToGrid(value: number): number {
  return Math.round(value / GRID_SIZE) * GRID_SIZE
}

export function snapPointToGrid(point: { x: number; y: number }) {
  return {
    x: snapToGrid(point.x),
    y: snapToGrid(point.y)
  }
}

export function snapRectToGrid(rect: { x: number; y: number; width: number; height: number }) {
  const snappedX = snapToGrid(rect.x)
  const snappedY = snapToGrid(rect.y)
  const snappedWidth = snapToGrid(rect.width)
  const snappedHeight = snapToGrid(rect.height)
  
  return {
    x: snappedX,
    y: snappedY,
    width: snappedWidth || GRID_SIZE,
    height: snappedHeight || GRID_SIZE
  }
}
