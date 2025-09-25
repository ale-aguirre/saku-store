// Mock data for development when Supabase is not available
import { Product } from '@/hooks/use-products'

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Brasier Comfort',
    description: 'Brasier cómodo y elegante para uso diario. Confeccionado con materiales de alta calidad que brindan soporte y comodidad durante todo el día.',
    category: 'brasieres',
    image_url: '/productos/brasier-comfort.jpg',
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
    image_url: '/productos/brasier-pushup.jpg',
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
    image_url: '/productos/conjunto-elegance.jpg',
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
  },
  {
    id: '4',
    name: 'Conjunto Romantic',
    description: 'Conjunto romántico con detalles de encaje y bordados delicados. Ideal para momentos especiales.',
    category: 'conjuntos',
    image_url: '/productos/conjunto-romantic.jpg',
    is_active: true,
    created_at: '2024-01-30T10:00:00Z',
    updated_at: '2024-01-30T10:00:00Z',
    product_variants: [
      {
        id: '4-85-rojo',
        product_id: '4',
        size: '85',
        color: 'rojo',
        price: 28000,
        compare_at_price: 32000,
        stock_quantity: 4,
        sku: 'CR-85-ROJ',
        is_active: true,
        created_at: '2024-01-30T10:00:00Z',
        updated_at: '2024-01-30T10:00:00Z'
      },
      {
        id: '4-90-rojo',
        product_id: '4',
        size: '90',
        color: 'rojo',
        price: 28000,
        compare_at_price: 32000,
        stock_quantity: 6,
        sku: 'CR-90-ROJ',
        is_active: true,
        created_at: '2024-01-30T10:00:00Z',
        updated_at: '2024-01-30T10:00:00Z'
      },
      {
        id: '4-85-blanco',
        product_id: '4',
        size: '85',
        color: 'blanco',
        price: 28000,
        compare_at_price: null,
        stock_quantity: 3,
        sku: 'CR-85-BLA',
        is_active: true,
        created_at: '2024-01-30T10:00:00Z',
        updated_at: '2024-01-30T10:00:00Z'
      }
    ]
  },
  {
    id: '5',
    name: 'Conjunto Praga',
    description: 'Conjunto elegante con diseño moderno y materiales premium. Comodidad y estilo en una sola pieza.',
    category: 'conjuntos',
    image_url: '/productos/conjunto_praga.jpg',
    is_active: true,
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-01T10:00:00Z',
    product_variants: [
      {
        id: '5-85-negro',
        product_id: '5',
        size: '85',
        color: 'negro',
        price: 26000,
        compare_at_price: null,
        stock_quantity: 8,
        sku: 'CP-85-NEG',
        is_active: true,
        created_at: '2024-02-01T10:00:00Z',
        updated_at: '2024-02-01T10:00:00Z'
      },
      {
        id: '5-90-negro',
        product_id: '5',
        size: '90',
        color: 'negro',
        price: 26000,
        compare_at_price: null,
        stock_quantity: 5,
        sku: 'CP-90-NEG',
        is_active: true,
        created_at: '2024-02-01T10:00:00Z',
        updated_at: '2024-02-01T10:00:00Z'
      }
    ]
  },
  {
    id: '6',
    name: 'Body Agatha',
    description: 'Body elegante con diseño sofisticado. Perfecto para usar solo o como base para otros outfits.',
    category: 'bodies',
    image_url: '/productos/body_agatha.jpg',
    is_active: true,
    created_at: '2024-02-05T10:00:00Z',
    updated_at: '2024-02-05T10:00:00Z',
    product_variants: [
      {
        id: '6-85-negro',
        product_id: '6',
        size: '85',
        color: 'negro',
        price: 22000,
        compare_at_price: 25000,
        stock_quantity: 7,
        sku: 'BA-85-NEG',
        is_active: true,
        created_at: '2024-02-05T10:00:00Z',
        updated_at: '2024-02-05T10:00:00Z'
      },
      {
        id: '6-90-negro',
        product_id: '6',
        size: '90',
        color: 'negro',
        price: 22000,
        compare_at_price: 25000,
        stock_quantity: 4,
        sku: 'BA-90-NEG',
        is_active: true,
        created_at: '2024-02-05T10:00:00Z',
        updated_at: '2024-02-05T10:00:00Z'
      },
      {
        id: '6-95-negro',
        product_id: '6',
        size: '95',
        color: 'negro',
        price: 22000,
        compare_at_price: 25000,
        stock_quantity: 3,
        sku: 'BA-95-NEG',
        is_active: true,
        created_at: '2024-02-05T10:00:00Z',
        updated_at: '2024-02-05T10:00:00Z'
      }
    ]
  },
  {
    id: '7',
    name: 'Bombacha Picco',
    description: 'Bombacha cómoda y versátil para uso diario. Diseño clásico con materiales suaves y transpirables.',
    category: 'bombachas',
    image_url: '/productos/bombacha_picco.webp',
    is_active: true,
    created_at: '2024-02-10T10:00:00Z',
    updated_at: '2024-02-10T10:00:00Z',
    product_variants: [
      {
        id: '7-unico-negro',
        product_id: '7',
        size: null,
        color: 'negro',
        price: 8000,
        compare_at_price: null,
        stock_quantity: 15,
        sku: 'BP-UNI-NEG',
        is_active: true,
        created_at: '2024-02-10T10:00:00Z',
        updated_at: '2024-02-10T10:00:00Z'
      },
      {
        id: '7-unico-blanco',
        product_id: '7',
        size: null,
        color: 'blanco',
        price: 8000,
        compare_at_price: null,
        stock_quantity: 12,
        sku: 'BP-UNI-BLA',
        is_active: true,
        created_at: '2024-02-10T10:00:00Z',
        updated_at: '2024-02-10T10:00:00Z'
      },
      {
        id: '7-unico-rojo',
        product_id: '7',
        size: null,
        color: 'rojo',
        price: 8000,
        compare_at_price: null,
        stock_quantity: 10,
        sku: 'BP-UNI-ROJ',
        is_active: true,
        created_at: '2024-02-10T10:00:00Z',
        updated_at: '2024-02-10T10:00:00Z'
      }
    ]
  },
  {
    id: '8',
    name: 'Liguero Sienna',
    description: 'Liguero elegante con detalles de encaje. Perfecto para ocasiones especiales y momentos íntimos.',
    category: 'ligueros',
    image_url: '/productos/liguero_sienna.jpg',
    is_active: true,
    created_at: '2024-02-15T10:00:00Z',
    updated_at: '2024-02-15T10:00:00Z',
    product_variants: [
      {
        id: '8-unico-negro',
        product_id: '8',
        size: null,
        color: 'negro',
        price: 12000,
        compare_at_price: 15000,
        stock_quantity: 6,
        sku: 'LS-UNI-NEG',
        is_active: true,
        created_at: '2024-02-15T10:00:00Z',
        updated_at: '2024-02-15T10:00:00Z'
      },
      {
        id: '8-unico-rojo',
        product_id: '8',
        size: null,
        color: 'rojo',
        price: 12000,
        compare_at_price: 15000,
        stock_quantity: 4,
        sku: 'LS-UNI-ROJ',
        is_active: true,
        created_at: '2024-02-15T10:00:00Z',
        updated_at: '2024-02-15T10:00:00Z'
      },
      {
        id: '8-unico-blanco',
        product_id: '8',
        size: null,
        color: 'blanco',
        price: 12000,
        compare_at_price: null,
        stock_quantity: 8,
        sku: 'LS-UNI-BLA',
        is_active: true,
        created_at: '2024-02-15T10:00:00Z',
        updated_at: '2024-02-15T10:00:00Z'
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