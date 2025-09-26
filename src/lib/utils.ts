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
export function formatPrice(price: number): string {
  return `$${price.toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`
}
