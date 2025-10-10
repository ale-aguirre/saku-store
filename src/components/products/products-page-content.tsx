"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Grid, List } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { ProductPagination } from "@/components/product/product-pagination";
import { ProductFilters } from "@/components/product/product-filters";
import { ProductsPageSkeleton } from "@/components/products/products-page-skeleton";
import {
  useProducts,
  useProductCategories,
  usePriceRange,
} from "@/hooks/use-products";
import { useDebounce } from "@/hooks/use-debounce";
import type { SortOption } from "@/types/catalog";

interface ProductsPageContentProps {
  initialFilters: {
    category_id?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sizes?: string[];
    colors?: string[];
    inStock?: boolean;
    is_featured?: boolean;
    onSale?: boolean;
    discountPercentageMin?: number;
  };
  initialSortBy: string;
  initialPage: number;
}

export function ProductsPageContent({
  initialFilters,
  initialSortBy,
  initialPage,
}: ProductsPageContentProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Estado local para filtros y paginación
  const [filters, setFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Debounce para búsquedas y filtros de precio para reducir consultas
  const debouncedSearch = useDebounce(filters.search, 500);
  const debouncedMinPrice = useDebounce(filters.minPrice, 800);
  const debouncedMaxPrice = useDebounce(filters.maxPrice, 800);

  // Forzar un refetch en el montaje para evitar casos donde la primera navegación
  // no dispara la carga de productos por hidratación/estado del cliente.
  // TanStack Query debería iniciar automáticamente, pero este refuerzo
  // cubre casos intermitentes de navegación inicial.
  // Obtener categorías para el filtro (con prefetch)
  const { data: categories = [] } = useProductCategories();

  // Obtener rango de precios (con prefetch)
  const { data: priceRange } = usePriceRange();

  // Obtener productos con filtros aplicados (usando valores debounced)
  const {
    data: productsData,
    isLoading,
    error,
    refetch,
  } = useProducts({
    categoryId: filters.category_id,
    search: debouncedSearch,
    sizes: filters.sizes,
    colors: filters.colors,
    minPrice: debouncedMinPrice,
    maxPrice: debouncedMaxPrice,
    sortBy: sortBy as SortOption,
    page: currentPage,
    limit: 12,
    inStockOnly: filters.inStock,
    onSale: filters.onSale,
    discountPercentageMin: filters.discountPercentageMin,
  });

  // Refuerzo inicial de carga para casos intermitentes de navegación
  useEffect(() => {
    // refetch protegido: sólo si la función existe
    // (la referencia es estable por TanStack Query)
    // Evitar doble carga significativa: react-query deduplica por queryKey.
    refetch?.();
  }, [refetch]);

  // Extraer datos de la respuesta
  const products = productsData?.products || [];
  const totalProducts = productsData?.totalItems || 0;
  const totalPages = productsData?.totalPages || 1;

  // Función para actualizar URL con parámetros
  const updateURL = useCallback(
    (newFilters: typeof filters, newSortBy: string, newPage: number) => {
      const params = new URLSearchParams();

      if (newFilters.category_id)
        params.set("categoria", newFilters.category_id);
      if (newFilters.search) params.set("buscar", newFilters.search);
      if (newFilters.minPrice)
        params.set("precio_min", newFilters.minPrice.toString());
      if (newFilters.maxPrice)
        params.set("precio_max", newFilters.maxPrice.toString());
      if (newFilters.sizes?.length)
        params.set("tallas", newFilters.sizes.join(","));
      if (newFilters.colors?.length)
        params.set("colores", newFilters.colors.join(","));
      if (newFilters.inStock !== undefined)
        params.set("stock", newFilters.inStock.toString());
      if (newFilters.is_featured) params.set("destacados", "true");
      if (newFilters.onSale) params.set("oferta", "true");
      if (newFilters.discountPercentageMin)
        params.set(
          "descuento_min",
          newFilters.discountPercentageMin.toString()
        );
      if (newSortBy !== "featured") params.set("orden", newSortBy);
      if (newPage > 1) params.set("pagina", newPage.toString());

      const newURL = params.toString() ? `?${params.toString()}` : "/productos";
      router.push(newURL, { scroll: false });
    },
    [router]
  );

  // Manejar cambios en filtros
  const handleFiltersChange = useCallback(
    (newFilters: Partial<typeof filters>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);
      setCurrentPage(1); // Reset a primera página
      updateURL(updatedFilters, sortBy, 1);
    },
    [filters, sortBy, updateURL]
  );

  // Manejar cambio de ordenamiento
  const handleSortChange = useCallback(
    (newSortBy: string) => {
      setSortBy(newSortBy);
      setCurrentPage(1); // Reset a primera página
      updateURL(filters, newSortBy, 1);
    },
    [filters, updateURL]
  );

  // Manejar cambio de página
  const handlePageChange = useCallback(
    (newPage: number) => {
      setCurrentPage(newPage);
      updateURL(filters, sortBy, newPage);
    },
    [filters, sortBy, updateURL]
  );

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    const clearedFilters = {
      category_id: undefined,
      search: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      sizes: undefined,
      colors: undefined,
      inStock: undefined,
      is_featured: undefined,
      onSale: undefined,
      discountPercentageMin: undefined,
    };
    setFilters(clearedFilters);
    setSortBy("featured");
    setCurrentPage(1);
    router.push("/productos");
  }, [router]);

  // Verificar si hay filtros activos
  const hasActiveFilters = Boolean(
    filters.category_id ||
      filters.search ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.sizes?.length ||
      filters.colors?.length ||
      filters.inStock !== undefined ||
      filters.is_featured ||
      filters.onSale ||
      filters.discountPercentageMin
  );

  // Función estable para refetch
  const stableRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  // Si hay error, intentar refetch automáticamente
  useEffect(() => {
    if (error) {
      console.error("Error loading products:", error);
      // Intentar refetch después de 3 segundos
      const timeoutId = setTimeout(() => {
        stableRefetch();
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  }, [error, stableRefetch]);

  // Mostrar skeleton si estamos cargando y aún no hay datos
  if (isLoading && !products?.length) {
    return <ProductsPageSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Error al cargar productos</h2>
        <p className="text-muted-foreground mb-4">
          Hubo un problema al cargar los productos. Reintentando
          automáticamente...
        </p>
        <Button onClick={() => refetch()}>Reintentar ahora</Button>
      </div>
    );
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {isLoading
              ? "Cargando..."
              : `${totalProducts} productos encontrados`}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Destacados</SelectItem>
              <SelectItem value="price_asc">Precio: Menor a Mayor</SelectItem>
              <SelectItem value="price_desc">Precio: Mayor a Menor</SelectItem>
              <SelectItem value="newest">Más Nuevos</SelectItem>
              <SelectItem value="name">Nombre A-Z</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className="border-r"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <ProductFilters
              filters={{
                category_id: filters.category_id,
                search: filters.search,
                size: filters.sizes?.[0],
                color: filters.colors?.[0],
                min_price: filters.minPrice,
                max_price: filters.maxPrice,
                in_stock_only: filters.inStock,
                on_sale: filters.onSale,
                discount_percentage_min: filters.discountPercentageMin,
              }}
              onFiltersChange={(newFilters) => {
                handleFiltersChange({
                  category_id: newFilters.category_id,
                  search: newFilters.search,
                  sizes: newFilters.size ? [newFilters.size] : undefined,
                  colors: newFilters.color ? [newFilters.color] : undefined,
                  minPrice: newFilters.min_price,
                  maxPrice: newFilters.max_price,
                  inStock: newFilters.in_stock_only,
                  onSale: newFilters.on_sale,
                  discountPercentageMin: newFilters.discount_percentage_min,
                });
              }}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
              availableCategories={categories}
              priceRange={priceRange}
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div
              className={`grid gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">
                No se encontraron productos
              </h3>
              <p className="text-muted-foreground mb-4">
                Intenta ajustar los filtros para encontrar lo que buscas.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            </div>
          )}

          {/* Paginación */}
          {!isLoading && products && products.length > 0 && totalPages > 1 && (
            <ProductPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </>
  );
}
