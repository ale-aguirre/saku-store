'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - datos frescos por más tiempo
            gcTime: 10 * 60 * 1000, // 10 minutes - mantener en caché por más tiempo
            retry: 2, // Reintentar 2 veces en caso de error
            retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Backoff exponencial
            refetchOnWindowFocus: false, // No refetch al cambiar de ventana
            refetchOnMount: false, // No refetch al montar si hay datos en caché
            refetchOnReconnect: true, // Sí refetch al reconectar
          },
          mutations: {
            retry: 1,
            retryDelay: 1000,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}