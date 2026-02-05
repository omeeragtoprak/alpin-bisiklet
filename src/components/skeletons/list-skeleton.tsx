import { Skeleton } from "./skeleton";

interface ListSkeletonProps {
  count?: number;
}

/**
 * Liste Skeleton Bileşeni
 * Liste verisi yüklenirken gösterilir
 */
export function ListSkeleton({ count = 5 }: ListSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}
