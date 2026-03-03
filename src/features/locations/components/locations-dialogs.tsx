import { LocationsActionDialog } from './locations-action-dialog'
import { LocationsDeleteDialog } from './locations-delete-dialog'
import { useLocations } from './locations-provider'

export function LocationsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useLocations()
  return (
    <>
      <LocationsActionDialog
        key='location-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <LocationsActionDialog
            key={`location-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <LocationsDeleteDialog
            key={`location-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
