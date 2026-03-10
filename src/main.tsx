import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { AxiosError } from 'axios'
import {
  QueryCache,
  QueryClient,
} from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
import { isNetworkError } from '@/services/offline/mutation-queue'
import { createIdbPersister } from '@/services/offline/persister'
import { AuthUserProvider } from './client/provider'
import { DirectionProvider } from './context/direction-provider'
import { FontProvider } from './context/font-provider'
import { LocationProvider } from './context/location-provider'
import { ThemeProvider } from './context/theme-provider'
// Generated Routes
import { routeTree } from './routeTree.gen'
// Styles
import './styles/index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'always',
      retry: (failureCount, error) => {
        // eslint-disable-next-line no-console
        if (import.meta.env.DEV) console.log({ failureCount, error })

        // Don't retry on network errors — use cached data instead
        if (isNetworkError(error)) return false

        if (failureCount >= 0 && import.meta.env.DEV) return false
        if (failureCount > 3 && import.meta.env.PROD) return false

        return !(
          error instanceof AxiosError &&
          [401, 403].includes(error.response?.status ?? 0)
        )
      },
      refetchOnWindowFocus: import.meta.env.PROD,
      staleTime: 10 * 1000, // 10s
    },
    mutations: {
      networkMode: 'offlineFirst',
      onError: (error) => {
        // Don't show error toasts for network errors — handled by offline queue
        if (isNetworkError(error)) return

        handleServerError(error)

        if (error instanceof AxiosError) {
          if (error.response?.status === 304) {
            toast.error('Content not modified!')
          }
        }
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      // Silently ignore network errors — app uses cached data when offline
      if (isNetworkError(error)) return

      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          toast.error('Session expired!')
          const redirect = `${router.history.location.href}`
          router.navigate({ to: '/sign-in', search: { redirect } })
        }
        if (error.response?.status === 500) {
          toast.error('Internal Server Error!')
          // Only navigate to error page in production to avoid disrupting HMR in development
          if (import.meta.env.PROD) {
            router.navigate({ to: '/500' })
          }
        }
        if (error.response?.status === 403) {
          // router.navigate("/forbidden", { replace: true });
        }
      }
    },
  }),
})

// Create a new router instance
const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const persister = createIdbPersister()

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24 }}
      >
        <AuthUserProvider>
          <LocationProvider>
            <ThemeProvider>
              <FontProvider>
                <DirectionProvider>
                  <RouterProvider router={router} />
                </DirectionProvider>
              </FontProvider>
            </ThemeProvider>
          </LocationProvider>
        </AuthUserProvider>
      </PersistQueryClientProvider>
    </StrictMode>
  )
}
