'use client'

import { useProductBySlug } from '@/hooks/use-products'
import { useState, useEffect } from 'react'

export default function DebugPage() {
  const [slug, setSlug] = useState('print')
  const { data: product, isLoading, error, isError, isFetching, status } = useProductBySlug(slug)
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    setDebugInfo({
      timestamp: new Date().toISOString(),
      isLoading,
      isFetching,
      isError,
      status,
      hasProduct: !!product,
      hasError: !!error,
      productId: product?.id,
      variantCount: product?.variants?.length,
      availableSizes: product?.available_sizes,
      availableColors: product?.available_colors
    })
  }, [isLoading, isFetching, isError, status, product, error])

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Debug - useProductBySlug</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Slug a probar:</label>
        <input 
          type="text" 
          value={slug} 
          onChange={(e) => setSlug(e.target.value)}
          className="border rounded px-3 py-2 w-64"
          placeholder="Ingresa un slug"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Estado del Hook</h2>
          <div className="bg-gray-100 p-4 rounded">
            <div><strong>Status:</strong> {status}</div>
            <div><strong>isLoading:</strong> {isLoading ? 'true' : 'false'}</div>
            <div><strong>isFetching:</strong> {isFetching ? 'true' : 'false'}</div>
            <div><strong>isError:</strong> {isError ? 'true' : 'false'}</div>
            <div><strong>Timestamp:</strong> {debugInfo.timestamp}</div>
          </div>
          
          {error && (
            <div className="bg-red-100 p-4 rounded">
              <strong>Error:</strong>
              <pre className="mt-2 text-sm">{JSON.stringify(error, null, 2)}</pre>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Datos del Producto</h2>
          {product ? (
            <div className="bg-green-100 p-4 rounded space-y-2">
              <div><strong>✅ Producto encontrado</strong></div>
              <div><strong>ID:</strong> {product.id}</div>
              <div><strong>Nombre:</strong> {product.name}</div>
              <div><strong>Slug:</strong> {product.slug}</div>
              <div><strong>Precio base:</strong> ${product.base_price}</div>
              <div><strong>Descripción:</strong> {product.description ? 'Sí' : 'No'}</div>
              <div><strong>Imágenes:</strong> {product.images?.length || 0}</div>
              <div><strong>Variantes:</strong> {product.variants?.length || 0}</div>
              <div><strong>Stock total:</strong> {product.total_stock || 0}</div>
              <div><strong>Talles disponibles:</strong> [{product.available_sizes?.join(', ') || 'Ninguno'}]</div>
              <div><strong>Colores disponibles:</strong> [{product.available_colors?.join(', ') || 'Ninguno'}]</div>
              <div><strong>Rango de precios:</strong> ${product.price_range?.min} - ${product.price_range?.max}</div>
            </div>
          ) : (
            <div className="bg-yellow-100 p-4 rounded">
              <strong>⚠️ No hay producto</strong>
            </div>
          )}
        </div>
      </div>
      
      {product?.variants && product.variants.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Variantes</h2>
          <div className="bg-gray-50 p-4 rounded">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.variants.slice(0, 6).map((variant, index) => (
                <div key={variant.id} className="bg-white p-3 rounded border">
                  <div className="text-sm">
                    <div><strong>#{index + 1}</strong></div>
                    <div><strong>SKU:</strong> {variant.sku}</div>
                    <div><strong>Talle:</strong> {variant.size}</div>
                    <div><strong>Color:</strong> {variant.color}</div>
                    <div><strong>Stock:</strong> {variant.stock_quantity}</div>
                    <div><strong>En stock:</strong> {variant.is_in_stock ? 'Sí' : 'No'}</div>
                    <div><strong>Activa:</strong> {variant.is_active ? 'Sí' : 'No'}</div>
                  </div>
                </div>
              ))}
            </div>
            {product.variants.length > 6 && (
              <div className="mt-4 text-sm text-gray-600">
                ... y {product.variants.length - 6} variantes más
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}