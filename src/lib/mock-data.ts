// Mock data for development when Supabase is not available
import { Product } from '@/hooks/use-products'

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Brasier Comfort',
    description: 'Brasier cómodo y elegante para uso diario. Confeccionado con materiales de alta calidad que brindan soporte y comodidad durante todo el día.',
    category: 'brasieres',
    image_url: '/productos/brasier-comfort.svg',
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    product_variants: [
      {
        id: '1-85-negro',
        product_id: '1',
        size: '85',
        color: 'negro',
        price: 15000,
        compare_at_price: 18000,
        stock_quantity: 10,
        sku: 'BC-85-NEG',
        is_active: true,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      },
      {
        id: '1-90-negro',
        product_id: '1',
        size: '90',
        color: 'negro',
        price: 15000,
        compare_at_price: 18000,
        stock_quantity: 8,
        sku: 'BC-90-NEG',
        is_active: true,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      },
      {
        id: '1-85-blanco',
        product_id: '1',
        size: '85',
        color: 'blanco',
        price: 15000,
        compare_at_price: null,
        stock_quantity: 5,
        sku: 'BC-85-BLA',
        is_active: true,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      }
    ]
  },
  {
    id: '2',
    name: 'Brasier Push-Up',
    description: 'Brasier con realce que resalta tu figura natural. Diseño moderno con encaje delicado y copas moldeadas.',
    category: 'brasieres',
    image_url: '/productos/brasier-pushup.svg',
    is_active: true,
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z',
    product_variants: [
      {
        id: '2-85-rojo',
        product_id: '2',
        size: '85',
        color: 'rojo',
        price: 18000,
        compare_at_price: null,
        stock_quantity: 12,
        sku: 'BP-85-ROJ',
        is_active: true,
        created_at: '2024-01-20T10:00:00Z',
        updated_at: '2024-01-20T10:00:00Z'
      },
      {
        id: '2-90-rojo',
        product_id: '2',
        size: '90',
        color: 'rojo',
        price: 18000,
        compare_at_price: null,
        stock_quantity: 7,
        sku: 'BP-90-ROJ',
        is_active: true,
        created_at: '2024-01-20T10:00:00Z',
        updated_at: '2024-01-20T10:00:00Z'
      }
    ]
  },
  {
    id: '3',
    name: 'Conjunto Elegance',
    description: 'Conjunto completo de brasier y bombacha con encaje francés. Perfecto para ocasiones especiales.',
    category: 'conjuntos',
    image_url: '/productos/conjunto-elegance.svg',
    is_active: true,
    created_at: '2024-01-25T10:00:00Z',
    updated_at: '2024-01-25T10:00:00Z',
    product_variants: [
      {
        id: '3-85-negro',
        product_id: '3',
        size: '85',
        color: 'negro',
        price: 25000,
        compare_at_price: 30000,
        stock_quantity: 6,
        sku: 'CE-85-NEG',
        is_active: true,
        created_at: '2024-01-25T10:00:00Z',
        updated_at: '2024-01-25T10:00:00Z'
      }
    ]
  }
]

export const mockCoupons = [
  {
    id: 'BIENVENIDA15',
    code: 'BIENVENIDA15',
    discount_type: 'percentage' as const,
    discount_value: 15,
    minimum_amount: 10000,
    is_active: true,
    usage_limit: null,
    used_count: 0,
    expires_at: '2024-12-31T23:59:59Z'
  },
  {
    id: 'ENVIOGRATIS',
    code: 'ENVIOGRATIS',
    discount_type: 'fixed' as const,
    discount_value: 2500,
    minimum_amount: 20000,
    is_active: true,
    usage_limit: 100,
    used_count: 25,
    expires_at: '2024-06-30T23:59:59Z'
  }
]