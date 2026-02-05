import { Skeleton } from "./skeleton";

/**
 * Kart Skeleton Bileşeni
 * Kart içeriği yüklenirken gösterilir
 */
export function CardSkeleton() {
  return (
    <div className="space-y-4 p-6 border rounded-lg">
      <Skeleton className="w-3/4 h-6" />
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-5/6 h-4" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="w-20 h-8" />
        <Skeleton className="w-20 h-8" />
      </div>
    </div>
  );
}

/**
 * Kart Grid Skeleton
 * Birden fazla kart için
 */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
