import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea un precio en pesos argentinos
 * @param price - Precio en centavos (se divide por 100 para mostrar en pesos)
 * @returns Precio formateado como string (ej: "$32.800")
 */
export function formatPrice(price: number | null | undefined): string {
  // Validar que el precio sea un número válido
  if (price === null || price === undefined || isNaN(price)) {
    return '$0'
  }
  
  // Convertir de centavos a pesos dividiendo por 100
  const priceInPesos = price / 100
  
  return `$${priceInPesos.toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`
}
