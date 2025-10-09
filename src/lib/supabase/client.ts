import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Singleton instance to avoid multiple GoTrueClient instances
let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null

export const createClient = () => {
  // Return existing instance if available
  if (supabaseInstance) {
    return supabaseInstance
  }

  // Durante el build estático, las variables pueden no estar disponibles
  // Usamos valores por defecto para evitar errores de build
  const url = supabaseUrl || 'https://placeholder.supabase.co'
  const key = supabaseAnonKey || 'placeholder-anon-key'
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not found, using placeholder values for build')
  }

  // Create and store the singleton instance using SSR-compatible client
  supabaseInstance = createBrowserClient<Database>(url, key)

  return supabaseInstance
}

// Export default client instance
export default createClient()