import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/**
 * Base Skeleton Bileşeni
 * Animasyonlu placeholder için kullanılır
 */
export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("animate-pulse rounded-md bg-gray-200", className)} />;
}
