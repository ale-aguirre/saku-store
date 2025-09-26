/* eslint-disable @next/next/no-img-element */
"use client";

import { ProductImage } from "@/components/ui/product-image";

export function PlaceholderTest() {
  return (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold">Test de Placeholder</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Test 1: URL que no existe */}
        <div className="space-y-2">
          <h3 className="font-semibold">
            1. URL inexistente (debería mostrar placeholder generado)
          </h3>
          <ProductImage
            src="/images/no-existe.jpg"
            alt="Test imagen inexistente"
            width={200}
            height={200}
            className="border"
          />
        </div>

        {/* Test 2: Placeholder SVG estático */}
        <div className="space-y-2">
          <h3 className="font-semibold">2. Placeholder SVG estático</h3>
          <ProductImage
            src="/images/placeholder-product.svg"
            alt="Test placeholder SVG"
            width={200}
            height={200}
            className="border"
          />
        </div>

        {/* Test 3: Imagen real que existe */}
        <div className="space-y-2">
          <h3 className="font-semibold">3. Imagen real existente</h3>
          <ProductImage
            src="/productos/brasier-comfort.jpg"
            alt="Test imagen real"
            width={200}
            height={200}
            className="border"
          />
        </div>
      </div>

      <div className="mt-8">
        <h3 className="font-semibold mb-4">Test directo con img tag:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p>Placeholder SVG directo:</p>
            <img
              src="/images/placeholder-product.svg"
              alt="Placeholder directo"
              width={200}
              height={200}
              className="border"
            />
          </div>
          <div>
            <p>Imagen inexistente:</p>
            <img
              src="/images/no-existe.jpg"
              alt="No existe"
              width={200}
              height={200}
              className="border"
            />
          </div>
          <div>
            <p>Imagen real:</p>
            <img
              src="/productos/brasier-comfort.jpg"
              alt="Real"
              width={200}
              height={200}
              className="border"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
