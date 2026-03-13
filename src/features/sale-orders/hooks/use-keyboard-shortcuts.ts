import { useCallback, useEffect, useRef, useState } from 'react'
import { type SaleOrdersSearchHandle } from '../components/sale-orders-search'
import { type SaleOrderItem } from '../data/types'

type UseSaleOrderKeyboardShortcutsParams = {
  isActive: boolean
  items: SaleOrderItem[]
  onSaveDraft: () => void
  onSubmit: () => void
  onAddTab?: () => void
  onSetResetConfirmOpen: (open: boolean) => void
  onSetPrintOpen: (open: boolean) => void
  onQuantityChange: (itemId: string, quantity: number) => void
  onRemoveItem: (itemId: string) => void
}

export function useSaleOrderKeyboardShortcuts({
  isActive,
  items,
  onSaveDraft,
  onSubmit,
  onAddTab,
  onSetResetConfirmOpen,
  onSetPrintOpen,
  onQuantityChange,
  onRemoveItem,
}: UseSaleOrderKeyboardShortcutsParams) {
  const searchRef = useRef<SaleOrdersSearchHandle>(null)
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
          if (onAddTab) onAddTab()
          break
        }
        case 'F3': {
          event.preventDefault()
          onSaveDraft()
          break
        }
        case 'Escape': {
          event.preventDefault()
          const hasOpenDialog = document.querySelector('[role="dialog"], [role="alertdialog"]')
          if (hasOpenDialog) {
            onSetResetConfirmOpen(false)
          } else {
            if (isInput) (target as HTMLElement).blur()
            onSetResetConfirmOpen(true)
          }
          break
        }
        case 'F6': {
          event.preventDefault()
          onSetPrintOpen(true)
          break
        }
        case 'F8': {
          event.preventDefault()
          if (selectedItemIndex >= 0 && selectedItemIndex < items.length) {
            const item = items[selectedItemIndex]
            setEditingPriceItemId(item.id)
            const input = document.querySelector<HTMLInputElement>(`tr[data-item-id="${item.id}"] [data-currency-input]`)
            input?.focus()
          }
          break
        }
        case 'F9': {
          event.preventDefault()
          onSubmit()
          break
        }
        case 'ArrowDown': {
          if (isInput) break
          event.preventDefault()
          if (event.shiftKey && items.length > 0) {
            searchRef.current?.focus()
          } else if (items.length > 0) {
            setSelectedItemIndex((prev) =>
              prev + 1 >= items.length ? 0 : prev + 1
            )
          }
          break
        }
        case 'ArrowUp': {
          if (isInput) break
          event.preventDefault()
          if (items.length > 0) {
            setSelectedItemIndex((prev) =>
              prev - 1 < 0 ? items.length - 1 : prev - 1
            )
          }
          break
        }
        case 'Delete': {
          if (isInput) break
          event.preventDefault()
          if (
            selectedItemIndex >= 0 &&
            selectedItemIndex < items.length
          ) {
            const itemToRemove = items[selectedItemIndex]
            onRemoveItem(itemToRemove.id)
            setSelectedItemIndex((prev) =>
              Math.min(prev, items.length - 2)
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
            selectedItemIndex < items.length
          ) {
            const item = items[selectedItemIndex]
            onQuantityChange(item.id, item.quantity + 1)
          }
          break
        }
        case '-':
        case 'ArrowLeft': {
          if (isInput) break
          event.preventDefault()
          if (
            selectedItemIndex >= 0 &&
            selectedItemIndex < items.length
          ) {
            const item = items[selectedItemIndex]
            if (item.quantity > 1) {
              onQuantityChange(item.id, item.quantity - 1)
            }
          }
          break
        }
      }
    },
    [items, selectedItemIndex, onAddTab, onSaveDraft, onSubmit, onSetResetConfirmOpen, onSetPrintOpen, onQuantityChange, onRemoveItem]
  )

  useEffect(() => {
    if (!isActive) return
    window.addEventListener('keydown', handleKeyboardShortcuts)
    return () => window.removeEventListener('keydown', handleKeyboardShortcuts)
  }, [handleKeyboardShortcuts, isActive])

  return {
    searchRef,
    selectedItemIndex,
    setSelectedItemIndex,
    editingPriceItemId,
    setEditingPriceItemId,
  }
}
