import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import type { StockAdjustmentWithRelations } from '@/services/supabase/'

type StockAdjustmentsDialogType = 'add' | 'delete'

type StockAdjustmentsContextType = {
  open: StockAdjustmentsDialogType | null
  setOpen: (str: StockAdjustmentsDialogType | null) => void
  currentRow: StockAdjustmentWithRelations | null
  setCurrentRow: React.Dispatch<React.SetStateAction<StockAdjustmentWithRelations | null>>
}

const StockAdjustmentsContext = React.createContext<StockAdjustmentsContextType | null>(null)

export function StockAdjustmentsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<StockAdjustmentsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<StockAdjustmentWithRelations | null>(null)

  return (
    <StockAdjustmentsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </StockAdjustmentsContext>
  )
}

export const useStockAdjustments = () => {
  const ctx = React.useContext(StockAdjustmentsContext)
  if (!ctx) {
    throw new Error('useStockAdjustments must be used within <StockAdjustmentsProvider>')
  }
  return ctx
}
