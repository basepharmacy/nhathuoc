import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type ProductWithUnits } from '@/services/supabase'

type ProductsDialogType = 'add' | 'edit' | 'delete' | 'deactivate'

type ProductsContextType = {
  open: ProductsDialogType | null
  setOpen: (str: ProductsDialogType | null) => void
  currentRow: ProductWithUnits | null
  setCurrentRow: React.Dispatch<React.SetStateAction<ProductWithUnits | null>>
}

const ProductsContext = React.createContext<ProductsContextType | null>(null)

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<ProductsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<ProductWithUnits | null>(null)

  return (
    <ProductsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </ProductsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useProducts = () => {
  const ctx = React.useContext(ProductsContext)

  if (!ctx) {
    throw new Error('useProducts has to be used within <ProductsContext>')
  }

  return ctx
}
