// Mock data for development when Supabase is not available
import type { Database } from '@/types/database'

type Product = Database['public']['Tables']['products']['Row']

export const mockProducts: Product[] = [
  // No mock products - use real data from Supabase
];

export const mockCoupons = [
  {
    id: "BIENVENIDA15",
    code: "BIENVENIDA15",
    discount_type: "percentage" as const,
    discount_value: 15,
    minimum_amount: 10000,
    is_active: true,
    usage_limit: null,
    used_count: 0,
    expires_at: "2024-12-31T23:59:59Z",
  },
  {
    id: "ENVIOGRATIS",
    code: "ENVIOGRATIS",
    discount_type: "fixed" as const,
    discount_value: 2500,
    minimum_amount: 20000,
    is_active: true,
    usage_limit: 100,
    used_count: 25,
    expires_at: "2024-06-30T23:59:59Z",
  },
];
