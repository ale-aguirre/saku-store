import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea un precio en pesos argentinos
 * @param price - Precio en pesos
 * @returns Precio formateado como string (ej: "$3.280")
 */
export function formatPrice(price: number | null | undefined): string {
  // Validar que el precio sea un número válido
  if (price === null || price === undefined || isNaN(price)) {
    return '$0'
  }
  
  return `$${price.toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`
}
