import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  originalPrice?: number
  image: string
  size?: string | null
  color: string
  quantity: number
  maxStock: number
}

export interface ShippingInfo {
  method: 'national' | 'cordoba'
  postalCode: string
  cost: number
}

export interface CouponInfo {
  code: string
  type: 'percentage' | 'fixed'
  value: number
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  shipping: ShippingInfo | null
  coupon: CouponInfo | null
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  setShipping: (shipping: ShippingInfo | null) => void
  setCoupon: (coupon: CouponInfo | null) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  getDiscountAmount: () => number
  getShippingCost: () => number
  getFinalTotal: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      shipping: null,
      coupon: null,
      
      addItem: (item) => {
        const items = get().items
        const existingItem = items.find(
          (i) => i.productId === item.productId && i.size === item.size && i.color === item.color
        )
        
        if (existingItem) {
          // Limitar la cantidad al stock disponible
          const newQuantity = Math.min(existingItem.quantity + item.quantity, existingItem.maxStock)
          
          set({
            items: items.map((i) =>
              i.id === existingItem.id
                ? { ...i, quantity: newQuantity }
                : i
            ),
          })
        } else {
          const newItem: CartItem = {
            ...item,
            id: `${item.productId}-${item.size}-${item.color}-${Date.now()}`,
          }
          set({ items: [...items, newItem] })
        }
      },
      
      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) })
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        
        const item = get().items.find(item => item.id === id)
        if (item) {
          // Limitar la cantidad al stock disponible
          const newQuantity = Math.min(quantity, item.maxStock)
          
          set({
            items: get().items.map((i) =>
              i.id === id ? { ...i, quantity: newQuantity } : i
            ),
          })
        }
      },
      
      setShipping: (shipping) => {
        set({ shipping })
      },
      
      setCoupon: (coupon) => {
        set({ coupon })
      },
      
      clearCart: () => {
        set({ items: [], shipping: null, coupon: null })
      },
      
      openCart: () => {
        set({ isOpen: true })
      },
      
      closeCart: () => {
        set({ isOpen: false })
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },
      
      getDiscountAmount: () => {
        const { coupon } = get()
        const subtotal = get().getTotalPrice()
        
        if (!coupon) return 0
        
        return coupon.type === 'percentage'
          ? Math.round(subtotal * coupon.value / 100)
          : coupon.value
      },
      
      getShippingCost: () => {
        const { shipping } = get()
        if (!shipping) return 0
        
        // Envío gratis si supera el umbral
        const freeShippingThreshold = 25000
        const subtotal = get().getTotalPrice() - get().getDiscountAmount()
        
        return subtotal >= freeShippingThreshold ? 0 : shipping.cost
      },
      
      getFinalTotal: () => {
        const subtotal = get().getTotalPrice()
        const discount = get().getDiscountAmount()
        const shippingCost = get().getShippingCost()
        
        return subtotal - discount + shippingCost
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)