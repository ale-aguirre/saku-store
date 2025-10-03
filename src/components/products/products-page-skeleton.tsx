import { LoadingSpinner } from '@/components/ui/loading-spinner'

export function ProductsPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Loading indicator */}
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando productos..." />
      </div>
    </div>
  )
}