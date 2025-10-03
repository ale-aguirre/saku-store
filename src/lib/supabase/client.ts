import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Singleton instance to avoid multiple GoTrueClient instances
let supabaseInstance: ReturnType<typeof createSupabaseClient<Database>> | null = null

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

  // Create and store the singleton instance
  supabaseInstance = createSupabaseClient<Database>(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'saku-auth-token',
      flowType: 'pkce'
    },
    global: {
      headers: {
        'x-client-info': 'saku-store@1.0.0'
      }
    }
  })

  return supabaseInstance
}

// Export default client instance
export default createClient()