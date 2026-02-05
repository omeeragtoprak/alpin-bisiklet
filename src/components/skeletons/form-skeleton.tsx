import { Skeleton } from "./skeleton";

interface FormSkeletonProps {
  fields?: number;
}

/**
 * Form Skeleton Bileşeni
 * Form yüklenirken gösterilir
 */
export function FormSkeleton({ fields = 4 }: FormSkeletonProps) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-full h-10" />
        </div>
      ))}
      <div className="flex gap-4 pt-4">
        <Skeleton className="w-24 h-10" />
        <Skeleton className="w-24 h-10" />
      </div>
    </div>
  );
}
