import { useCallback, useEffect, useRef, useState } from 'react'
import type { PurchaseOrdersSearchHandle } from '../components/purchase-orders-search'

interface UseKeyboardShortcutsParams {
  order: {
    saveDraft: () => void
    submit: () => void
    items: { id: string; quantity: number }[]
    updateItem: (id: string, data: { quantity: number }) => void
    removeItem: (id: string) => void
  }
  setPrintOpen: (open: boolean) => void
  setResetConfirmOpen: (open: boolean | ((prev: boolean) => boolean)) => void
}

export function useKeyboardShortcuts({
  order,
  setPrintOpen,
  setResetConfirmOpen,
}: UseKeyboardShortcutsParams) {
  const searchRef = useRef<PurchaseOrdersSearchHandle>(null)
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(-1)
  const [editingPriceItemId, setEditingPriceItemId] = useState<string | null>(null)

  const handleKeyboardShortcuts = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT'
      const isFunctionKey = event.key.startsWith('F') && event.key.length <= 3

      if (isInput && !isFunctionKey && event.key !== 'Escape' && event.key !== 'Delete') return

      switch (event.key) {
        case 'F1': {
          event.preventDefault()
          order.saveDraft()
          break
        }
        case 'Escape': {
          event.preventDefault()
          const hasOpenDialog = document.querySelector('[role="dialog"], [role="alertdialog"]')
          if (hasOpenDialog) {
            setResetConfirmOpen(false)
          } else if (!isInput) {
            setResetConfirmOpen(true)
          }
          break
        }
        case 'F6': {
          event.preventDefault()
          setPrintOpen(true)
          break
        }
        case 'F8': {
          event.preventDefault()
          if (order.items.length === 0) break
          const idx = selectedItemIndex >= 0 && selectedItemIndex < order.items.length
            ? selectedItemIndex
            : 0
          setEditingPriceItemId(order.items[idx].id)
          break
        }
        case 'F9': {
          event.preventDefault()
          order.submit()
          break
        }
        case 'ArrowDown': {
          if (isInput) break
          event.preventDefault()
          if (event.shiftKey && order.items.length > 0) {
            searchRef.current?.focus()
          } else if (order.items.length > 0) {
            setSelectedItemIndex((prev) =>
              prev + 1 >= order.items.length ? 0 : prev + 1
            )
          }
          break
        }
        case 'ArrowUp': {
          if (isInput) break
          event.preventDefault()
          if (order.items.length > 0) {
            setSelectedItemIndex((prev) =>
              prev - 1 < 0 ? order.items.length - 1 : prev - 1
            )
          }
          break
        }
        case 'Delete': {
          if (isInput) break
          event.preventDefault()
          if (
            selectedItemIndex >= 0 &&
            selectedItemIndex < order.items.length
          ) {
            const itemToRemove = order.items[selectedItemIndex]
            order.removeItem(itemToRemove.id)
            setSelectedItemIndex((prev) =>
              Math.min(prev, order.items.length - 2)
            )
          }
          break
        }
        case '+':
        case 'ArrowRight': {
          if (isInput) break
          event.preventDefault()
          if (
            selectedItemIndex >= 0 &&
            selectedItemIndex < order.items.length
          ) {
            const item = order.items[selectedItemIndex]
            order.updateItem(item.id, { quantity: item.quantity + 1 })
          }
          break
        }
        case '-':
        case 'ArrowLeft': {
          if (isInput) break
          event.preventDefault()
          if (
            selectedItemIndex >= 0 &&
            selectedItemIndex < order.items.length
          ) {
            const item = order.items[selectedItemIndex]
            if (item.quantity > 1) {
              order.updateItem(item.id, { quantity: item.quantity - 1 })
            }
          }
          break
        }
      }
    },
    [order, selectedItemIndex, setPrintOpen, setResetConfirmOpen]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyboardShortcuts)
    return () => window.removeEventListener('keydown', handleKeyboardShortcuts)
  }, [handleKeyboardShortcuts])

  return {
    searchRef,
    selectedItemIndex,
    setSelectedItemIndex,
    editingPriceItemId,
    setEditingPriceItemId,
  }
}
