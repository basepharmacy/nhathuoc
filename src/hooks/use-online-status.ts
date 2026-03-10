import { useEffect, useRef, useState } from 'react'

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Stop polling once online
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      // Start polling to detect recovery (navigator.onLine can miss reconnects)
      if (!intervalRef.current) {
        intervalRef.current = setInterval(() => {
          if (navigator.onLine) handleOnline()
        }, 5000)
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Sync initial state
    if (!navigator.onLine) handleOffline()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return { isOnline }
}
