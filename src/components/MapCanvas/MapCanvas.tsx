import { useRef, useEffect, useState, useCallback } from 'react'
import { MapState, MapElement } from '../../types'
import { useGridSnap } from '../../hooks/useGridSnap'

interface MapCanvasProps {
  mapState: MapState
  elements: MapElement[]
  onElementAdd: (element: MapElement) => void
  onElementUpdate: (id: string, element: Partial<MapElement>) => void
  onElementDelete: (id: string) => void
  onMapStateUpdate: (updates: Partial<MapState>) => void
}

export default function MapCanvas({
  mapState,
  elements,
  onElementAdd,
  onMapStateUpdate
}: MapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [currentRect, setCurrentRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const { snapPointToGrid, snapRectToGrid, GRID_SIZE } = useGridSnap()

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.lineWidth = 1

    const startX = (mapState.panX % GRID_SIZE) - GRID_SIZE
    const startY = (mapState.panY % GRID_SIZE) - GRID_SIZE

    for (let x = startX; x < width; x += GRID_SIZE) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    for (let y = startY; y < height; y += GRID_SIZE) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
  }, [mapState.panX, mapState.panY, GRID_SIZE])

  const drawElements = useCallback((ctx: CanvasRenderingContext2D) => {
    elements.forEach(element => {
      ctx.save()
      ctx.translate(mapState.panX, mapState.panY)
      ctx.scale(mapState.zoom, mapState.zoom)

      switch (element.type) {
        case 'wall':
          if (element.points && element.points.length >= 2) {
            ctx.strokeStyle = '#374151'
            ctx.lineWidth = 3
            ctx.beginPath()
            ctx.moveTo(element.points[0][0], element.points[0][1])
            for (let i = 1; i < element.points.length; i++) {
              ctx.lineTo(element.points[i][0], element.points[i][1])
            }
            ctx.stroke()
          }
          break

        case 'path':
          if (element.points && element.points.length >= 2) {
            ctx.strokeStyle = '#22c55e'
            ctx.lineWidth = 2
            ctx.setLineDash([5, 5])
            ctx.beginPath()
            ctx.moveTo(element.points[0][0], element.points[0][1])
            for (let i = 1; i < element.points.length; i++) {
              ctx.lineTo(element.points[i][0], element.points[i][1])
            }
            ctx.stroke()
            ctx.setLineDash([])
          }
          break

        case 'door':
          if (element.points && element.points.length > 0) {
            ctx.fillStyle = '#0ea5e9'
            ctx.fillRect(element.points[0][0] - 5, element.points[0][1] - 5, 10, 10)
          }
          break

        case 'kiosk':
          if (element.points && element.points.length > 0) {
            ctx.fillStyle = '#f59e0b'
            ctx.fillRect(element.points[0][0] - 8, element.points[0][1] - 8, 16, 16)
          }
          break

        case 'plot':
          if (element.rect) {
            ctx.strokeStyle = '#8b5cf6'
            ctx.lineWidth = 2
            ctx.strokeRect(element.rect.x, element.rect.y, element.rect.width, element.rect.height)
            ctx.fillStyle = 'rgba(139, 92, 246, 0.1)'
            ctx.fillRect(element.rect.x, element.rect.y, element.rect.width, element.rect.height)
          }
          break
      }

      ctx.restore()
    })
  }, [elements, mapState.panX, mapState.panY, mapState.zoom])

  const drawCurrentRect = useCallback((ctx: CanvasRenderingContext2D) => {
    if (currentRect && mapState.selectedTool === 'plot') {
      ctx.save()
      ctx.translate(mapState.panX, mapState.panY)
      ctx.scale(mapState.zoom, mapState.zoom)
      
      ctx.strokeStyle = '#8b5cf6'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.strokeRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height)
      ctx.setLineDash([])
      
      ctx.restore()
    }
  }, [currentRect, mapState.selectedTool, mapState.panX, mapState.panY, mapState.zoom])

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw grid
    drawGrid(ctx, width, height)

    // Draw elements
    drawElements(ctx)

    // Draw current rectangle for plot tool
    drawCurrentRect(ctx)
  }, [drawGrid, drawElements, drawCurrentRect])

  useEffect(() => {
    redraw()
  }, [redraw, mapState, elements, currentRect])

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / mapState.zoom - mapState.panX / mapState.zoom
    const y = (e.clientY - rect.top) / mapState.zoom - mapState.panY / mapState.zoom
    const snappedPoint = snapPointToGrid({ x, y })

    if (mapState.selectedTool === 'plot') {
      setIsDragging(true)
      setDragStart(snappedPoint)
      setCurrentRect({ x: snappedPoint.x, y: snappedPoint.y, width: 0, height: 0 })
    } else if (mapState.selectedTool === 'wall' || mapState.selectedTool === 'path') {
      if (!mapState.isDrawing) {
        onMapStateUpdate({ isDrawing: true, currentPath: [[snappedPoint.x, snappedPoint.y] as [number, number]] })
      } else {
        const newPath = [...mapState.currentPath, [snappedPoint.x, snappedPoint.y] as [number, number]]
        onMapStateUpdate({ currentPath: newPath })
      }
    } else if (mapState.selectedTool === 'door' || mapState.selectedTool === 'kiosk') {
      const element: MapElement = {
        id: `${mapState.selectedTool}-${Date.now()}`,
        type: mapState.selectedTool,
        points: [[snappedPoint.x, snappedPoint.y] as [number, number]]
      }
      onElementAdd(element)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || mapState.selectedTool !== 'plot') return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / mapState.zoom - mapState.panX / mapState.zoom
    const y = (e.clientY - rect.top) / mapState.zoom - mapState.panY / mapState.zoom
    const snappedPoint = snapPointToGrid({ x, y })

    const newRect = {
      x: Math.min(dragStart.x, snappedPoint.x),
      y: Math.min(dragStart.y, snappedPoint.y),
      width: Math.abs(snappedPoint.x - dragStart.x),
      height: Math.abs(snappedPoint.y - dragStart.y)
    }

    setCurrentRect(snapRectToGrid(newRect))
  }

  const handleMouseUp = () => {
    if (isDragging && mapState.selectedTool === 'plot' && currentRect) {
      const element: MapElement = {
        id: `plot-${Date.now()}`,
        type: 'plot',
        rect: currentRect
      }
      onElementAdd(element)
      setCurrentRect(null)
    }
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(0.1, Math.min(5, mapState.zoom * delta))
    onMapStateUpdate({ zoom: newZoom })
  }

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateCanvasSize = () => {
      const isMobile = window.innerWidth < 768
      setCanvasSize({
        width: isMobile ? window.innerWidth : window.innerWidth - 240,
        height: window.innerHeight - (isMobile ? 120 : 0) // Account for mobile toolbar
      })
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize.width}
      height={canvasSize.height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      className="cursor-crosshair"
      style={{ background: '#f8fafc' }}
    />
  )
}
