import { render } from '@testing-library/react'
import { screen } from '@testing-library/dom'
import { ProductCard } from '@/components/product/product-card'
import { ProductWithVariantsAndStock } from '@/types/catalog'
import { vi } from 'vitest'

// Mock de useCart y useWishlist
vi.mock('@/hooks/use-cart', () => ({
  useCart: () => ({
    addItem: vi.fn(),
    openCart: vi.fn(),
  }),
}))

vi.mock('@/hooks/use-wishlist', () => ({
  useWishlist: () => ({
    isInWishlist: vi.fn(() => false),
    toggleWishlist: vi.fn(),
  }),
}))

const mockProduct: ProductWithVariantsAndStock = {
  id: '1',
  name: 'Conjunto Encaje Negro',
  slug: 'conjunto-encaje-negro',
  description: 'Elegante conjunto de lencería en encaje negro con detalles delicados',
  base_price: 8500,
  category_id: 'conjuntos',
  is_active: true,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  images: ['/images/conjunto-encaje-negro-1.jpg'],
  material: null,
  care_instructions: null,
  size_guide: null,
  meta_title: null,
  meta_description: null,
  is_featured: false,
  variants: [
    {
      id: 'v1',
      product_id: '1',
      size: '90',
      color: 'Negro',
      sku: 'CONJ-ENCAJE-NEGRO-90-NEGRO',
      price_adjustment: 0,
      stock_quantity: 10,
      is_active: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      material: null,
      low_stock_threshold: 5,
      price: 8500,
      images: null,
      compare_at_price: null,
      is_in_stock: true,
      is_low_stock: false,
    },
  ],
  available_sizes: ['85', '90', '95', '100'],
  available_colors: ['Negro'],
  price_range: { min: 8500, max: 8500 },
  total_stock: 10,
}

describe('ProductCard Description', () => {
  it('should display product description instead of sizes', () => {
    render(<ProductCard product={mockProduct} />)
    
    // Verificar que la descripción se muestra
    expect(screen.getByText(/Elegante conjunto de lencería en encaje negro/)).toBeInTheDocument()
    
    // Verificar que los talles NO se muestran
    expect(screen.queryByText(/Talles:/)).not.toBeInTheDocument()
  })

  it('should not display description section when product has no description', () => {
    const productWithoutDescription = {
      ...mockProduct,
      description: null,
    }
    
    render(<ProductCard product={productWithoutDescription} />)
    
    // Verificar que no hay sección de descripción
    expect(screen.queryByText(/Elegante conjunto/)).not.toBeInTheDocument()
  })

  it('should truncate long descriptions with line-clamp-2', () => {
    const productWithLongDescription = {
      ...mockProduct,
      description: 'Esta es una descripción muy larga que debería ser truncada después de dos líneas para mantener un diseño consistente en las tarjetas de producto y evitar que el texto ocupe demasiado espacio visual.',
    }
    
    const { container } = render(<ProductCard product={productWithLongDescription} />)
    
    // Verificar que el elemento tiene la clase line-clamp-2
    const descriptionElement = container.querySelector('.line-clamp-2')
    expect(descriptionElement).toBeInTheDocument()
    expect(descriptionElement).toHaveTextContent(productWithLongDescription.description)
  })
})