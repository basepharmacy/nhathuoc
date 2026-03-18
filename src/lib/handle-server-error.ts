import { AxiosError } from 'axios'
import { toast } from 'sonner'
import { mapSupabaseError } from '@/lib/error-mapper'

export function handleServerError(error: unknown) {
  // eslint-disable-next-line no-console
  console.log(error)

  if (error instanceof AxiosError) {
    const errMsg = error.response?.data.title ?? mapSupabaseError(error)
    toast.error(errMsg)
    return
  }

  toast.error(mapSupabaseError(error))
}
