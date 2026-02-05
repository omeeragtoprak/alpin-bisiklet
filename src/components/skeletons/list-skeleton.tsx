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
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="rounded-full w-10 h-10" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-1/3 h-4" />
            <Skeleton className="w-1/2 h-3" />
          </div>
          <Skeleton className="w-16 h-8" />
        </div>
      ))}
    </div>
  );
}
