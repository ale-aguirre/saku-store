import { render } from '@testing-library/react'
import { screen } from '@testing-library/dom'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { useCart } from '@/hooks/use-cart'
import { vi } from 'vitest'

// Mock del hook useCart
vi.mock('@/hooks/use-cart')
const mockUseCart = useCart as any

// Mock de next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />
}))

// Mock de next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>
}))

describe('CartDrawer Close Button', () => {
  beforeEach(() => {
    mockUseCart.mockReturnValue({
      items: [],
      isOpen: true,
      shipping: null,
      coupon: null,
      addItem: vi.fn(),
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      setShipping: vi.fn(),
      setCoupon: vi.fn(),
      clearCart: vi.fn(),
      openCart: vi.fn(),
      closeCart: vi.fn(),
      getTotalItems: () => 0,
      getTotalPrice: () => 0,
      getDiscountAmount: () => 0,
      getShippingCost: () => 0,
      getFinalTotal: () => 0
    })
  })

  it('should have only one close button (the automatic one from SheetContent)', () => {
    render(
      <CartDrawer>
        <button>Open Cart</button>
      </CartDrawer>
    )

    // Verificar que NO existe el botón personalizado que causaba la superposición
    const customCloseButton = screen.queryByTestId('cart-close-button')
    expect(customCloseButton).not.toBeInTheDocument()

    // Verificar que el título del carrito existe sin el botón personalizado
    const cartTitle = screen.getByText(/Carrito \(0 productos\)/)
    expect(cartTitle).toBeInTheDocument()
  })

  it('should display cart title with correct item count', () => {
    mockUseCart.mockReturnValue({
      items: [
        {
          id: '1',
          productId: 'prod-1',
          variantId: 'var-1',
          name: 'Test Product',
          size: '90',
          color: 'Negro',
          price: 1000,
          quantity: 2,
          image: '/test-image.jpg'
        }
      ],
      isOpen: true,
      shipping: null,
      coupon: null,
      addItem: vi.fn(),
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      setShipping: vi.fn(),
      setCoupon: vi.fn(),
      clearCart: vi.fn(),
      openCart: vi.fn(),
      closeCart: vi.fn(),
      getTotalItems: () => 2,
      getTotalPrice: () => 2000,
      getDiscountAmount: () => 0,
      getShippingCost: () => 0,
      getFinalTotal: () => 2000
    })

    render(
      <CartDrawer>
        <button>Open Cart</button>
      </CartDrawer>
    )

    // Verificar que el título muestra el conteo correcto
    const cartTitle = screen.getByText(/Carrito \(2 productos\)/)
    expect(cartTitle).toBeInTheDocument()
  })

  it('should display singular form for single item', () => {
    mockUseCart.mockReturnValue({
      items: [
        {
          id: '1',
          productId: 'prod-1',
          variantId: 'var-1',
          name: 'Test Product',
          size: '90',
          color: 'Negro',
          price: 1000,
          quantity: 1,
          image: '/test-image.jpg'
        }
      ],
      isOpen: true,
      shipping: null,
      coupon: null,
      addItem: vi.fn(),
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      setShipping: vi.fn(),
      setCoupon: vi.fn(),
      clearCart: vi.fn(),
      openCart: vi.fn(),
      closeCart: vi.fn(),
      getTotalItems: () => 1,
      getTotalPrice: () => 1000,
      getDiscountAmount: () => 0,
      getShippingCost: () => 0,
      getFinalTotal: () => 1000
    })

    render(
      <CartDrawer>
        <button>Open Cart</button>
      </CartDrawer>
    )

    // Verificar que el título muestra la forma singular
    const cartTitle = screen.getByText(/Carrito \(1 producto\)/)
    expect(cartTitle).toBeInTheDocument()
  })
})