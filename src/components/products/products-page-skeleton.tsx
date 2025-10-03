export function ProductsPageSkeleton() {
  return (
    <>
      {/* Toolbar Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="h-10 bg-gray-200 rounded w-48 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-20 animate-pulse" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar Skeleton */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
              <div className="h-10 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Products Grid Skeleton */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination Skeleton */}
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <div className="h-10 bg-gray-200 rounded w-10 animate-pulse" />
              <div className="h-10 bg-gray-200 rounded w-10 animate-pulse" />
              <div className="h-10 bg-gray-200 rounded w-10 animate-pulse" />
              <div className="h-10 bg-gray-200 rounded w-10 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}