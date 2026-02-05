import { Skeleton } from "./skeleton";
import { TableSkeleton } from "./table-skeleton";

/**
 * Sayfa Skeleton Bileşeni
 * Tam sayfa yüklenirken gösterilir
 */
export function PageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="w-48 h-8" />
          <Skeleton className="w-64 h-4" />
        </div>
        <Skeleton className="w-32 h-10" />
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Skeleton className="w-64 h-10" />
        <Skeleton className="w-32 h-10" />
        <Skeleton className="w-32 h-10" />
      </div>

      {/* Table */}
      <TableSkeleton rows={10} columns={6} />

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <Skeleton className="w-32 h-4" />
        <div className="flex gap-2">
          <Skeleton className="w-8 h-8" />
          <Skeleton className="w-8 h-8" />
          <Skeleton className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
}

/**
 * Dashboard Skeleton
 * Dashboard sayfası için
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2 p-6 border rounded-lg">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-16 h-8" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
        <div className="space-y-4 p-6 border rounded-lg">
          <Skeleton className="w-32 h-6" />
          <Skeleton className="w-full h-64" />
        </div>
        <div className="space-y-4 p-6 border rounded-lg">
          <Skeleton className="w-32 h-6" />
          <Skeleton className="w-full h-64" />
        </div>
      </div>
    </div>
  );
}
