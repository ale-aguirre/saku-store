import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea un precio para mostrar en la UI
 * @param price - Precio almacenado en la DB (se divide por 100 para mostrar en pesos)
 * @returns Precio formateado como string (ej: "$32.400")
 */
export function formatPrice(price: number | null | undefined): string {
  // Validar que el precio sea un número válido
  if (price === null || price === undefined || isNaN(price)) {
    return '$0'
  }
  
  // Convertir a pesos dividiendo por 100 (formato de almacenamiento en centavos)
  const priceInPesos = price / 100
  
  return `$${priceInPesos.toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`
}
