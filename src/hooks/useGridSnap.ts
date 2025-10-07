import { useCallback } from 'react'

const GRID_SIZE = 10 // 10px = 1 meter

export function useGridSnap() {
  const snapToGrid = useCallback((value: number): number => {
    return Math.round(value / GRID_SIZE) * GRID_SIZE
  }, [])

  const snapPointToGrid = useCallback((point: { x: number; y: number }) => {
    return {
      x: snapToGrid(point.x),
      y: snapToGrid(point.y)
    }
  }, [snapToGrid])

  const snapRectToGrid = useCallback((rect: { x: number; y: number; width: number; height: number }) => {
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
  }, [snapToGrid])

  return {
    snapToGrid,
    snapPointToGrid,
    snapRectToGrid,
    GRID_SIZE
  }
}
