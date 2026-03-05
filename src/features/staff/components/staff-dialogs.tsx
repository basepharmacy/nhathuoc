import { StaffActionDialog } from './staff-action-dialog'
import { StaffDeleteDialog } from './staff-delete-dialog'
import { useStaff } from './staff-provider'

export function StaffDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useStaff()
  return (
    <>
      <StaffActionDialog
        key='user-add'
        open={open === 'add'}
        onOpenChange={(state) => {
          if (!state) {
            setOpen(null)
          }
        }}
      />

      {currentRow && (
        <>
          <StaffActionDialog
            key={`user-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={(state) => {
              if (!state) {
                setOpen(null)
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            currentRow={currentRow}
          />

          <StaffDeleteDialog
            key={`user-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={(state) => {
              if (!state) {
                setOpen(null)
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
