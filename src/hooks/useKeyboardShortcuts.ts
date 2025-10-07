import { useEffect } from 'react'
import { DrawingTool } from '../types'

interface UseKeyboardShortcutsProps {
  onToolSelect: (tool: DrawingTool) => void
  onExport: () => void
  onClear: () => void
  onUndo?: () => void
}

export function useKeyboardShortcuts({
  onToolSelect,
  onExport,
  onClear,
  onUndo
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Tool shortcuts
      switch (e.key.toLowerCase()) {
        case '1':
          onToolSelect('select')
          break
        case '2':
          onToolSelect('wall')
          break
        case '3':
          onToolSelect('path')
          break
        case '4':
          onToolSelect('door')
          break
        case '5':
          onToolSelect('kiosk')
          break
        case '6':
          onToolSelect('plot')
          break
        case 'delete':
        case 'backspace':
          onToolSelect('delete')
          break
        case 'e':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            onExport()
          }
          break
        case 'c':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            onClear()
          }
          break
        case 'z':
          if ((e.ctrlKey || e.metaKey) && onUndo) {
            e.preventDefault()
            onUndo()
          }
          break
        case 'escape':
          onToolSelect('select')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onToolSelect, onExport, onClear, onUndo])
}
